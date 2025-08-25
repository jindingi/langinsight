import { atom } from 'jotai'
import type { TextSelection } from '@/utils/types'
import { atomWithLog } from '@/utils/helper'

export const selectionContentAtom = atom<TextSelection | null>(null)
export const translationPositionAtom = atom<{
    x: number
    y: number
} | null>(null)

export type TranslationUIState = 'hidden' | 'button' | 'card'
export const translationUIStateAtom = atomWithLog<TranslationUIState>('hidden', 'translationUIStateAtom')