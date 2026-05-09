import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

export function useUpdateSettings() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newSettings) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user?.id)
        .single()

      const currentSettings = profile?.settings || {}
      const merged = { ...currentSettings, ...newSettings }

      const { error } = await supabase
        .from('profiles')
        .update({ settings: merged })
        .eq('id', user?.id)

      if (error) throw error
      return merged
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ['profile', user?.id] })
      const previous = queryClient.getQueryData(['profile', user?.id])

      queryClient.setQueryData(['profile', user?.id], (old) => ({
        ...old,
        settings: { ...(old?.settings || {}), ...newSettings },
      }))

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['profile', user?.id], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
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
