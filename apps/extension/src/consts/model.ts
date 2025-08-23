export const MODLE_PROVIDERS: string[] = [
    'openai',
    'deepseek',
    'anthropic',
    'google',
    'azure',
]

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
}
