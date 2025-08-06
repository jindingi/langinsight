import { Languages } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { isTranslationIconVisibleAtom, selectionContentAtom } from '@/entrypoints/content/atom'
import { Button } from '@/components/ui/button'
import { sendMessage } from '@/utils/message'
import { logger } from '@/utils/logger'
import { MESSAGE_TYPE_TRANSLATE_TEXT } from '@/consts/message'
import { TranslateRequest, Resp, TranslateType } from '@/utils/types'

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
            const response: Resp<string> = await sendMessage(MESSAGE_TYPE_TRANSLATE_TEXT, {
                type: TranslateType.MYMEMORY,
                selection: selectionContent
            })

            if (response) {
                logger.log('[TranslationButton.onClick] response:', response)
                // 在下一章，我们会在这里显示一个结果卡片
                if (response.code === 0) {
                    alert(`翻译结果：${response.data}`); // 临时用 alert 显示
                } else {
                    alert(`翻译失败：${response.code}`); // 临时用 alert 显示
                }
            }
        }
    }

    return <Button variant="outline" onClick={onClick}>
        <Languages />
    </Button>
}