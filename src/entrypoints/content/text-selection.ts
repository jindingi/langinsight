import type { TextSelection } from './types';
import debounce from 'lodash.debounce';
import { logger } from '@/utils/logger';
import DOMPurify from 'dompurify';

export class TextSelector {
    private readonly maxContextLength = 1000;
    private readonly beforeSentences = 3; // 选中文本前的句子数量
    private readonly afterSentences = 1;  // 选中文本后的句子数量
    readonly TEXT_TAG_START = '<selected_text>';
    readonly TEXT_TAG_END = '</selected_text>';

    /**
     * Gets the currently selected text on the page, its context, and its position.
     * This method is designed to be run in a browser environment (e.g., a content script).
     * @returns A TextSelection object, or null if no text is selected.
     */
    public getSelectedText(): TextSelection | null {
        const selection = window.getSelection();

        // 1. 检查是否存在选区，以及选区是否为空（例如只是一个光标）
        if (!selection || selection.isCollapsed) {
            return null;
        }

        const selectedText = selection.toString().trim();
        if (!selectedText) {
            return null;
        }

        // 2. 获取选区的 Range 对象，这是所有精确信息的核心
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // 3. 找到包含选中文本的段落容器
        const paragraphContainer = this.findParagraphContainer(range);
        if (!paragraphContainer) {
            return null;
        }
        logger.log('paragraphContainer', paragraphContainer)

        // 4. 获取段落容器的纯文本内容
        const paragraphText = this.getSpecificParagraphText(paragraphContainer, range);
        if (!paragraphText) {
            return null;
        }

        logger.log('paragraphText', paragraphText);

        // 5. 计算选中文本在段落中的位置
        const { startOffset, endOffset } = this.calculateTextPositionInParagraph(range, paragraphContainer, paragraphText);
        if (startOffset === -1 || endOffset === -1) {
            return null;
        }

        // 6. 构建带有 <selected_text> 标签的上下文
        const contextWithTag =
            `${paragraphText.substring(0, startOffset)}` +
            `${this.TEXT_TAG_START}${paragraphText.substring(startOffset, endOffset)}${this.TEXT_TAG_END}` +
            `${paragraphText.substring(endOffset)}`;

        logger.log('contextWithTag', contextWithTag)

        // 7. 控制上下文长度，避免过长的文本
        const truncatedContext = this.truncateContext(contextWithTag);
        logger.log('truncatedContext', truncatedContext)

        return {
            text: selectedText,
            context: truncatedContext,
            rect: rect,
        };
    }

    /**
     * 找到包含选中文本的段落容器
     * @param range 选区的 Range 对象
     * @returns 段落容器元素，如果找不到则返回 null
     */
    private findParagraphContainer(range: Range): HTMLElement | null {
        // 从选中文本的起始节点开始向上遍历
        let currentNode: Node | null = range.startContainer;

        while (currentNode && currentNode !== document.body) {
            // 如果当前节点是元素节点
            if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const element = currentNode as HTMLElement;

                // 检查是否是段落容器
                if (this.isParagraphContainer(element)) {
                    return element;
                }
            }

            // 向上遍历到父节点
            currentNode = currentNode.parentNode;
        }

