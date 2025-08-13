import { describe, it, expect } from 'vitest'
import { processTextSelection } from './textProcessor'

/**
 * 格式化测试输出，使其符合预期格式
 */
function formatTestOutput(text: string): string {
  return text
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/\s*([,.!?])(?!<)\s*/g, '$1 ')
    .replace(/\s+\./g, '.') // 移除句号前的空格
    .trim()
}

describe('processTextSelection', () => {
  // 测试1：空选区
  it('should return null if selection is empty', () => {
    const result = processTextSelection({
      fullText: 'Hello world',
      startOffset: 5,
      endOffset: 5,
    })

    expect(result).toBeNull()
  })

  // 测试2：默认选项
  it('should return only the wrapped selected text with default options', () => {
    const fullText = 'The quick brown fox jumps over the lazy dog.'
    const selectedText = 'fox'
    const result = processTextSelection({
      fullText,
      startOffset: fullText.indexOf(selectedText),
      endOffset: fullText.indexOf(selectedText) + selectedText.length,
    })

    expect(result).not.toBeNull()
    expect(result!.text).toBe('fox')
    expect(formatTestOutput(result!.context)).toBe('<selected_text>fox</selected_text>')
  })

  // 测试3：唯一性（第二个 "to be"）
  it('should correctly identify the unique instance of a repeated text', () => {
    const fullText = 'to be, or not to be, that is the question.'
    const selectedText = 'to be'
    const startOffset = fullText.indexOf(selectedText, fullText.indexOf(selectedText) + 1) // 找第二个出现位置
    const result = processTextSelection(
      {
        fullText,
        startOffset,
        endOffset: startOffset + selectedText.length,
      },
      {
        beforeSentences: 1,
        afterSentences: 1,
      }
    )

    expect(result).not.toBeNull()
    expect(result!.text).toBe('to be')
    expect(formatTestOutput(result!.context)).toBe('to be, or not <selected_text>to be</selected_text>, that is the question.')
  })

  // 测试4：上下文和句子分割
  it('should get basic context with before and after sentences', () => {
    const fullText = 'First sentence. Second sentence is here. Third sentence follows.'
    const selectedText = 'Second sentence is here.'
    const result = processTextSelection(
      {
        fullText,
        startOffset: fullText.indexOf(selectedText),
        endOffset: fullText.indexOf(selectedText) + selectedText.length,
      },
      {
        beforeSentences: 1,
        afterSentences: 1,
      }
    )

    expect(result).not.toBeNull()
    expect(result!.text).toBe('Second sentence is here.')
    expect(formatTestOutput(result!.context)).toBe('First sentence. <selected_text>Second sentence is here.</selected_text> Third sentence follows.')
  })

  // 测试5：选区在文本开头
  it('should handle selection at the start of text', () => {
    const fullText = 'First sentence. Second sentence.'
    const selectedText = 'First sentence.'
    const result = processTextSelection(
      {
        fullText,
        startOffset: fullText.indexOf(selectedText),
        endOffset: fullText.indexOf(selectedText) + selectedText.length,
      },
      {
        beforeSentences: 1,
        afterSentences: 1,
      }
    )

    expect(result).not.toBeNull()
    expect(result!.text).toBe('First sentence.')
    expect(formatTestOutput(result!.context)).toBe('<selected_text>First sentence.</selected_text> Second sentence.')
  })

  // 测试6：选区在文本末尾
  it('should handle selection at the end of text', () => {
    const fullText = 'First sentence. Last sentence.'
    const selectedText = 'Last sentence.'
    const result = processTextSelection(
      {
        fullText,
        startOffset: fullText.indexOf(selectedText),
        endOffset: fullText.indexOf(selectedText) + selectedText.length,
      },
      {
        beforeSentences: 1,
        afterSentences: 1,
      }
    )

    expect(result).not.toBeNull()
    expect(result!.text).toBe('Last sentence.')
    expect(formatTestOutput(result!.context)).toBe('First sentence. <selected_text>Last sentence.</selected_text>')
  })
})