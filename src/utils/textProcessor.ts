import { sentences as splitSentences } from 'sbd'
import { logger } from '@/utils/logger'
import type { ContextOptions, TextSelection } from '@/utils/types'

export interface TextRange {
    fullText: string
    startOffset: number
    endOffset: number
}

/**
 * 处理文本选择和上下文，不依赖 DOM API
 */
export function processTextSelection(
    range: TextRange,
    options: ContextOptions = {}
): TextSelection | null {
    const { beforeSentences = 0, afterSentences = 0 } = options

    // 获取选中的文本（不要 trim，保持原始格式）
    const selectedText = range.fullText.slice(range.startOffset, range.endOffset).trim()
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

    const contextBefore = beforeSentences > 0
        ? prefixSentences.slice(-beforeSentences).join(' ')
        : ''

    const contextAfter = afterSentences > 0
        ? suffixSentences.slice(0, afterSentences).join(' ')
        : ''

    logger.log('[processTextSelection] selectedText:', selectedText)
    logger.log('[processTextSelection] contextBefore:', contextBefore)
    logger.log('[processTextSelection] contextAfter:', contextAfter)

    // 组合最终结果
    const parts = []
    if (contextBefore) parts.push(contextBefore.trim())
    parts.push(`<selected_text>${selectedText}</selected_text>`)
    if (contextAfter) parts.push(contextAfter.trim())

    return {
        text: selectedText,
        context: parts.join(' ').trim(),
    }
}
