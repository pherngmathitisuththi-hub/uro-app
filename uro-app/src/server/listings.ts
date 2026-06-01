import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createServerSupabaseClient } from '../lib/supabase-server'

export type Listing = {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number
  original_price: number | null
  category: string
  expiry_date: string | null
  images: string[]
  location: string | null
  status: string
  freshness_score: number | null
  freshness_notes: string | null
  created_at: string
  profiles?: { username: string | null; full_name: string | null }
}

const GetListingsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().optional(),
})

export const getListings = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) => GetListingsSchema.parse(raw))
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()
    let query = supabase
      .from('listings')
      .select('*, profiles(username, full_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(data?.limit ?? 20)

    if (data?.category) query = query.eq('category', data.category)
    if (data?.search) query = query.ilike('title', `%${data.search}%`)

    const { data: listings, error } = await query
    if (error) throw error
    return listings as Listing[]
  })

export const getListing = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) => z.object({ id: z.string() }).parse(raw))
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*, profiles(username, full_name, avatar_url, phone)')
      .eq('id', data.id)
      .single()
    if (error) throw error
    return listing as Listing
  })

const CreateListingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  original_price: z.number().positive().optional(),
  category: z.string().min(1),
  expiry_date: z.string().optional(),
  images: z.array(z.string()).optional(),
  location: z.string().optional(),
  freshness_score: z.number().min(0).max(100).optional(),
  freshness_notes: z.string().optional(),
})

export const createListing = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => CreateListingSchema.parse(raw))
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน')

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return listing as Listing
  })

export const getUserListings = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน')

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return listings as Listing[]
})

export const deleteListing = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => z.object({ id: z.string() }).parse(raw))
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน')

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', data.id)
      .eq('user_id', user.id)

    if (error) throw error
  })
