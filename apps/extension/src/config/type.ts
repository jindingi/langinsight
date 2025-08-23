import { z } from 'zod'

export const modelProviderSchema = z.enum(['openai', 'deepseek', 'anthropic', 'google', 'azure']).default('openai')

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