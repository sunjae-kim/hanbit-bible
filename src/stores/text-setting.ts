import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TextSettings {
  fontSize: number
  lineHeight: number
  letterSpacing: number
}

interface TextSettingsState extends TextSettings {
  setFontSize: (size: number) => void
  setLineHeight: (height: number) => void
  setLetterSpacing: (spacing: number) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: TextSettings = {
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
}

export const useTextSettingsStore = create<TextSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'bible-text-settings',
    },
  ),
)
