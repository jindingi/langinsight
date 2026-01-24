type ModelProviderSettings = {
    baseUrlDefault: string
    enableCustomBaseUrl: boolean
    models: {
        id: string
        name: string
    }[]
}

export const MODEL_PROVIDER_SETTINGS: Record<string, ModelProviderSettings> = {
    openai: {
        baseUrlDefault: 'https://api.openai.com/v1',
        enableCustomBaseUrl: true,
        models: [
            {
                id: 'gpt-4o',
                name: 'GPT-4o',
            },
        ],
    },
    deepseek: {
        baseUrlDefault: 'https://api.deepseek.com/v1',
        enableCustomBaseUrl: false,
        models: [
            {
                id: 'deepseek-chat',
                name: 'DeepSeek Chat',
            },
            {
                id: 'deepseek-reasoner',
                name: 'DeepSeek Reasoner',
            },
        ],
    },
    openrouter: {
        baseUrlDefault: 'https://openrouter.ai/api/v1',
        enableCustomBaseUrl: false,
        models: [
            {
                id: 'google/gemini-2.5-flash-lite',
                name: 'Gemini 2.5 Flash Lite',
            },
            {
                id: 'openai/gpt-oss-20b',
                name: 'GPT-OSS-20B',
            },
            {
                id: 'openai/gpt-oss-120b',
                name: 'GPT-OSS-120B',
            },
        ],
    },
}

export const MODLE_PROVIDERS = Object.keys(MODEL_PROVIDER_SETTINGS)
