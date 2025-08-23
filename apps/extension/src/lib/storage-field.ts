import { storage } from '#imports'
import { logger } from '@/utils/logger'
import { z } from 'zod'

/**
 * Interface matching jotai's AsyncStorage
 */
interface AsyncStorage<T> {
    getItem: (key: string, initialValue: T) => Promise<T>
    setItem: (key: string, value: T) => Promise<void>
    removeItem: (key: string) => Promise<void>
    subscribe?: (
        key: string,
        callback: (value: T) => void,
        initialValue: T,
    ) => () => void
}

/**
 * Generic WXT Storage adapter for individual config fields
 * Much simpler than the original adapter, focuses on single field operations
 */
export class WXTFieldStorageAdapter<T> implements AsyncStorage<T> {
    constructor(
        private schema: z.ZodSchema<T>,
        private fieldName: string,
    ) {}

    private getStorageKey(key: string): `local:${string}` {
        return `local:${key}`
    }

    async getItem(key: string, initialValue: T): Promise<T> {
        const storageKey = this.getStorageKey(key)
        const resultStr: string | null = await storage.getItem(storageKey)
        logger.info(`Got item ${storageKey} ${resultStr}`)
        
        if (resultStr == null) {
            logger.info(`No value found for ${this.fieldName}, using default`)
            return initialValue
        }

        try {
            const parsed = JSON.parse(resultStr)
            const result = this.schema.safeParse(parsed)
            
            if (result.success) {
                logger.info(`Loaded ${this.fieldName} from storage`)
                return result.data
            } else {
                logger.error(`Invalid ${this.fieldName} data in storage, using default`, result.error)
                return initialValue
            }
        } catch (error) {
            logger.error(`Failed to parse ${this.fieldName} from storage, using default`, error)
            return initialValue
        }
    }

    async setItem(key: string, value: T): Promise<void> {
        logger.info(`Setting item ${key} ${JSON.stringify(value)}`)
        const storageKey = this.getStorageKey(key)
        
        // Validate before storing
        const result = this.schema.safeParse(value)
        if (!result.success) {
            logger.error(`Invalid ${this.fieldName} data, not storing`, result.error)
            // Don't throw - just return without storing invalid data
            // This prevents UI crashes while still protecting storage integrity
            return
        }

        const valueStr = JSON.stringify(value)
        await storage.setItem<string>(storageKey, valueStr)
        logger.info(`Saved ${this.fieldName} to storage`)
    }

    async removeItem(key: string): Promise<void> {
        const storageKey = this.getStorageKey(key)
        await storage.removeItem(storageKey)
        logger.info(`Removed ${this.fieldName} from storage`)
    }

    subscribe(
        key: string,
        callback: (value: T) => void,
        initialValue: T,
    ): () => void {
        const storageKey = this.getStorageKey(key)

        const unwatch = storage.watch(
            storageKey,
            async (valueStr: string | null) => {
                if (valueStr == null) {
                    callback(initialValue)
                    return
                }

                try {
                    const parsed = JSON.parse(valueStr)
                    const result = this.schema.safeParse(parsed)
                    
                    if (result.success) {
                        callback(result.data)
                    } else {
                        logger.error(`Invalid ${this.fieldName} data in watch callback, using default`, result.error)
                        callback(initialValue)
                    }
                } catch (error) {
                    logger.error(`Failed to parse ${this.fieldName} in watch callback, using default`, error)
                    callback(initialValue)
                }
            },
        )

        return unwatch
    }
}

/**
 * Factory function to create storage adapters for specific config fields
 */
export function createFieldStorageAdapter<T>(
    schema: z.ZodSchema<T>,
    fieldName: string,
): WXTFieldStorageAdapter<T> {
    return new WXTFieldStorageAdapter(schema, fieldName)
}
