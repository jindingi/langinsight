import { SUPPORTED_TARGET_LANGUAGES } from '@/consts/language'
import { MODLE_PROVIDERS } from '@/consts/model'
import { z } from 'zod'

export const modelProviderSchema = z.enum(MODLE_PROVIDERS).default('deepseek')

export const modelSchema = z.object({
    modelProvider: modelProviderSchema,
    modelName: z.string(),
    baseUrl: z.url({ protocol: /^https$/ }).optional(),
    apiKey: z.string(),
})
export type ModelType = z.infer<typeof modelSchema>

export const languageSchema = z.object({
    targetLanguage: z.enum(SUPPORTED_TARGET_LANGUAGES),
})
export type LanguageType = z.infer<typeof languageSchema>

export const configSchema = z.object({
    model: modelSchema,
    language: languageSchema,
})
export type Config = z.infer<typeof configSchema>
