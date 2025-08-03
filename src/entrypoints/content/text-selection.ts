import type { TextSelection } from './types';
import debounce from 'lodash.debounce';
import { logger } from '@/utils/logger';

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

        // 3. 确定一个合理的上下文容器
        // range.commonAncestorContainer 是包含整个选区的最深层节点
        const ancestor = range.commonAncestorContainer;
        const containerElement = ancestor.nodeType === Node.TEXT_NODE
            ? ancestor.parentElement
            : ancestor as HTMLElement;

        if (!containerElement) {
            return null;
        }

        const fullContext = containerElement.textContent || "";

        // 4. ✨ 关键步骤：计算选区在容器内的绝对起始偏移量
        // 为了处理重复单词的情况，我们不能简单地使用 indexOf()。
        // 我们创建一个新的 Range，它从容器的开头开始，到我们选区的开头结束。
        // 这个新 Range 的文本长度就是我们选区的绝对起始位置。
        const preRange = document.createRange();
        preRange.selectNodeContents(containerElement);
        preRange.setEnd(range.startContainer, range.startOffset);
        const startOffset = preRange.toString().length;

        const endOffset = startOffset + selectedText.length;

        // 5. 使用计算出的偏移量来构建带有 <selected_text> 标签的上下文
        const contextWithTag =
            `${fullContext.substring(0, startOffset)}` +
            `${this.TEXT_TAG_START}${fullContext.substring(startOffset, endOffset)}${this.TEXT_TAG_END}` +
            `${fullContext.substring(endOffset)}`;

        logger.info('contextWithTag', contextWithTag)

        // 6. 控制上下文长度，避免过长的文本
        const truncatedContext = this.truncateContext(contextWithTag);
        logger.info('truncatedContext', truncatedContext)

        return {
            text: selectedText,
            context: truncatedContext,
            rect: rect,
        };
    }

    /**
     * 截取上下文文本，优先使用句子数量控制，如果结果太长则回退到字符长度控制
     * @param context 包含 <selected_text> 标签的完整上下文
     * @returns 截取后的上下文
     */
    private truncateContext(context: string): string {
        // 首先尝试按句子数量截取
        const sentenceBasedResult = this.truncateContextBySentences(context);

        // 如果句子数量截取的结果长度合理，直接返回
        if (sentenceBasedResult.length <= this.maxContextLength) {
            return sentenceBasedResult;
        }

        // 否则回退到字符长度截取
        return this.truncateContextByLength(context);
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
     * 根据字符长度截取上下文（原有逻辑）
     * @param context 包含 <selected_text> 标签的完整上下文
     * @returns 截取后的上下文
     */
    private truncateContextByLength(context: string): string {
        if (context.length <= this.maxContextLength) {
            return context;
        }

        // 找到 <selected_text> 标签的位置
        const selectedStart = context.indexOf(this.TEXT_TAG_START);
        const selectedEnd = context.indexOf(this.TEXT_TAG_END) + this.TEXT_TAG_END.length;

        if (selectedStart === -1 || selectedEnd === -1) {
            // 如果没有找到标签，直接截取前面部分
            return context.substring(0, this.maxContextLength);
        }

        const selectedTextLength = selectedEnd - selectedStart;

        // 如果选中文本本身就超过了最大长度，返回选中文本部分
        if (selectedTextLength >= this.maxContextLength) {
            return context.substring(selectedStart, selectedEnd);
        }

        // 计算前后可用的字符数
        const availableLength = this.maxContextLength - selectedTextLength;
        const beforeLength = Math.floor(availableLength / 2);
        const afterLength = availableLength - beforeLength;

        // 计算初始截取的起始和结束位置
        let beforeStart = Math.max(0, selectedStart - beforeLength);
        let afterEnd = Math.min(context.length, selectedEnd + afterLength);

        // 调整前面的截取点到句子边界
        beforeStart = this.adjustToSentenceBoundary(context, beforeStart, selectedStart, 'before');

        // 调整后面的截取点到句子边界
        afterEnd = this.adjustToSentenceBoundary(context, selectedEnd, afterEnd, 'after');

        // 重新计算长度，如果还是太长，则使用原始截取方法
        const finalLength = afterEnd - beforeStart;
        if (finalLength > this.maxContextLength * 1.2) { // 允许20%的超出
            // 回退到严格的字符限制
            beforeStart = Math.max(0, selectedStart - beforeLength);
            afterEnd = Math.min(context.length, selectedEnd + afterLength);

            // 如果前面空间不足，将多余空间分配给后面
            const actualBeforeLength = selectedStart - beforeStart;
            if (actualBeforeLength < beforeLength) {
                const extraSpace = beforeLength - actualBeforeLength;
                afterEnd = Math.min(context.length, afterEnd + extraSpace);
            }

            // 如果后面空间不足，将多余空间分配给前面
            const actualAfterLength = afterEnd - selectedEnd;
            if (actualAfterLength < afterLength) {
                const extraSpace = afterLength - actualAfterLength;
                beforeStart = Math.max(0, beforeStart - extraSpace);
            }
        }

        return context.substring(beforeStart, afterEnd);
    }

    /**
     * 调整截取位置到句子边界
     * @param context 完整上下文
     * @param start 当前位置
     * @param boundary 边界位置（不能超过）
     * @param direction 方向：'before' 表示向前找句子开头，'after' 表示向后找句子结尾
     * @returns 调整后的位置
     */
    private adjustToSentenceBoundary(context: string, start: number, boundary: number, direction: 'before' | 'after'): number {
        // 句子结束符
        const sentenceEnders = /[.!?。！？]/;
        // 句子开始的模式（大写字母或数字开头，前面可能有空格、引号等）
        const sentenceStarters = /[\s"'"\n\r]*[A-Z0-9]/;

        if (direction === 'before') {
            // 向前找句子开头
            for (let i = start; i < boundary; i++) {
                const char = context[i];
                const prevChar = i > 0 ? context[i - 1] : '';

                // 如果前一个字符是句子结束符，当前字符是句子开始模式
                if (sentenceEnders.test(prevChar) && sentenceStarters.test(context.substring(i))) {
                    // 跳过开头的空格和引号
                    let adjustedPos = i;
                    while (adjustedPos < boundary && /[\s"'"]/.test(context[adjustedPos])) {
                        adjustedPos++;
                    }
                    return adjustedPos;
                }
            }

            // 如果没找到句子边界，查看起始位置是否已经是句子开头
            if (sentenceStarters.test(context.substring(start))) {
                return start;
            }

            // 没找到合适的句子边界，返回原位置
            return start;

        } else { // direction === 'after'
            // 向后找句子结尾
            for (let i = boundary - 1; i >= start; i--) {
                const char = context[i];

                // 如果是句子结束符
                if (sentenceEnders.test(char)) {
                    // 确保下一个字符不是同样的标点（避免省略号等情况）
                    const nextChar = i + 1 < context.length ? context[i + 1] : '';
                    if (!sentenceEnders.test(nextChar) || nextChar !== char) {
                        return i + 1;
                    }
                }
            }

            // 没找到句子结束符，返回原位置
            return boundary;
        }
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


export class TextSelectionManager {
    private textSelector: TextSelector = new TextSelector();
    private currentSelection: TextSelection | null = null;
    private readonly debounceTime = 100;

    constructor(
        private onSelectionChange: (selection: TextSelection | null) => void,
        private isPopupOpen: () => boolean
    ) { }

    private getSelectedText(): TextSelection | null {
        const selected = this.textSelector.getSelectedText();
        if (selected) {
            console.log('Text selected:', selected.text);
            console.log('Selection position:', selected.rect);
            console.log('Selection context:', selected.context);
            return selected;
        }
        return null;
    }

    private debouncedSelectionHandler = debounce(() => {

        const selection = window.getSelection();

        if (selection && selection.toString().trim().length > 0) {
            this.currentSelection = this.getSelectedText();

            // Notify about selection change
            this.onSelectionChange(this.currentSelection);
        } else {
            // Only clear if popup is not currently open
            if (!this.isPopupOpen()) {
                console.log('🔄 No text selected, clearing everything');
                this.currentSelection = null;
                this.onSelectionChange(null);
            } else {
                console.log('🔄 No text selected, but popup is open - keeping popup');
            }
        }
    }, this.debounceTime);

    handleTextSelection() {
        this.debouncedSelectionHandler();
    }


    getCurrentSelection(): TextSelection | null {
        return this.currentSelection;
    }

    clearSelection() {
        this.currentSelection = null;
    }
} 