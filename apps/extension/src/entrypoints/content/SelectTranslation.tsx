import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef, useCallback } from 'react'
import {
    selectionContextAtom,
    translationPositionAtom,
    translationUIStateAtom,
    selectionAnchorRectAtom,
} from '@/entrypoints/content/atom'
import { textSelectionService } from '@/services/text-selection-service'
import type { TextSelection, SelectionContext } from '@/utils/types'
import { TranslationButton } from '@/components/TranslationButton'
import { TranslationCard } from '@/components/TranslationCard'
import { MESSAGE_TYPE_GET_CONTEXT } from '@/consts/message'
import { sendMessage } from '@/utils/message'
import {
    calculateSafePosition,
    ELEMENT_DIMENSIONS,
} from '@/utils/position-utils'

const CONTEXT_OPTIONS = {
    beforeSentences: 2,
    afterSentences: 1,
}

export function SelectTranslation() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [translationUIStateValue, setTranslationUIState] = useAtom(
        translationUIStateAtom,
    )
    const setSelectionContent = useSetAtom(selectionContextAtom)
    const [translationPositionValue, setTranslationPosition] = useAtom(
        translationPositionAtom,
    )
    const selectionContextValue = useAtomValue(selectionContextAtom)
    const [anchorRect, setAnchorRect] = useAtom(selectionAnchorRectAtom)

    const handleMouseUp = useCallback(async (event: MouseEvent) => {
        if (containerRef.current) {
            const eventPath = event.composedPath()
            const insidePopover = eventPath.includes(containerRef.current)
            if (insidePopover) {
                return
            }
        }
        // logger.log('[SelectionIcon.handleMouseUp]')
        // const textSelection = new TextSelector()
        // const selected = textSelection.getSelectedText()
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            // 没有选择文本或选区是空的
            return
        }
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        const selected: TextSelection | null =
            textSelectionService.getSelectedTextWithContext(selection, {
                beforeSentences: CONTEXT_OPTIONS.beforeSentences,
                afterSentences: CONTEXT_OPTIONS.afterSentences,
            })

        if (selected && selected.text.length > 0 && rect.x && rect.y) {
            const backgroundContext = await sendMessage(MESSAGE_TYPE_GET_CONTEXT)
            const context: SelectionContext = {
                url: backgroundContext.data?.url ?? '',
                textSelection: selected,
            }
            setSelectionContent(context)
            setTranslationUIState('button')
            
            // Store anchor rect for position recalculation when UI state changes
            const storedRect = {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
            }
            setAnchorRect(storedRect)
            
            // Use smart positioning with viewport boundary detection
            const position = calculateSafePosition(storedRect, {
                elementWidth: ELEMENT_DIMENSIONS.TRANSLATION_BUTTON_WIDTH,
                elementHeight: ELEMENT_DIMENSIONS.TRANSLATION_BUTTON_HEIGHT,
                offset: 5,
            })
            setTranslationPosition(position)
        } else {
            setSelectionContent(null)
            setTranslationUIState('hidden')
            setAnchorRect(null)
        }
    }, [])

    const handleMouseDown = useCallback((event: MouseEvent) => {
        if (containerRef.current) {
            const eventPath = event.composedPath()
            const insideIcon = eventPath.includes(containerRef.current)
            if (!insideIcon) {
                setTranslationUIState('hidden')
            }
        }
    }, [])

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousedown', handleMouseDown)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousedown', handleMouseDown)
        }
    }, [])

    // Recalculate position when UI state changes to card (larger element)
    useEffect(() => {
        if (translationUIStateValue === 'card' && anchorRect) {
            const position = calculateSafePosition(anchorRect, {
                elementWidth: ELEMENT_DIMENSIONS.TRANSLATION_CARD_WIDTH,
                elementHeight: 150, // Estimated card height
                offset: 5,
            })
            setTranslationPosition(position)
        }
    }, [translationUIStateValue, anchorRect, setTranslationPosition])

    return (
        <div
            ref={containerRef}
            style={{
                left: `${translationPositionValue?.x}px`,
                top: `${translationPositionValue?.y}px`,
            }}
            className="absolute z-[2147483647] flex"
        >
            {translationUIStateValue === 'button' && selectionContextValue?.textSelection.context && (
                <div key="translation-button">
                    <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
                        <TranslationButton />
                    </div>
                </div>
            )}
            {translationUIStateValue === 'card' && selectionContextValue?.textSelection.context && (
                <div key="translation-card">
                    <TranslationCard
                        key={`translation-${selectionContextValue?.textSelection.context.slice(0, 50)}`}
                        selectionContext={selectionContextValue}
                    />
                </div>
            )}
        </div>
    )
}
