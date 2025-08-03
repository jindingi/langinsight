// src/entrypoints/content/text-selection-v2.test.ts

/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// 假设您的函数和类型定义在这里
import { getSelectedTextWithContext } from './textSelection';

// 辅助函数：在 jsdom 中模拟文本选择 (这个函数无需改变)
function createSelectionInDOM(
    container: HTMLElement,
    startOffset: number,
    endOffset: number
) {
    const textNode = container.firstChild as Node;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        throw new Error('Test setup error: Container must have a single text node.');
    }

    const range = document.createRange();
    range.setStart(textNode, startOffset);
    range.setEnd(textNode, endOffset);

    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

describe('getSelectedTextWithContext', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        window.getSelection()?.removeAllRanges();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    // 测试1：传入的 Selection 对象无效或折叠
    it('should return null if the selection is collapsed', () => {
        const p = document.createElement('p');
        p.textContent = 'Hello world';
        document.body.appendChild(p);
        createSelectionInDOM(p, 5, 5); // 创建一个折叠的选区

        // 获取 selection 对象并传入
        const selection = window.getSelection()!;
        const result = getSelectedTextWithContext(selection);

        expect(result).toBeNull();
    });

    // 测试2：默认选项
    it('should return only the wrapped selected text with default options', () => {
        const p = document.createElement('p');
        p.textContent = 'The quick brown fox jumps over the lazy dog.';
        document.body.appendChild(p);
        createSelectionInDOM(p, 16, 19); // "fox"

        const selection = window.getSelection()!;
        const result = getSelectedTextWithContext(selection);

        // 断言需要修改以匹配 TextSelection 类型
        expect(result).not.toBeNull();
        expect(result!.context).toBe('<selected_text>fox</selected_text>');
    });
    // 测试3：唯一性
    it('should correctly identify the unique instance of a repeated text', () => {
        const p = document.createElement('p');
        p.textContent = 'to be, or not to be, that is the question.';
        document.body.appendChild(p);
        createSelectionInDOM(p, 14, 19); // 第二个 "to be"

        const selection = window.getSelection()!;
        const result = getSelectedTextWithContext(selection, {
            beforeSentences: 1,
            afterSentences: 1
        });

        expect(result).not.toBeNull();
        expect(result!.context).toBe('to be, or not <selected_text>to be</selected_text> , that is the question.');
    });

    // 测试4：上下文和句子分割
    it('should get basic context with before and after sentences', () => {
        const p = document.createElement('p');
        p.textContent = 'First sentence. Second sentence is here. Third sentence follows.';
        document.body.appendChild(p);
        createSelectionInDOM(p, 16, 40); // "Second sentence is here."

        const selection = window.getSelection()!;
        const result = getSelectedTextWithContext(selection, { beforeSentences: 1, afterSentences: 1 });

        expect(result).not.toBeNull();
        expect(result!.context).toBe('First sentence. <selected_text>Second sentence is here.</selected_text> Third sentence follows.');
    });
});