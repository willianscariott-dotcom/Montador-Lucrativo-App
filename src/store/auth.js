import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      setSession: (session) => set({ session, user: session?.user ?? null }),
    }),
    {
      name: 'montador-auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
)
