import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef, useCallback } from 'react'
import { isTranslationIconVisibleAtom, selectionContentAtom, translationIconPositionAtom } from '@/entrypoints/content/atom'
import { TranslationButton } from '@/components/TranslationButton'
import { logger } from '@/utils/logger'
import { getSelectedTextWithContext } from '@/utils/textSelection'
import type { TextSelection } from '../../utils/types'

const CONTEXT_OPTIONS = {
    beforeSentences: 2,
    afterSentences: 1
}

export function Selection() {
    const iconContainerRef = useRef<HTMLDivElement>(null)
    const [isTranslationIconVisible, setIsTranslationIconVisible] = useAtom(isTranslationIconVisibleAtom)
    const setSelectionContent = useSetAtom(selectionContentAtom)
    const [translationIconPosition, setTranslationIconPosition] = useAtom(translationIconPositionAtom)

    const handleMouseUp = useCallback((event: MouseEvent) => {
        if (iconContainerRef.current) {
            const eventPath = event.composedPath()
            const insideIcon = eventPath.includes(iconContainerRef.current)
            if (insideIcon) {
                return
            }
        }
        logger.log('[SelectionIcon.handleMouseUp]')
        // const textSelection = new TextSelector()
        // const selected = textSelection.getSelectedText()
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            // 没有选择文本或选区是空的
            return
        }
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        const selected: TextSelection | null = getSelectedTextWithContext(selection, {
            beforeSentences: CONTEXT_OPTIONS.beforeSentences,
            afterSentences: CONTEXT_OPTIONS.afterSentences
        })
        if (selected && selected.text.length > 0 && rect.x && rect.y) {
            setSelectionContent(selected)
            setIsTranslationIconVisible(true)
            const position = {
                x: rect.right + window.scrollX,
                y: rect.bottom + window.scrollY + 5
            }
            setTranslationIconPosition(position)
            logger.log('[SelectionIcon.handleMouseUp] translationIconPosition:', position)
            logger.log('[SelectionIcon.handleMouseUp] selected.context:', selected.context)
        } else {
            setSelectionContent(null)
            setIsTranslationIconVisible(false)
        }
    }, [])

    const handleMouseDown = useCallback((event: MouseEvent) => {
        if (iconContainerRef.current) {
            const eventPath = event.composedPath()
            const insideIcon = eventPath.includes(iconContainerRef.current)
            if (!insideIcon) {
                setIsTranslationIconVisible(false)
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
        <div ref={iconContainerRef}>
            {isTranslationIconVisible && (
                <div
                    className="absolute z-[2147483647] flex bg-zinc-200"
                    style={{
                        left: `${translationIconPosition?.x}px`,
                        top: `${translationIconPosition?.y}px`,
                    }}
                >
                    <TranslationButton />
                </div>
            )}
        </div>
    )
}