import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef, useCallback } from 'react'
import {
    selectionContentAtom,
    translationPositionAtom,
    translationUIStateAtom,
} from '@/entrypoints/content/atom'
import { textSelectionService } from '@/services/text-selection-service'
import type { TextSelection } from '@/utils/types'
import { TranslationButton } from '@/components/TranslationButton'
import { TranslationCard } from '@/components/TranslationCard'

const CONTEXT_OPTIONS = {
    beforeSentences: 2,
    afterSentences: 1,
}

export function SelectTranslation() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [translationUIState, setTranslationUIState] = useAtom(
        translationUIStateAtom,
    )
    const setSelectionContent = useSetAtom(selectionContentAtom)
    const [translationPosition, setTranslationPosition] = useAtom(
        translationPositionAtom,
    )
    const selectionContent = useAtomValue(selectionContentAtom)

    const handleMouseUp = useCallback((event: MouseEvent) => {
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
            setSelectionContent(selected)
            setTranslationUIState('button')
            const position = {
                x: rect.right + window.scrollX,
                y: rect.bottom + window.scrollY + 5,
            }
            setTranslationPosition(position)
            // logger.log('[SelectionIcon.handleMouseUp] translationIconPosition:', position)
            // logger.log('[SelectionIcon.handleMouseUp] selected.context:', selected.context)
        } else {
            setSelectionContent(null)
            setTranslationUIState('hidden')
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

    return (
        <div
            ref={containerRef}
            style={{
                left: `${translationPosition?.x}px`,
                top: `${translationPosition?.y}px`,
            }}
            className="absolute z-[2147483647] flex"
        >
            {translationUIState === 'button' && (
                <div key="translation-button">
                    <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
                        {selectionContent && selectionContent.context && (
                            <TranslationButton />
                        )}
                    </div>
                </div>
            )}
            {translationUIState === 'card' && (
                <div key="translation-card">
                    <TranslationCard
                        key={`translation-${selectionContent?.context.slice(0, 50)}`}
                        initialInput={selectionContent?.context ?? ''}
                    />
                </div>
            )}
        </div>
    )
}
