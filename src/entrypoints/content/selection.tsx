import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { isTranslationIconVisibleAtom, selectionContentAtom, translationIconPositionAtom } from '@/entrypoints/content/atom'
import { TranslationButton } from '@/components/TranslationButton'
import { TextSelector } from './text-selection'

const DOWNWARD_OFFSET_Y = 18
const UPWARD_OFFSET_Y = -10
const MARGIN = 25
const SELECTION_DIRECTION_THRESHOLD = 5

export function SelectionTooltip() {
    const [isTranslationIconVisible, setIsTranslationIconVisible] = useAtom(isTranslationIconVisibleAtom)
    const [selectionContent, setSelectionContent] = useAtom(selectionContentAtom)
    const [translationIconPosition, setTranslationIconPosition] = useAtom(translationIconPositionAtom)

    const handleMouseUp = useCallback(() => {
        logger.log('[SelectionTooltip.handleMouseUp]')
        const textSelection = new TextSelector()
        const selected = textSelection.getSelectedText()
        if (selected && selected.text.length > 0 && selected.rect.x && selected.rect.y) {
            setSelectionContent(selected)
            setIsTranslationIconVisible(true)
            const position = {
                x: selected.rect.right + window.scrollX,
                y: selected.rect.bottom + window.scrollY + 5
            }
            setTranslationIconPosition(position)
            logger.log('[SelectionTooltip.handleMouseUp] translationIconPosition:', position)
            logger.log('[SelectionTooltip.handleMouseUp] selected.context:', selected.context)
        } else {
            setSelectionContent(null)
            setIsTranslationIconVisible(false)
        }
    }, [])

    const handleMouseDown = useCallback(() => {
        logger.log('[SelectionTooltip.handleMouseDown]')
        setIsTranslationIconVisible(false)
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
        <div>
            {isTranslationIconVisible && (
                <div
                    className="absolute z-[2147483647] bg-zinc-200 dark:bg-zinc-800 rounded-sm shadow-lg overflow-hidden flex items-center"
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