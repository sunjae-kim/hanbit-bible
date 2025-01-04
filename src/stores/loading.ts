import { BibleLoadingState } from '@/types/bible'
import { create } from 'zustand'

interface LoadingStore {
  bible: BibleLoadingState
  setPending: (key: 'auth' | 'bible', value: boolean | BibleLoadingState) => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  bible: { stage: 'idle', message: '' },
  setPending: (key, value) => set((state) => ({ ...state, [key]: value })),
}))
