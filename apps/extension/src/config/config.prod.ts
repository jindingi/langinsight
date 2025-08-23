import { Config } from './type'
import { Language } from '@/consts/language'

export const DEFAULT_CONFIG_PROD: Config = {
    model: {
        modelProvider: 'deepseek',
        modelName: 'deepseek-chat',
        apiKey: '',
    },
    language: {
        targetLanguage: Language.English,
    },
}
