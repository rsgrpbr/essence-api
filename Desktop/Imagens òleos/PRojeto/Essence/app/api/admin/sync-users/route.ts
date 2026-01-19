import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()
    
    // Buscar todos os profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, subscription_tier, subscription_plan, full_name')
    
    if (profilesError) throw profilesError
    
    console.log(`🔄 Sincronizando ${profiles?.length} usuários...`)
    
    let updated = 0
    let errors = 0
    
    for (const profile of profiles || []) {
      try {
        // Atualizar user_metadata
        const { error } = await supabase.auth.admin.updateUserById(
          profile.id,
          {
            user_metadata: {
              subscription_tier: profile.subscription_tier || 'free',
              subscription_plan: profile.subscription_plan || null,
              full_name: profile.full_name || null
            }
          }
        )
        
        if (error) {
          console.error(`❌ ${profile.id}:`, error.message)
          errors++
        } else {
          console.log(`✅ ${profile.id}: ${profile.subscription_tier}`)
          updated++
        }
        
        // Delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err: any) {
        console.error(`❌ Exception ${profile.id}:`, err.message)
        errors++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Sincronização completa!`,
      updated,
      errors,
      total: profiles?.length || 0
    })
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
