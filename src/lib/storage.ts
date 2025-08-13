import { storage } from '#imports'

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
export class WXTStorageAdapter implements AsyncStorage<string> {
  private getStorageKey(key: string): `local:${string}` {
    return `local:${key}`
  }

  async getItem(key: string): Promise<string> {
    const storageKey = this.getStorageKey(key)
    const result = await storage.getItem(storageKey)
    // Return empty string if no value found, matching jotai's AsyncStorage interface
    return typeof result === 'string' ? result : ''
  }

  async setItem(key: string, value: string): Promise<void> {
    const storageKey = this.getStorageKey(key)
    await storage.setItem(storageKey, value)
  }

  async removeItem(key: string): Promise<void> {
    const storageKey = this.getStorageKey(key)
    await storage.removeItem(storageKey)
  }
}

// Create a singleton instance
export const wxtStorageAdapter = new WXTStorageAdapter()
