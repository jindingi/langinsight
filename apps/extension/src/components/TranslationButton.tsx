import { Languages } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
    selectionContentAtom,
    translationUIStateAtom,
} from '@/entrypoints/content/atom'
import { Button } from '@/components/ui/button'
import { logger } from '@/utils/logger'

export function TranslationButton() {
    const selectionContent = useAtomValue(selectionContentAtom)
    const setTranslationUIState = useSetAtom(translationUIStateAtom)

    const onClick = async () => {
        logger.log('[TranslationButton.onClick] selectionContent:', selectionContent)
        const selectedText = selectionContent?.context
        if (selectedText && selectedText.length > 0) {
            setTranslationUIState('card')
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                onClick={onClick}
            >
                <Languages className="h-4 w-4" />
            </Button>
        </>
    )
}
