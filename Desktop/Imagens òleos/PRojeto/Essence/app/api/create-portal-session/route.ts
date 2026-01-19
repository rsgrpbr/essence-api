import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    console.log('🔍 [PORTAL] Iniciando...')
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ [PORTAL] STRIPE_SECRET_KEY AUSENTE!')
      return NextResponse.json(
        { error: 'Configuração do Stripe ausente' },
        { status: 500 }
      )
    }
    
    console.log('✅ [PORTAL] Stripe key OK')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia'
    })

    const supabase = createClient()
    
    console.log('🔐 [PORTAL] Verificando auth...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.error('❌ [PORTAL] Não autenticado')
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    console.log('✅ [PORTAL] User:', session.user.id)

    console.log('🔍 [PORTAL] Buscando customer_id...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('❌ [PORTAL] Erro query:', profileError)
      return NextResponse.json(
        { error: 'Erro ao buscar dados' },
        { status: 500 }
      )
    }

    console.log('📊 [PORTAL] Profile:', JSON.stringify(profile))

    if (!profile?.stripe_customer_id) {
      console.error('❌ [PORTAL] stripe_customer_id NULL ou ausente')
      return NextResponse.json(
        { error: 'Você precisa ter uma assinatura ativa para acessar o gerenciamento' },
        { status: 404 }
      )
    }

    console.log('✅ [PORTAL] Customer ID:', profile.stripe_customer_id)

    console.log('🎫 [PORTAL] Criando session no Stripe...')
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'https://a-harmony-guide.vercel.app'}/`,
    })

    console.log('✅ [PORTAL] Session criada!')
    console.log('🔗 [PORTAL] URL:', portalSession.url)

    return NextResponse.json({ url: portalSession.url })

  } catch (error: any) {
    console.error('💥 [PORTAL] EXCEPTION:', error.message)
    console.error('💥 [PORTAL] Stack:', error.stack)
    
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
