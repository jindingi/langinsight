import { getOpenAIClient } from '@/lib/llm/openai'
import {
    SELECTED_TEXT_MARKER,
    SELECTED_TEXT_MARKER_END,
} from '@/consts/selection'
import { convertToModelMessages, ModelMessage, streamText } from 'ai'
import { logger } from '@/utils/logger'
import { getWordMeaningPrompt } from '@/prompts/word_meaning'
import { llmModelService } from '@/services/llm-model-service'
import { getLanguageConfig } from '@/config/config-bridge'

class LLMService {
    async streamText(
        messages: ModelMessage[],
        abortSignal: AbortSignal | null,
    ) {
        const languageConfig = await getLanguageConfig()
        const systemPrompt = getWordMeaningPrompt(languageConfig.targetLanguage)
        const model = await llmModelService.getModel()
        const result = streamText({
            model: model,
            system: systemPrompt,
            messages: messages,
            abortSignal: abortSignal || undefined,
        })
        return result
    }
    getFetchFunction() {
        return async (_input: RequestInfo | URL, init?: RequestInit) => {
            const m = JSON.parse(init?.body as string)
            logger.log('[ChatApp.customFetch] messages:', m.messages)
            const modelMessages: ModelMessage[] = convertToModelMessages(
                m.messages,
            )

            try {
                const result = await this.streamText(
                    modelMessages,
                    init?.signal || null,
                )
                return result.toUIMessageStreamResponse()
            } catch (error) {
                logger.error('[ChatApp.customFetch] error:', error)
                return new Response('Error calling LLM', {
                    status: 500,
                    statusText: 'Internal Server Error',
                })
            }
        }
    }
    
    getCompletionFetchFunction() {
        return async (_input: RequestInfo | URL, init?: RequestInit) => {
            const m = JSON.parse(init?.body as string)
            logger.log('[ChatApp.customFetch] messages:', m.messages)
            const modelMessages: ModelMessage[] = [
               {
                role: 'user',
                content: m.prompt,
               } 
            ]

            try {
                const result = await this.streamText(
                    modelMessages,
                    init?.signal || null,
                )
                return result.toUIMessageStreamResponse()
            } catch (error) {
                logger.error('[ChatApp.customFetch] error:', error)
                return new Response('Error calling LLM', {
                    status: 500,
                    statusText: 'Internal Server Error',
                })
            }
        }
    }

    async translateText(
        text: string,
        from: string,
        to: string,
    ): Promise<string> {
        if (!text || !from || !to) {
            throw new Error('Invalid parameters')
        }
        const client = await getOpenAIClient()
        const systemPrompt = `
        You are a helpful assistant that translates text from ${from} to ${to}.
        Please return the translated text only, without any other text.
        Please translate the following text:
        `
        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
        })
        return response.choices?.[0]?.message?.content || ''
    }

    async selectedTextMeaning(text: string): Promise<string> {
        if (!text) {
            throw new Error('Invalid parameters')
        }
        if (
            !text.includes(SELECTED_TEXT_MARKER) ||
            !text.includes(SELECTED_TEXT_MARKER_END)
        ) {
            throw new Error('Invalid parameters, no selected text found')
        }
        const client = await getOpenAIClient()
        const systemPrompt = `
你是一位资深的语言学习导师，精通多种语言，擅长帮助学生通过上下文理解来掌握词汇和短语。
请根据我提供的文本，解释我选中的词语、短语或句子在上下文中的具体含义。你的解释应包括以下几个部分：

1. 释义： 给出该词语在当前语境下的直接意思，避免脱离语境的单一词典解释。

2. 核心概念/用法(可选): 解释该词语或短语背后的核心思想、情感或文化内涵，并说明它通常在什么情境下使用。

3. 示例(可选): 提供1到2个与原文语境相似的、简单易懂的例句,帮助我更好地理解和记忆。

请在解释时，使用简洁、清晰的语言，并针对语言学习者，避免使用过于专业的术语。选中的文本使用'${SELECTED_TEXT_MARKER}'和'${SELECTED_TEXT_MARKER_END}'包裹。`

        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
        })
        return response.choices?.[0]?.message?.content || ''
    }
}

export const llmService = new LLMService()
