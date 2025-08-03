import { Languages } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { isTranslationIconVisibleAtom, mouseClickPositionAtom, selectionContentAtom } from '@/entrypoints/content/atom'
import { Button } from '@/components/ui/button'
import { sendMessage } from '@/utils/message'
import { logger } from '@/utils/logger'

export function TranslationButton() {
    const setIsTranslationIconVisible = useSetAtom(isTranslationIconVisibleAtom)
    const setMouseClickPosition = useSetAtom(mouseClickPositionAtom)
    const selectionContent = useAtomValue(selectionContentAtom)

    const onClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log('[TranslationButton.onClick]')
        const rect = event.currentTarget.getBoundingClientRect()
        const x = rect.left
        const y = rect.top
        setMouseClickPosition({ x, y })
        setIsTranslationIconVisible(false)
        logger.log('[TranslationButton.onClick] selectionContent:', selectionContent)
        if (selectionContent && selectionContent.text.length > 0) {
            logger.log(`sending message to background: "${selectionContent.text}"`)
            const response = await sendMessage('translateText', selectionContent.text)

            if (response) {
                logger.log('[TranslationButton.onClick] response:', response)
                console.log('翻译结果:', response);
                // 在下一章，我们会在这里显示一个结果卡片
                alert(`翻译结果：${response}`); // 临时用 alert 显示
            }
        }
    }

    return <Button variant="outline" onClick={onClick}>
        <Languages />
    </Button>
}