import { storage } from '#imports'
import { getConfig } from '@/config/config'
import { Config, configSchema } from '@/config/type'
import { logger } from '@/utils/logger'

/**
 * Interface matching jotai's AsyncStorage
 */
interface AsyncStorage<T> {
  getItem: (key: string) => Promise<T>
  setItem: (key: string, value: T) => Promise<void>
  removeItem: (key: string) => Promise<void>
  watch: (key: string, callback: (value: T) => void) => void
}

/**
 * WXT Storage adapter for jotai/utils atomWithStorage
 * Implements the AsyncStorage interface from jotai
 */
export class WXTStorageAdapter implements AsyncStorage<Config | null> {
  private getStorageKey(key: string): `local:${string}` {
    return `local:${key}`
  }

  async getItem(key: string): Promise<Config | null> {
    const storageKey = this.getStorageKey(key)
    const resultStr: string | null = await storage.getItem(storageKey)
    if (resultStr == null) {
      return null
    }
    try {
      const result = configSchema.safeParse(JSON.parse(resultStr))
      if (result.error) {
        logger.error(`Error parsing item ${storageKey}`, result.error)
        return null
      }
      logger.info(`Got item ${storageKey}`)
      return result.data
    } catch (error) {
      logger.error(`Error parsing item ${storageKey}`, error)
      return null
    }
  }

  async setItem(key: string, value: Config | null): Promise<void> {
    if (value == null) {
      return
    }
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

  watch(key: string, callback: (value: Config | null) => void): void {
    const storageKey = this.getStorageKey(key)
    storage.watch(storageKey, async (valueStr: string | null) => {
      if (valueStr == null) {
        callback(null)
        return
      }
      try {
        const parsedValue = JSON.parse(valueStr)
        const result = configSchema.safeParse(parsedValue)
        if (result.success) {
          callback(result.data)
        } else {
          logger.error(`Error validating watched value for ${storageKey}`, result.error)
          callback(null)
        }
      } catch (error) {
        logger.error(`Error parsing watched value for ${storageKey}`, error)
        callback(null)
      }
    })
  }
}

// Create a singleton instance
export const wxtStorageAdapter = new WXTStorageAdapter()
