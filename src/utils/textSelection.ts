import type { ContextOptions, TextSelection } from '@/utils/types'
import { processTextSelection } from './textProcessor'

/**
 * 获取浏览器中选中的文本及其上下文。
 * @param options - 配置对象，用于指定选区前后的句子数量。
 * @param options.beforeSentences - 需要包含在选区前的句子数量，默认为 0。
 * @param options.afterSentences - 需要包含在选区后的句子数量，默认为 0。
 * @returns 返回一个包含上下文和高亮选区的字符串，如果没有有效选区则返回 null。
 */
export function getSelectedTextWithContext(
  selection: Selection,
  options: ContextOptions = {}
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
  const blockElements = ['P', 'DIV', 'LI', 'ARTICLE', 'SECTION', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
  while (container && container.nodeType === Node.ELEMENT_NODE && !blockElements.includes((container as Element).tagName)) {
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
  return processTextSelection(
    {
      fullText,
      startOffset,
      endOffset,
    },
    options
  )
}