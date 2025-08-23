export const MODLE_PROVIDERS: string[] = ['openai', 'deepseek', 'anthropic', 'google', 'azure']

export const MODEL_PROVIDER_MODELS: Record<string, {
    models: {
        id: string
        name: string
    }[]
}> = {
    openai: {
        models: [
            {
                id: 'gpt-4o',
                name: 'GPT-4o',
            }
        ]
    },
    deepseek: {
        models: [
            {
                id: 'deepseek-chat',
                name: 'DeepSeek Chat',
            },
            {
                id: 'deepseek-reasoner',
                name: 'DeepSeek Reasoner',
            }
        ]
    }
}