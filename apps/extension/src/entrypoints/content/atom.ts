import { atom } from 'jotai'
import type { TextSelection } from '@/utils/types'

export const selectionContentAtom = atom<TextSelection | null>(null)
export const translationPositionAtom = atom<{
    x: number
    y: number
} | null>(null)

export type TranslationUIState = 'hidden' | 'button' | 'card'
export const translationUIStateAtom = atom<TranslationUIState>('hidden')