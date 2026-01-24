import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenAI } from '@ai-sdk/openai';
import { getModelConfig } from '@/config/config-bridge'
import { LanguageModel } from 'ai';

class LLMModelService {
    private static instance: LLMModelService

    private constructor() { }

    static getInstance(): LLMModelService {
        if (!LLMModelService.instance) {
            LLMModelService.instance = new LLMModelService()
        }
        return LLMModelService.instance
    }

    async getModel(): Promise<LanguageModel> {
        const modelConfig = await getModelConfig()
        const { modelProvider, apiKey, modelName, baseUrl } = modelConfig
        logger.log('[LLMModelService.getModel] modelConfig:', modelConfig)
        switch (modelProvider) {
            case 'deepseek':
                return createDeepSeek({
                    apiKey: apiKey,
                })(modelName)
            case 'openai':
            case 'openrouter':
                return createOpenAI({
                    baseURL: baseUrl,
                    apiKey: apiKey,
                })(modelName)
            default:
                throw new Error(
                    `Unsupported model provider: ${modelProvider}`,
                )
        }
    }
}

export const llmModelService = LLMModelService.getInstance()
