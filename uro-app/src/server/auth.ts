import { createServerFn } from '@tanstack/react-start'
import { createServerSupabaseClient } from '../lib/supabase-server'

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { user }
})

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
})
