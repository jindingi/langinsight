import { sentences as splitSentences } from 'sbd'
import type { ContextOptions, TextSelection } from '@/utils/types'
import {
    SELECTED_TEXT_MARKER,
    SELECTED_TEXT_MARKER_END,
} from '@/consts/selection'

export interface TextRange {
    fullText: string
    startOffset: number
    endOffset: number
}

class TextSelectionService {
    private static instance: TextSelectionService

    private constructor() {}

    static getInstance(): TextSelectionService {
        if (!TextSelectionService.instance) {
            TextSelectionService.instance = new TextSelectionService()
        }
        return TextSelectionService.instance
    }

    /**
     * 获取浏览器中选中的文本及其上下文。
     * @param options - 配置对象，用于指定选区前后的句子数量。
     * @param options.beforeSentences - 需要包含在选区前的句子数量，默认为 0。
     * @param options.afterSentences - 需要包含在选区后的句子数量，默认为 0。
     * @returns 返回一个包含上下文和高亮选区的字符串，如果没有有效选区则返回 null。
     */
    getSelectedTextWithContext(
        selection: Selection,
        options: ContextOptions = {},
    ): TextSelection | null {
        // 1. 获取选区的 Range 对象
        const range = selection.getRangeAt(0)
        if (range.collapsed) {
            return null
        }

        // 2. 寻找包含选区的"段落"级别的容器元素
        let container = range.commonAncestorContainer
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement!
        }

        // 向上遍历DOM树，找到一个合适的块级元素
        const blockElements = [
            'P',
            'DIV',
            'LI',
            'ARTICLE',
            'SECTION',
            'BLOCKQUOTE',
            'H1',
            'H2',
            'H3',
            'H4',
            'H5',
            'H6',
        ]
        while (
            container &&
            container.nodeType === Node.ELEMENT_NODE &&
            !blockElements.includes((container as Element).tagName)
        ) {
            if ((container as Element).tagName === 'BODY') break
            container = container.parentElement!
        }

        // 3. 获取完整的文本和选区位置
        const fullText = container?.textContent || range.toString()
        const beforeRange = document.createRange()
        beforeRange.setStart(container || range.startContainer, 0)
        beforeRange.setEnd(range.startContainer, range.startOffset)
        const startOffset = beforeRange.toString().length

        const endOffset = startOffset + range.toString().length

        // 4. 使用纯函数处理文本
        return this.processTextSelection(
            {
                fullText,
                startOffset,
                endOffset,
            },
            options,
        )
    }

    processTextSelection(
        range: TextRange,
        options: ContextOptions = {},
    ): TextSelection | null {
        const { beforeSentences = 0, afterSentences = 0 } = options

        // 获取选中的文本（不要 trim，保持原始格式）
        const selectedText = range.fullText
            .slice(range.startOffset, range.endOffset)
            .trim()
        if (selectedText.length === 0) {
            return null
        }

        // 获取前后文本
        const prefixText = range.fullText.slice(0, range.startOffset)
        const suffixText = range.fullText.slice(range.endOffset)

        // 使用 sbd 库进行智能句子分割
        const prefixSentences = splitSentences(prefixText.trim())
        const suffixSentences = splitSentences(suffixText.trim())

        // 根据参数提取上下文句子，保持原始标点
        // 定义一个过滤器，去除 sbd 可能产生的仅含标点的无效“句子”
        // const isValidSentence = (s: string) => s.trim().length > 1 || /\w/.test(s)

        const contextBefore =
            beforeSentences > 0
                ? prefixSentences.slice(-beforeSentences).join(' ')
                : ''

        const contextAfter =
            afterSentences > 0
                ? suffixSentences.slice(0, afterSentences).join(' ')
                : ''

        logger.log('[processTextSelection] selectedText:', selectedText)
        logger.log('[processTextSelection] contextBefore:', contextBefore)
        logger.log('[processTextSelection] contextAfter:', contextAfter)

        // 组合最终结果
        const parts = []
        if (contextBefore) parts.push(contextBefore.trim())
        parts.push(
            `${SELECTED_TEXT_MARKER}${selectedText}${SELECTED_TEXT_MARKER_END}`,
        )
        if (contextAfter) parts.push(contextAfter.trim())

        return {
            text: selectedText,
            context: parts.join(' ').trim(),
        }
    }
}

export const textSelectionService = TextSelectionService.getInstance()
