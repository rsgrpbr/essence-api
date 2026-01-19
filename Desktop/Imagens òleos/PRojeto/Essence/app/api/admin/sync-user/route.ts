import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()

    // Pegar usuário atual
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    console.log('🔄 [SYNC] Sincronizando usuário:', session.user.email)

    // Buscar profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_plan, stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile não encontrado' }, { status: 404 })
    }

    console.log('📊 [SYNC] Profile atual:', profile)

    // Atualizar user_metadata para refletir o profile
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      session.user.id,
      {
        user_metadata: {
          subscription_tier: profile.subscription_tier || 'free',
          subscription_plan: profile.subscription_plan || null,
          stripe_customer_id: profile.stripe_customer_id || null,
        }
      }
    )

    if (metadataError) {
      console.error('❌ [SYNC] Erro ao atualizar metadata:', metadataError)
      return NextResponse.json({ error: metadataError.message }, { status: 500 })
    }

    console.log('✅ [SYNC] Metadata atualizado com sucesso!')

    return NextResponse.json({
      success: true,
      message: 'Sincronização concluída! Faça logout e login novamente.',
      profile: profile,
      metadata_updated: {
        subscription_tier: profile.subscription_tier,
        subscription_plan: profile.subscription_plan,
      }
    })

  } catch (error: any) {
    console.error('❌ [SYNC] Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
