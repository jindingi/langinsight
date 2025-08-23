import { createDeepSeek } from '@ai-sdk/deepseek'
import { getModelConfig } from '@/config/config-bridge'

class LLMModelService {
    private static instance: LLMModelService

    private constructor() {}

    static getInstance(): LLMModelService {
        if (!LLMModelService.instance) {
            LLMModelService.instance = new LLMModelService()
        }
        return LLMModelService.instance
    }

    async getModel() {
        const modelConfig = await getModelConfig()
        const { modelProvider, apiKey, modelName } = modelConfig
        switch (modelProvider) {
            case 'deepseek':
                return createDeepSeek({
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
