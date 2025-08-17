import { getConfig } from '@/config/config'
import OpenAI from 'openai'


/**
 * OpenAI client manager that maintains a singleton instance
 * and recreates the client only when the API key changes
 */
class OpenAIManager {
  private static instance: OpenAIManager
  private baseURL: string
  private defaultModel: string
  private client: OpenAI | null = null
  private currentApiKey: string = ''

  private constructor(baseURL: string = 'https://api.deepseek.com', defaultModel: string = 'deepseek-chat') {
    this.baseURL = baseURL
    this.defaultModel = defaultModel
  }

  static getInstance(): OpenAIManager {
    if (!OpenAIManager.instance) {
      OpenAIManager.instance = new OpenAIManager()
    }
    return OpenAIManager.instance
  }

  /**
   * Get the OpenAI client instance. Creates a new client if:
   * 1. No client exists
   * 2. API key has changed
   */
  async getClient(): Promise<OpenAI> {
    const cfg = await getConfig()
    const apiKey = cfg?.openaiApiKey

    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set it in the extension popup.')
    }

    // Create new client if API key changed or no client exists
    if (!this.client || this.currentApiKey !== apiKey) {
      this.client = new OpenAI({
        baseURL: this.baseURL,
        apiKey,
      })
      this.currentApiKey = apiKey
      logger.log('OpenAI client created')
      const testResult = await this.testConnection()
      logger.log('OpenAI test connection result:', testResult)
    }

    return this.client
  }

  async testConnection(model: string = this.defaultModel): Promise<boolean> {
    const client = await this.getClient()
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Say hello to me. Do not say anything else.' }],
    })
    if (response.choices?.[0]?.message?.content) {
      return true
    }
    return false
  }

  /**
   * Check if a valid API key is set
   */
  async hasValidApiKey(): Promise<boolean> {
    const cfg = await getConfig()
    const apiKey = cfg?.openaiApiKey
    return Boolean(apiKey)
  }

  /**
   * Reset the client instance.
   * Useful for testing or when you need to force a new client creation.
   */
  reset(): void {
    this.client = null
    this.currentApiKey = ''
  }
}

// Export singleton instance
export const openAIManager = OpenAIManager.getInstance()

// Export convenience methods
export const getOpenAIClient = () => openAIManager.getClient()
export const testConnection = async () => {
  const hasKey = await openAIManager.hasValidApiKey()
  return hasKey ? await openAIManager.testConnection() : false
}
