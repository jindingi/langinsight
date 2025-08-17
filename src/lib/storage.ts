import { storage } from '#imports'
import { DEFAULT_CONFIG } from '@/config/config'
import { Config, configSchema } from '@/config/type'

/**
 * Interface matching jotai's AsyncStorage
 */
interface AsyncStorage<T> {
  getItem: (key: string) => Promise<T>
  setItem: (key: string, value: T) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

/**
 * WXT Storage adapter for jotai/utils atomWithStorage
 * Implements the AsyncStorage interface from jotai
 */
export class WXTStorageAdapter implements AsyncStorage<Config> {
  private getStorageKey(key: string): `local:${string}` {
    return `local:${key}`
  }

  async getItem(key: string): Promise<Config> {
    const storageKey = this.getStorageKey(key)
    const resultStr: string | null = await storage.getItem(storageKey)
    if (resultStr == null) {
      return DEFAULT_CONFIG
    }
    const result = configSchema.parse(JSON.parse(resultStr))
    logger.info(`Got item ${storageKey}`)
    return result
  }

  async setItem(key: string, value: Config): Promise<void> {
    const storageKey = this.getStorageKey(key)
    const valueStr = JSON.stringify(value)
    await storage.setItem<string>(storageKey, valueStr)
    logger.info(`Set item ${storageKey} to ${valueStr}`)
  }

  async removeItem(key: string): Promise<void> {
    const storageKey = this.getStorageKey(key)
    await storage.removeItem(storageKey)
    logger.info(`Removed item ${storageKey}`)
  }
}

// Create a singleton instance
export const wxtStorageAdapter = new WXTStorageAdapter()
