import { createSupabaseBrowserClient } from './client'

export interface UpdateProfileInput {
  first_name: string
  last_name: string
  phone?: string | null
  district?: string | null
  university?: string | null
}

export async function updateUserProfile(input: UpdateProfileInput) {
  const supabase = createSupabaseBrowserClient()
  
  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado')
  }

  // 2. Validate basic rules
  const first_name = input.first_name.trim()
  const last_name = input.last_name.trim()
  if (!first_name || !last_name) {
    throw new Error('Nombre y apellido son requeridos')
  }

  const phone = input.phone?.trim() || null
  const district = input.district?.trim() || null
  const university = input.university || null

  // 3. Build safe payload explicitly (no role, no email)
  const payload: any = {
    first_name,
    last_name,
    phone,
    district,
  }

  if (input.university !== undefined) {
    payload.university = input.university || null
  }

  // 4. Update
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
