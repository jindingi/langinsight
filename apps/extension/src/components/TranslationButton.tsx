import { Languages } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
    isTranslationIconVisibleAtom,
    selectionContentAtom,
    isTranslationCardVisibleAtom,
} from '@/entrypoints/content/atom'
import { Button } from '@/components/ui/button'
import { logger } from '@/utils/logger'

export function TranslationButton() {
    const setIsTranslationIconVisible = useSetAtom(isTranslationIconVisibleAtom)
    const selectionContent = useAtomValue(selectionContentAtom)
    const setIsTranslationCardVisible = useSetAtom(isTranslationCardVisibleAtom)

    const onClick = async () => {
        logger.log('[TranslationButton.onClick]')
        setIsTranslationIconVisible(false)
        logger.log(
            '[TranslationButton.onClick] selectionContent:',
            selectionContent,
        )
        const selectedText = selectionContent?.context
        if (selectedText && selectedText.length > 0) {
            setIsTranslationCardVisible(true)
            // logger.log(`sending message to background: "${selectedText}"`)
            // const response: Resp<string> = await sendMessage(
            //     MESSAGE_TYPE_TRANSLATE_TEXT,
            //     {
            //         type: TranslateType.AI,
            //         selection: selectionContent,
            //     },
            // )

            // if (response) {
            //     logger.log('[TranslationButton.onClick] response:', response)
            //     // 在下一章，我们会在这里显示一个结果卡片
            //     if (response.code === 0) {
            //         alert(`翻译结果：${response.data}`) // 临时用 alert 显示
            //     } else {
            //         alert(`翻译失败：${response.code}`) // 临时用 alert 显示
            //     }
            // }
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
