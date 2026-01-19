import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendPurchaseToMeta } from '@/lib/meta-capi'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export async function GET() {
  console.log('🔍 [WEBHOOK] GET recebido')
  
  return NextResponse.json({ 
    status: 'OK',
    message: 'Webhook do Stripe está funcionando',
    timestamp: new Date().toISOString(),
    config: {
      webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripe_key_configured: !!process.env.STRIPE_SECRET_KEY,
      webhook_secret_prefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 8) || 'NOT_SET'
    }
  }, { status: 200 })
}

export async function POST(req: Request) {
  console.log('🎯 [WEBHOOK] POST recebido')
  
  try {
    const body = await req.text()
    
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ [WEBHOOK] Sem assinatura')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ [WEBHOOK] STRIPE_WEBHOOK_SECRET não configurado')
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
      console.log('✅ [WEBHOOK] Evento válido:', event.type)
    } catch (err: any) {
      console.error('❌ [WEBHOOK] Verificação falhou:', err.message)
      return NextResponse.json({ error: `Verification failed: ${err.message}` }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    try {
      switch (event.type) {
        
        // EVENTO 1: Checkout concluído (primeira compra)
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          
          console.log('💳 [WEBHOOK] Checkout concluído')
          console.log('Customer ID:', session.customer)
          console.log('Subscription ID:', session.subscription)
          console.log('Metadata:', session.metadata)

          if (!session.customer || !session.subscription) {
            console.error('❌ [WEBHOOK] Faltam customer ou subscription')
            break
          }

          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          const userId = session.metadata?.supabase_user_id

          if (!userId) {
            console.error('❌ [WEBHOOK] Falta supabase_user_id nos metadata')
            break
          }

          // Buscar subscription para pegar plan
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0].price.id
          
          // Determinar o plano baseado no price_id
          let plan = 'monthly'
          if (priceId === process.env.STRIPE_PRICE_ID_ANNUAL) {
            plan = 'annual'
          }

          console.log('📝 [WEBHOOK] Atualizando profile:', userId)
          console.log('Plan:', plan)

          // PASSO 1: Atualizar tabela profiles
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_tier: 'premium',
              subscription_plan: plan,
              subscription_start_date: new Date().toISOString(),
            })
            .eq('id', userId)

          if (profileError) {
            console.error('❌ [WEBHOOK] Erro ao atualizar profile:', profileError)
          } else {
            console.log('✅ [WEBHOOK] Profile atualizado com sucesso')
          }

          // PASSO 2: Atualizar user_metadata (FONTE DA VERDADE)
          const { error: metadataError } = await supabase.auth.admin.updateUserById(
            userId,
            {
              user_metadata: {
                subscription_tier: 'premium',
                subscription_plan: plan,
                stripe_customer_id: customerId,
              }
            }
          )

          if (metadataError) {
            console.error('❌ [WEBHOOK] Erro ao atualizar metadata:', metadataError)
          } else {
            console.log('✅ [WEBHOOK] User metadata atualizado com sucesso')
          }

          // PASSO 3: Integração Meta CAPI e Supabase Conversions
          console.log('📊 [WEBHOOK] Iniciando integração Meta CAPI e Supabase conversions')
          
          try {
            // Buscar dados do customer
            console.log('👤 [WEBHOOK] Buscando dados do customer:', customerId)
            const customer = await stripe.customers.retrieve(customerId)
            
            if (typeof customer === 'string' || customer.deleted) {
              console.error('❌ [WEBHOOK] Customer não encontrado ou deletado')
              break
            }

            console.log('✅ [WEBHOOK] Customer encontrado:', {
              email: customer.email,
              name: customer.name,
              phone: customer.phone
            })

            // Subscription já foi buscada anteriormente, vamos usá-la
            console.log('📋 [WEBHOOK] Dados da subscription:', {
              id: subscription.id,
              metadata: subscription.metadata
            })

            // Preparar dados para Meta CAPI
            const customerName = customer.name || ''
            const firstName = customerName.split(' ')[0] || undefined
            const lastName = customerName.split(' ').slice(1).join(' ') || undefined

            const metaCapiData = {
              email: customer.email || '',
              phone: customer.phone || undefined,
              firstName: firstName,
              lastName: lastName,
              fbp: subscription.metadata.fbp || undefined,
              fbc: subscription.metadata.fbc || undefined,
              ipAddress: subscription.metadata.ip_address || undefined,
              userAgent: subscription.metadata.user_agent || undefined,
              amount: (session.amount_total || 0) / 100,
              currency: (session.currency || 'brl').toUpperCase(),
              transactionId: session.id,
              creative: session.metadata?.creative || undefined,
              campaign: session.metadata?.campaign || undefined,
              country: 'BR'
            }

            console.log('📤 [WEBHOOK] Enviando evento para Meta CAPI:', {
              email: metaCapiData.email,
              transactionId: metaCapiData.transactionId,
              amount: metaCapiData.amount,
              currency: metaCapiData.currency
            })

            // Enviar para Meta CAPI
            const metaResult = await sendPurchaseToMeta(metaCapiData)
            
            if (metaResult.success) {
              console.log('✅ [WEBHOOK] Evento enviado para Meta CAPI com sucesso:', metaResult.response)
            } else {
              console.error('❌ [WEBHOOK] Erro ao enviar evento para Meta CAPI:', metaResult.error)
            }

            // Salvar na tabela conversions usando service role
            console.log('💾 [WEBHOOK] Salvando conversão no Supabase')
            
            const adminSupabase = createAdminClient()
            
            const conversionData = {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_session_id: session.id,
              transaction_id: session.id,
              amount: (session.amount_total || 0) / 100,
              currency: (session.currency || 'brl').toUpperCase(),
              email: customer.email || null,
              phone: customer.phone || null,
              first_name: firstName || null,
              last_name: lastName || null,
              fbp: subscription.metadata.fbp || null,
              fbc: subscription.metadata.fbc || null,
              ip_address: subscription.metadata.ip_address || null,
              user_agent: subscription.metadata.user_agent || null,
              creative: session.metadata?.creative || null,
              campaign: session.metadata?.campaign || null,
              country: 'BR',
              plan: plan,
              meta_capi_sent: metaResult.success,
              meta_capi_response: metaResult.response || null,
              meta_capi_error: metaResult.error || null,
              created_at: new Date().toISOString()
            }

            console.log('📝 [WEBHOOK] Dados da conversão a serem inseridos:', {
              user_id: conversionData.user_id,
              transaction_id: conversionData.transaction_id,
              amount: conversionData.amount,
              meta_capi_sent: conversionData.meta_capi_sent
            })

            const { data: conversionInsert, error: conversionError } = await adminSupabase
              .from('conversions')
              .insert(conversionData)
              .select()
              .single()

            if (conversionError) {
              console.error('❌ [WEBHOOK] Erro ao salvar conversão no Supabase:', conversionError)
              console.error('❌ [WEBHOOK] Detalhes do erro:', {
                message: conversionError.message,
                code: conversionError.code,
                details: conversionError.details,
                hint: conversionError.hint
              })
            } else {
              console.log('✅ [WEBHOOK] Conversão salva no Supabase com sucesso:', conversionInsert.id)
            }

          } catch (integrationError: any) {
            console.error('❌ [WEBHOOK] Erro na integração Meta CAPI/Supabase:', integrationError)
            console.error('❌ [WEBHOOK] Stack trace:', integrationError.stack)
            // Não quebrar o webhook se a integração falhar
          }

          break
        }

        // EVENTO 2: Subscription criada
        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription
          
          console.log('🆕 [WEBHOOK] Nova subscription criada')
          console.log('Customer:', subscription.customer)
          console.log('Status:', subscription.status)

          const customerId = subscription.customer as string

          // Buscar usuário pelo stripe_customer_id
          const { data: profile, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (findError || !profile) {
            console.error('❌ [WEBHOOK] Usuário não encontrado para customer:', customerId)
            break
          }

          const priceId = subscription.items.data[0].price.id
          let plan = 'monthly'
          if (priceId === process.env.STRIPE_PRICE_ID_ANNUAL) {
            plan = 'annual'
          }

          // Atualizar profile
          await supabase
            .from('profiles')
            .update({
              stripe_subscription_id: subscription.id,
              subscription_tier: subscription.status === 'active' ? 'premium' : 'free',
              subscription_plan: plan,
            })
            .eq('id', profile.id)

          // Atualizar metadata
          await supabase.auth.admin.updateUserById(profile.id, {
            user_metadata: {
              subscription_tier: subscription.status === 'active' ? 'premium' : 'free',
              subscription_plan: plan,
            }
          })

          console.log('✅ [WEBHOOK] Subscription criada e sincronizada')
          break
        }

        // EVENTO 3: Subscription atualizada (renovação, upgrade, downgrade)
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          
          console.log('🔄 [WEBHOOK] Subscription atualizada')
          console.log('Status:', subscription.status)

          const customerId = subscription.customer as string

          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (!profile) {
            console.error('❌ [WEBHOOK] Usuário não encontrado')
            break
          }

          const priceId = subscription.items.data[0].price.id
          let plan = 'monthly'
          if (priceId === process.env.STRIPE_PRICE_ID_ANNUAL) {
            plan = 'annual'
          }

          // Determinar tier baseado no status
          const tier = ['active', 'trialing'].includes(subscription.status) ? 'premium' : 'free'

          // Atualizar profile
          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_plan: tier === 'premium' ? plan : null,
            })
            .eq('id', profile.id)

          // Atualizar metadata
          await supabase.auth.admin.updateUserById(profile.id, {
            user_metadata: {
              subscription_tier: tier,
              subscription_plan: tier === 'premium' ? plan : null,
            }
          })

          console.log('✅ [WEBHOOK] Subscription atualizada:', tier)
          break
        }

        // EVENTO 4: Subscription cancelada/deletada
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          
          console.log('❌ [WEBHOOK] Subscription cancelada')

          const customerId = subscription.customer as string

          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (!profile) break

          // Downgrade para free
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_plan: null,
            })
            .eq('id', profile.id)

          // Atualizar metadata
          await supabase.auth.admin.updateUserById(profile.id, {
            user_metadata: {
              subscription_tier: 'free',
              subscription_plan: null,
            }
          })

          console.log('✅ [WEBHOOK] User downgrade para free')
          break
        }

        // EVENTO 5: Pagamento bem-sucedido (renovação)
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice
          
          console.log('💰 [WEBHOOK] Pagamento bem-sucedido')

          if (!invoice.subscription) break

          const customerId = invoice.customer as string

          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (!profile) break

          // Garantir que está premium
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'premium',
            })
            .eq('id', profile.id)

          await supabase.auth.admin.updateUserById(profile.id, {
            user_metadata: {
              subscription_tier: 'premium',
            }
          })

          console.log('✅ [WEBHOOK] Renovação confirmada')
          break
        }

        // EVENTO 6: Falha no pagamento
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice
          
          console.log('⚠️ [WEBHOOK] Falha no pagamento')

          const customerId = invoice.customer as string

          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (!profile) break

          // Downgrade para free
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_plan: null,
            })
            .eq('id', profile.id)

          await supabase.auth.admin.updateUserById(profile.id, {
            user_metadata: {
              subscription_tier: 'free',
              subscription_plan: null,
            }
          })

          console.log('✅ [WEBHOOK] Downgrade por falha de pagamento')
          break
        }

        default:
          console.log('ℹ️ [WEBHOOK] Evento não tratado:', event.type)
      }

      return NextResponse.json({ received: true }, { status: 200 })

    } catch (error: any) {
      console.error('❌ [WEBHOOK] Erro no processamento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ [WEBHOOK] Erro:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
