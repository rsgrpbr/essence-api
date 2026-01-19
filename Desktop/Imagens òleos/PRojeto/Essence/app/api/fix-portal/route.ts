import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: Request) {
  const diagnostico: any = {
    step1_env: '❌',
    step2_auth: '❌',
    step3_profile: '❌',
    step4_customer_valido: '❌',
    step5_portal_criado: '❌',
    detalhes: {}
  }

  try {
    // STEP 1: Verificar env vars
    diagnostico.detalhes.stripe_key_exists = !!process.env.STRIPE_SECRET_KEY
    diagnostico.detalhes.site_url = process.env.NEXT_PUBLIC_SITE_URL || 'AUSENTE'
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY ausente')
    }
    diagnostico.step1_env = '✅'

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia'
    })

    // STEP 2: Autenticação com token do header
    const supabase = await createClient()
    
    const authHeader = request.headers.get('Authorization')
    let user = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data, error } = await supabase.auth.getUser(token)
      if (data?.user && !error) {
        user = data.user
      }
    }
    
    if (!user) {
      throw new Error('Não autenticado')
    }
    
    diagnostico.step2_auth = '✅'
    diagnostico.detalhes.user_email = user.email
    diagnostico.detalhes.user_id = user.id

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Buscar profile usando ADMIN CLIENT (bypass RLS)
    // ═══════════════════════════════════════════════════════════════
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Sempre usar admin client para garantir que encontramos o profile
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, stripe_customer_id, subscription_tier, full_name, email')
      .eq('id', user.id)
      .single()

    let profile = existingProfile

    if (profileError || !existingProfile) {
      // Profile realmente não existe - criar com tier free (novo usuário)
      console.log('[FIX-PORTAL] Profile não encontrado, criando novo...')
      
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          subscription_tier: 'free',
        })
        .select('id, stripe_customer_id, subscription_tier, full_name, email')
        .single()

      if (insertError || !newProfile) {
        console.error('[FIX-PORTAL] Erro ao criar profile:', insertError)
        throw new Error('Erro ao criar profile: ' + (insertError?.message || 'unknown'))
      }

      profile = newProfile
      diagnostico.detalhes.profile_status = 'CRIADO'
    } else {
      diagnostico.detalhes.profile_status = 'EXISTENTE'
    }

    diagnostico.step3_profile = '✅'
    diagnostico.detalhes.stripe_customer_id = profile.stripe_customer_id || 'NULL'
    diagnostico.detalhes.tier = profile.subscription_tier

    // Log para debug
    console.log('[FIX-PORTAL] Profile encontrado:', {
      id: profile.id,
      tier: profile.subscription_tier,
      stripe_customer_id: profile.stripe_customer_id
    })

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Validar/Criar Stripe customer
    // IMPORTANTE: Nunca alterar subscription_tier aqui!
    // ═══════════════════════════════════════════════════════════════
    let customerId = profile.stripe_customer_id

    if (customerId) {
      // Verificar se customer existe no Stripe
      try {
        await stripe.customers.retrieve(customerId)
        diagnostico.step4_customer_valido = '✅'
        diagnostico.detalhes.customer_status = 'VÁLIDO'
      } catch (e) {
        // Customer não existe no Stripe - criar novo
        console.log('[FIX-PORTAL] Customer inválido no Stripe, criando novo...')
        
        const newCustomer = await stripe.customers.create({
          email: user.email!,
          name: profile.full_name || user.email!,
          metadata: { supabase_user_id: user.id }
        })

        // Atualizar APENAS o stripe_customer_id, não tocar no tier!
        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: newCustomer.id })
          .eq('id', user.id)

        customerId = newCustomer.id
        diagnostico.step4_customer_valido = '✅'
        diagnostico.detalhes.customer_status = 'RECRIADO'
        diagnostico.detalhes.new_customer_id = newCustomer.id
      }
    } else {
      // Sem customer - criar novo
      console.log('[FIX-PORTAL] Sem stripe_customer_id, criando customer...')
      
      const newCustomer = await stripe.customers.create({
        email: user.email!,
        name: profile.full_name || user.email!,
        metadata: { supabase_user_id: user.id }
      })

      // Atualizar APENAS o stripe_customer_id, não tocar no tier!
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: newCustomer.id })
        .eq('id', user.id)

      customerId = newCustomer.id
      diagnostico.step4_customer_valido = '✅'
      diagnostico.detalhes.customer_status = 'CRIADO'
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Criar portal session
    // ═══════════════════════════════════════════════════════════════
    const returnUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://essenceapp.com.br'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnUrl}/`
    })

    diagnostico.step5_portal_criado = '✅'

    // Log final
    console.log('[FIX-PORTAL] Sucesso! Tier mantido:', profile.subscription_tier)

    return NextResponse.json({
      sucesso: true,
      diagnostico,
      portal_url: portalSession.url
    })

  } catch (error: any) {
    console.error('[FIX-PORTAL] Erro:', error)
    return NextResponse.json({
      sucesso: false,
      diagnostico,
      erro: error.message
    }, { status: 500 })
  }
}
