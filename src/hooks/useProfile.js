import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'

export function useProfile() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

export function useWallet() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', user?.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useQuoteStats() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['quote-stats', user?.id],
    queryFn: async () => {
      const [draft, sent, approved] = await Promise.all([
        supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
        supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      ])

      return {
        draft: draft.count || 0,
        sent: sent.count || 0,
        approved: approved.count || 0,
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })
}