        // 如果没找到段落容器，使用原来的逻辑
        const ancestor = range.commonAncestorContainer;
        return ancestor.nodeType === Node.TEXT_NODE
            ? ancestor.parentElement
            : ancestor as HTMLElement;
    }

    /**
     * 判断元素是否是段落容器
     * @param element 要检查的元素
     * @returns 是否是段落容器
     */
    private isParagraphContainer(element: HTMLElement): boolean {
        // 检查标签名
        const blockTags = ['P', 'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE', 'HEADER', 'FOOTER'];
        if (blockTags.includes(element.tagName)) {
            return true;
        }

        // 检查是否有段落相关的类名或属性
        const className = element.className?.toLowerCase() || '';
        const id = element.id?.toLowerCase() || '';

        const paragraphKeywords = ['paragraph', 'text', 'content', 'body'];
        if (paragraphKeywords.some(keyword => className.includes(keyword) || id.includes(keyword))) {
            return true;
        }

        // 检查是否包含 <br> 标签（表示段落分隔）
        if (element.querySelector('br')) {
            return true;
        }

        // 检查是否在视觉上是一个独立的文本块
        const rect = element.getBoundingClientRect();
        const hasReasonableSize = rect.width > 100 && rect.height > 20;

        return hasReasonableSize;
    }

    /**
 * 获取段落容器的纯文本内容
 * @param container 段落容器元素
 * @returns 纯文本内容
 */
    private getParagraphText(container: HTMLElement): string {
        // 克隆容器以避免修改原始 DOM
        const clonedContainer = container.cloneNode(true) as HTMLElement;

        // 使用 DOMPurify 清理 HTML，只保留文本内容
        const cleanHtml = DOMPurify.sanitize(clonedContainer.innerHTML, {
            ALLOWED_TAGS: [], // 不允许任何标签
            ALLOWED_ATTR: [], // 不允许任何属性
        });

        // 将 HTML 实体转换为普通字符
        const textarea = document.createElement('textarea');
        textarea.innerHTML = cleanHtml;
        const cleanText = textarea.value;

        // 清理多余的空白字符
        return cleanText.replace(/\s+/g, ' ').trim();
    }

    /**
     * 获取包含选中文本的具体段落内容
     * @param container 段落容器元素
     * @param range 选区的 Range 对象
     * @returns 段落纯文本内容
     */
    private getSpecificParagraphText(container: HTMLElement, range: Range): string {
        // 检查容器是否包含 <br> 标签（表示段落分隔）
        const hasBrTags = container.querySelector('br');

        if (!hasBrTags) {
            // 如果没有 <br> 标签，直接返回整个容器的文本
            return this.getParagraphText(container);
        }

        // 如果有 <br> 标签，需要找到包含选中文本的具体段落
        return this.extractParagraphContainingSelection(container, range);
    }

    /**
     * 从包含多个段落的容器中提取包含选中文本的具体段落
     * @param container 包含多个段落的容器
     * @param range 选区的 Range 对象
     * @returns 包含选中文本的段落内容
     */
    private extractParagraphContainingSelection(container: HTMLElement, range: Range): string {
        // 获取选中文本在容器中的位置
        const selectedText = range.toString().trim();

        // 获取容器的所有文本节点
        const textNodes = this.getTextNodes(container);

        // 找到包含选中文本的文本节点
        let targetNode: Text | null = null;
        let targetOffset = 0;

        for (const textNode of textNodes) {
            const nodeText = textNode.textContent || '';
            const index = nodeText.indexOf(selectedText);
            if (index !== -1) {
                targetNode = textNode;
                targetOffset = index;
                break;
            }
        }

        if (!targetNode) {
            // 如果找不到精确匹配，返回整个容器的文本
            return this.getParagraphText(container);
        }

        // 找到包含该文本节点的段落
        const paragraph = this.findParagraphContainingNode(targetNode);

        if (paragraph) {
            return this.getParagraphText(paragraph);
        }

        // 如果找不到段落，返回整个容器的文本
        return this.getParagraphText(container);
    }

    /**
     * 获取元素中的所有文本节点
     * @param element 要遍历的元素
     * @returns 文本节点数组
     */
    private getTextNodes(element: HTMLElement): Text[] {
        const textNodes: Text[] = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node: Node | null;
        while (node = walker.nextNode()) {
            textNodes.push(node as Text);
        }

        return textNodes;
    }

    /**
     * 找到包含指定节点的段落元素
     * @param node 要查找的节点
     * @returns 段落元素，如果找不到则返回 null
     */
    private findParagraphContainingNode(node: Node): HTMLElement | null {
        let currentNode: Node | null = node;

        while (currentNode && currentNode !== document.body) {
            if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const element = currentNode as HTMLElement;

                // 检查是否是段落元素
                if (this.isParagraphElement(element)) {
                    return element;
                }

                // 检查是否包含 <br> 标签（表示段落分隔）
                if (element.querySelector('br')) {
                    // 这是一个包含多个段落的容器，需要进一步处理
                    return this.extractParagraphFromContainer(element, node);
                }
            }

            currentNode = currentNode.parentNode;
        }

        return null;
    }

    /**
     * 判断元素是否是段落元素
     * @param element 要检查的元素
     * @returns 是否是段落元素
     */
    private isParagraphElement(element: HTMLElement): boolean {
        const paragraphTags = ['P', 'DIV', 'SECTION', 'ARTICLE'];
        return paragraphTags.includes(element.tagName);
    }

    /**
     * 从包含多个段落的容器中提取包含指定节点的段落
     * @param container 包含多个段落的容器
     * @param targetNode 目标节点
     * @returns 段落元素
     */
    private extractParagraphFromContainer(container: HTMLElement, targetNode: Node): HTMLElement {
        // 获取容器的 HTML 内容
        const containerHtml = container.innerHTML;

        // 使用 <br> 标签分割段落
        const paragraphs = containerHtml.split(/<br\s*\/?>/i);

        // 找到包含目标节点的段落
        for (let i = 0; i < paragraphs.length; i++) {
            const paragraphHtml = paragraphs[i];

            // 创建临时元素来检查段落内容
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = paragraphHtml;

            // 检查这个段落是否包含目标节点
            if (this.containsNode(tempDiv, targetNode)) {
                return tempDiv;
            }
        }

        // 如果找不到，返回整个容器
        return container;
    }

    /**
     * 检查元素是否包含指定节点
     * @param container 容器元素
     * @param targetNode 目标节点
     * @returns 是否包含目标节点
     */
    private containsNode(container: HTMLElement, targetNode: Node): boolean {
        // 检查目标节点是否在容器内
        if (container.contains(targetNode)) {
            return true;
        }

        // 检查目标节点的文本内容是否在容器中
        const targetText = targetNode.textContent || '';
        const containerText = container.textContent || '';

        return containerText.includes(targetText);
    }

    /**
     * 计算选中文本在段落中的位置
     * @param range 选区的 Range 对象
     * @param container 段落容器
     * @param paragraphText 段落纯文本
     * @returns 选中文本在段落中的起始和结束位置
     */
    private calculateTextPositionInParagraph(
        range: Range,
        container: HTMLElement,
        paragraphText: string
    ): { startOffset: number; endOffset: number } {
        // 获取选中文本
        const selectedText = range.toString().trim();

        // 在段落文本中查找选中文本的位置
        const startIndex = paragraphText.indexOf(selectedText);
        if (startIndex !== -1) {
            const endIndex = startIndex + selectedText.length;
            return { startOffset: startIndex, endOffset: endIndex };
        }

        // 如果找不到完全匹配，尝试模糊匹配
        return this.findFuzzyMatch(selectedText, paragraphText);
    }

    /**
     * 模糊匹配选中文本在段落中的位置
     * @param selectedText 选中的文本
     * @param paragraphText 段落文本
     * @returns 匹配的位置
     */
    private findFuzzyMatch(selectedText: string, paragraphText: string): { startOffset: number; endOffset: number } {
        // 移除选中文本中的多余空白
        const cleanSelectedText = selectedText.replace(/\s+/g, ' ').trim();

        // 尝试不同的匹配策略
        const strategies = [
            // 策略1：直接匹配
            () => {
                const index = paragraphText.indexOf(cleanSelectedText);
                return index !== -1 ? { startOffset: index, endOffset: index + cleanSelectedText.length } : null;
            },
            // 策略2：忽略大小写匹配
            () => {
                const index = paragraphText.toLowerCase().indexOf(cleanSelectedText.toLowerCase());
                return index !== -1 ? { startOffset: index, endOffset: index + cleanSelectedText.length } : null;
            },
            // 策略3：匹配单词边界
            () => {
                const words = cleanSelectedText.split(/\s+/);
                if (words.length === 1) {
                    const index = paragraphText.indexOf(words[0]);
                    return index !== -1 ? { startOffset: index, endOffset: index + words[0].length } : null;
                }
                return null;
            }
        ];

        for (const strategy of strategies) {
            const result = strategy();
            if (result) {
                return result;
            }
        }

        // 如果都找不到，返回段落开头
        return { startOffset: 0, endOffset: Math.min(selectedText.length, paragraphText.length) };
    }

    /**
     * 截取上下文文本，使用句子数量控制
     * @param context 包含 <selected_text> 标签的完整上下文
     * @returns 截取后的上下文
     */
    private truncateContext(context: string): string {
        const sentenceBasedResult = this.truncateContextBySentences(context);
        return sentenceBasedResult;
    }

    /**
     * 根据句子数量截取上下文
     * @param context 包含 <selected_text> 标签的完整上下文
     * @returns 截取后的上下文
     */
    private truncateContextBySentences(context: string): string {
        // 找到 <selected_text> 标签的位置
        const selectedStart = context.indexOf(this.TEXT_TAG_START);
        const selectedEnd = context.indexOf(this.TEXT_TAG_END) + this.TEXT_TAG_END.length;

        if (selectedStart === -1 || selectedEnd === -1) {
            // 如果没有找到标签，直接返回原文
            return context;
        }

        // 在选中文本前找指定数量的句子
        const beforeStart = this.findSentencesBefore(context, selectedStart, this.beforeSentences);

        // 在选中文本后找指定数量的句子
        const afterEnd = this.findSentencesAfter(context, selectedEnd, this.afterSentences);

        return context.substring(beforeStart, afterEnd);
    }

    /**
     * 在指定位置前查找指定数量的句子的起始位置
     * @param context 完整上下文
     * @param position 当前位置
     * @param sentenceCount 需要查找的句子数量
     * @returns 句子起始位置
     */
    private findSentencesBefore(context: string, position: number, sentenceCount: number): number {
        if (sentenceCount <= 0) return position;

        const sentenceEnders = /[.!?。！？]/;
        const sentenceStarters = /[\s"'"\n\r]*[A-Z0-9]/;
        let foundSentences = 0;
        let currentPos = position;

        // 向前搜索句子
        for (let i = position - 1; i >= 0; i--) {
            const char = context[i];

            // 如果找到句子结束符
            if (sentenceEnders.test(char)) {
                // 确保不是连续的标点符号
                const nextChar = i + 1 < context.length ? context[i + 1] : '';
                if (!sentenceEnders.test(nextChar) || nextChar !== char) {
                    foundSentences++;

                    if (foundSentences >= sentenceCount) {
                        // 找到足够的句子，现在寻找下一句的开头
                        for (let j = i + 1; j < position; j++) {
                            if (sentenceStarters.test(context.substring(j))) {
                                // 跳过开头的空格和引号
                                let adjustedPos = j;
                                while (adjustedPos < position && /[\s"'"]/.test(context[adjustedPos])) {
                                    adjustedPos++;
                                }
                                return adjustedPos;
                            }
                        }
                        return i + 1; // 如果没找到合适的开头，返回标点后的位置
                    }
                }
            }
        }

        // 没找到足够的句子，返回文本开头
        return 0;
    }

    /**
     * 在指定位置后查找指定数量的句子的结束位置
     * @param context 完整上下文
     * @param position 当前位置
     * @param sentenceCount 需要查找的句子数量
     * @returns 句子结束位置
     */
    private findSentencesAfter(context: string, position: number, sentenceCount: number): number {
        if (sentenceCount <= 0) return position;

        const sentenceEnders = /[.!?。！？]/;
        let foundSentences = 0;

        // 向后搜索句子
        for (let i = position; i < context.length; i++) {
            const char = context[i];

            // 如果找到句子结束符
            if (sentenceEnders.test(char)) {
                // 确保不是连续的标点符号
                const nextChar = i + 1 < context.length ? context[i + 1] : '';
                if (!sentenceEnders.test(nextChar) || nextChar !== char) {
                    foundSentences++;

                    if (foundSentences >= sentenceCount) {
                        return i + 1; // 返回标点后的位置
                    }
                }
            }
        }

        // 没找到足够的句子，返回文本结尾
        return context.length;
    }
}


