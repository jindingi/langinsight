import { MODLE_PROVIDERS } from '@/consts/model'
import { z } from 'zod'

export const modelProviderSchema = z.enum(MODLE_PROVIDERS).default('openai')

export const modelSchema = z.object({
    modelProvider: modelProviderSchema,
    modelName: z.string(),
    baseUrl: z.url({ protocol: /^https$/ }).optional(),
    apiKey: z.string(),
})

export const configSchema = z.object({
    model: modelSchema,
})
export type Config = z.infer<typeof configSchema>