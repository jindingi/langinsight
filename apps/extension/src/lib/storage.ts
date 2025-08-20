import { storage } from '#imports'
import { Config, configSchema } from '@/config/type'
import { logger } from '@/utils/logger'

/**
 * Interface matching jotai's AsyncStorage
 */
interface AsyncStorage<T> {
  getItem: (key: string, initialValue: T) => Promise<T>
  setItem: (key: string, value: T) => Promise<void>
  removeItem: (key: string) => Promise<void>
  subscribe?: (key: string, callback: (value: T) => void, initialValue: T) => () => void
}

/**
 * WXT Storage adapter for jotai/utils atomWithStorage
 * Implements the AsyncStorage interface from jotai
 */
export class WXTStorageAdapter implements AsyncStorage<Config | null> {
  private getStorageKey(key: string): `local:${string}` {
    return `local:${key}`
  }

  async getItem(key: string, initialValue: Config | null): Promise<Config | null> {
    const storageKey = this.getStorageKey(key)
    const resultStr: string | null = await storage.getItem(storageKey)
    if (resultStr == null) {
      return initialValue
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

  subscribe(key: string, callback: (value: Config | null) => void, initialValue: Config | null): () => void {
    const storageKey = this.getStorageKey(key)
    
    // Start watching and return a function that will eventually unsubscribe
    const unwatch = storage.watch(storageKey, async (valueStr: string | null) => {
      if (valueStr == null) {
        callback(initialValue)
        return
      }
      let newValue: Config | null = null
      try {
        const parsedValue = JSON.parse(valueStr)
        const result = configSchema.safeParse(parsedValue)
        if (result.success) {
          newValue = result.data
        } else {
          logger.error(`Error validating watched value for ${storageKey}`, result.error)
          newValue = initialValue
        }
      } catch (error) {
        logger.error(`Error parsing watched value for ${storageKey}`, error)
        newValue = initialValue
      }
      logger.info(`Watched value for ${storageKey} changed to ${newValue}`)
      callback(newValue)
    })

    return () => { unwatch() }
  }
}

// Create a singleton instance
export const wxtStorageAdapter = new WXTStorageAdapter()
