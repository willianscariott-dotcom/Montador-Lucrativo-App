import { create } from 'zustand'

export const useQuoteEditStore = create((set) => ({
  editingQuote: null,
  editingItems: null,
  setEditingQuote: (quote, items) => set({ editingQuote: quote, editingItems: items }),
  clearEditingQuote: () => set({ editingQuote: null, editingItems: null }),
}))
