import { createDeepSeek } from '@ai-sdk/deepseek'
import { getConfig } from '@/config/config'

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
        const config = await getConfig()
        const { modelProvider, apiKey, modelName } = config.model
        switch (modelProvider) {
            case 'deepseek':
                return createDeepSeek({
                    apiKey: apiKey,
                })(modelName)
            default:
                throw new Error(
                    `Unsupported model provider: ${config.model.modelProvider}`,
                )
        }
    }
}

export const llmModelService = LLMModelService.getInstance()
