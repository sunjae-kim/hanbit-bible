import { bibleManager } from '@/lib/bible'
import { BibleLoadingState } from '@/types/bible'
import { create } from 'zustand'

interface BibleStore {
  initialized: boolean
  loadingState: BibleLoadingState
  setLoadingState: (state: BibleLoadingState) => void
  initialize: () => Promise<void>
}

export const useBibleStore = create<BibleStore>((set) => ({
  initialized: false,
  loadingState: { stage: 'idle', message: '' },
  setLoadingState: (state) => set({ loadingState: state }),
  initialize: async () => {
    const setLoading = (stage: BibleLoadingState['stage'], message: string) => {
      set({ loadingState: { stage, message } })
    }

    try {
      await bibleManager.initialize({
        onProgress: (stage, message) => setLoading(stage, message),
      })
      set({ initialized: true })
    } catch (error) {
      setLoading('idle', '초기화 실패')
      console.error('Bible 초기화 실패:', error)
    }
  },
}))
