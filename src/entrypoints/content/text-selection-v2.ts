import { sentences as splitSentences } from 'sbd';
import { logger } from '@/utils/logger';
import type { ContextOptions, TextSelection } from './types';


/**
 * 获取浏览器中选中的文本及其上下文。
 * * @param options - 配置对象，用于指定选区前后的句子数量。
 * @param options.beforeSentences - 需要包含在选区前的句子数量，默认为 0。
 * @param options.afterSentences - 需要包含在选区后的句子数量，默认为 0。
 * @returns 返回一个包含上下文和高亮选区的字符串，如果没有有效选区则返回 null。
 */
export function getSelectedTextWithContext(
    selection: Selection,
    options: ContextOptions = {}
): TextSelection | null {
    const { beforeSentences = 0, afterSentences = 0 } = options;

    // 1. 获取选区的 Range 对象，这是精确定位的关键
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (selectedText.length === 0) {
        return null;
    }

    // 2. 寻找包含选区的“段落”级别的容器元素
    let container = range.commonAncestorContainer;
    // 如果起始点是文本节点，我们从其父元素开始查找
    if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement!;
    }

    // 向上遍历DOM树，找到一个合适的块级元素作为上下文容器
    const blockElements = ['P', 'DIV', 'LI', 'ARTICLE', 'SECTION', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    while (container && container.nodeType === Node.ELEMENT_NODE && !blockElements.includes((container as Element).tagName)) {
        // body是最后的屏障
        if ((container as Element).tagName === 'BODY') break;
        container = container.parentElement!;
    }

    if (!container) {
        // 如果找不到合适的容器，直接返回带标签的选中文本
        return {
            text: selectedText,
            context: `<selected_text>${selectedText}</selected_text>`,
        };
    }

    // 3. 精确地获取选区前后的文本，以解决重复文本的问题
    // 创建一个新的 Range，从段落容器的开始到用户选区的开始
    const beforeRange = document.createRange();
    beforeRange.setStart(container, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const prefixText = beforeRange.toString();

    // 创建另一个 Range，从用户选区的结束到段落容器的结束
    const afterRange = document.createRange();
    afterRange.setStart(range.endContainer, range.endOffset);
    afterRange.setEnd(container, container.childNodes.length);
    const suffixText = afterRange.toString();

    // 4. 使用 sbd 库进行智能句子分割
    const prefixSentences = splitSentences(prefixText);
    const suffixSentences = splitSentences(suffixText);

    // 5. 根据参数提取上下文句子
    const contextBefore = beforeSentences > 0
        ? prefixSentences.slice(-beforeSentences).join(' ').trim()
        : '';

    const contextAfter = afterSentences > 0
        ? suffixSentences.slice(0, afterSentences).join(' ').trim()
        : '';

    logger.log('[getSelectedTextWithContext] selectedText:', selectedText)
    logger.log('[getSelectedTextWithContext] contextBefore:', contextBefore)
    logger.log('[getSelectedTextWithContext] contextAfter:', contextAfter)

    // 6. 组合最终结果
    const parts = [];
    if (contextBefore) parts.push(contextBefore);

    // 添加带标签的选中文本
    parts.push(`<selected_text>${selectedText}</selected_text>`);

    if (contextAfter) parts.push(contextAfter);

    return {
        text: selectedText,
        context: parts.join(' ').replace(/\s+/g, ' '),
    };
}