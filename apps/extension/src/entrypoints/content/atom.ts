import { atom } from 'jotai'
import type { TextSelection } from '@/utils/types'

export const selectionContentAtom = atom<TextSelection | null>(null)
export const isTranslationIconVisibleAtom = atom<boolean>(false)
export const isTranslatePopoverVisibleAtom = atom<boolean>(false)
export const translationIconPositionAtom = atom<{
    x: number
    y: number
} | null>(null)
