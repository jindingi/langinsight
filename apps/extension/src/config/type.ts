import { z } from 'zod'

export const configSchema = z.object({
    openaiApiKey: z.string(),
})
export type Config = z.infer<typeof configSchema>