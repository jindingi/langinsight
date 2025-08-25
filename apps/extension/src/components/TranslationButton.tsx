import { Languages } from 'lucide-react'
import { useSetAtom } from 'jotai'
import {
    translationUIStateAtom,
} from '@/entrypoints/content/atom'
import { Button } from '@/components/ui/button'

export function TranslationButton() {
    // const selectionContent = useAtomValue(selectionContentAtom)
    const setTranslationUIState = useSetAtom(translationUIStateAtom)

    const onClick = async () => {
        // logger.log('[TranslationButton.onClick] selectionContent:', selectionContent)
        // const selectedText = selectionContent?.context
        // if (selectedText && selectedText.length > 0) {
            setTranslationUIState('card')
        // }
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
