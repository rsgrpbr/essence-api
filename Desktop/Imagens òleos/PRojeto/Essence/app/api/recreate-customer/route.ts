import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST() {
  try {
    console.log('🔄 [RECREATE] Iniciando...')

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Configuração do Stripe ausente' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia'
    })

    const supabase = createClient()

    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    console.log('✅ [RECREATE] User:', session.user.id)

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', session.user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Se tem customer_id, verificar se é válido
    if (customerId) {
      try {
        console.log('🔍 [RECREATE] Verificando customer existente:', customerId)
        await stripe.customers.retrieve(customerId)
        console.log('✅ [RECREATE] Customer válido!')
        return NextResponse.json({
          message: 'Customer já existe e está válido',
          customer_id: customerId
        })
      } catch (e) {
        console.log('❌ [RECREATE] Customer inválido, criando novo...')
        customerId = null
      }
    }

    // Criar novo customer no Stripe
    console.log('🆕 [RECREATE] Criando novo customer...')
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: profile?.full_name || session.user.email,
      metadata: {
        supabase_user_id: session.user.id
      }
    })

    console.log('✅ [RECREATE] Customer criado:', customer.id)

    // Atualizar banco
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', session.user.id)

    console.log('✅ [RECREATE] Banco atualizado!')

    return NextResponse.json({
      message: 'Customer criado com sucesso!',
      customer_id: customer.id,
      action: 'CREATED'
    })

  } catch (error: any) {
    console.error('💥 [RECREATE] Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
