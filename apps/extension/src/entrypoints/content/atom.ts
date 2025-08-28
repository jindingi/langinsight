import { atom } from 'jotai'
import type { SelectionContext } from '@/utils/types'
import { atomWithLog } from '@/utils/helper'

export const selectionContextAtom = atom<SelectionContext | null>(null)
export const translationPositionAtom = atom<{
    x: number
    y: number
} | null>(null)

export type TranslationUIState = 'hidden' | 'button' | 'card'
export const translationUIStateAtom = atomWithLog<TranslationUIState>('hidden', 'translationUIStateAtom')