import { Languages } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { isTranslationIconVisibleAtom, selectionContentAtom } from '@/entrypoints/content/atom'
import { Button } from '@/components/ui/button'
import { sendMessage } from '@/utils/message'
import { logger } from '@/utils/logger'
import { MESSAGE_TYPE_TRANSLATE_TEXT } from '@/consts/message'

export function TranslationButton() {
    const setIsTranslationIconVisible = useSetAtom(isTranslationIconVisibleAtom)
    const selectionContent = useAtomValue(selectionContentAtom)

    const onClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        logger.log('[TranslationButton.onClick]')
        setIsTranslationIconVisible(false)
        logger.log('[TranslationButton.onClick] selectionContent:', selectionContent)
        const selectedText = selectionContent?.context
        if (selectedText && selectedText.length > 0) {
            logger.log(`sending message to background: "${selectedText}"`)
            const response = await sendMessage(MESSAGE_TYPE_TRANSLATE_TEXT, selectedText)

            if (response) {
                logger.log('[TranslationButton.onClick] response:', response)
                // 在下一章，我们会在这里显示一个结果卡片
                alert(`翻译结果：${response}`); // 临时用 alert 显示
            }
        }
    }

    return <Button variant="outline" onClick={onClick}>
        <Languages />
    </Button>
}