import { wxtStorageAdapter } from '@/lib/storage'
import { Config } from './type'
import { DEFAULT_CONFIG_PROD } from './config.prod'
import { logger } from '@/utils/logger'

export const CONFIG_STORAGE_KEY = 'config'
let DEFAULT_CONFIG: Config

export async function getConfig(): Promise<Config> {
    const res = await wxtStorageAdapter.getItem(CONFIG_STORAGE_KEY, null)
    if (!res) {
        logger.warn('[GetConfig] No config in storage, using default config')
        return DEFAULT_CONFIG
    }
    logger.info('[GetConfig] Config loaded from storage', res)
    return res
}

export async function initConfig() {
    DEFAULT_CONFIG = await loadDefaultConfig()

    const storedConfig = await wxtStorageAdapter.getItem(
        CONFIG_STORAGE_KEY,
        null,
    )
    if (storedConfig) {
        logger.info('Config loaded from storage', storedConfig)
    } else {
        logger.info('No config in storage, using default config')
        await wxtStorageAdapter.setItem(CONFIG_STORAGE_KEY, DEFAULT_CONFIG)
        logger.info('Config saved to storage', DEFAULT_CONFIG)
    }

    logger.info('Config initialized', storedConfig, DEFAULT_CONFIG)
}

async function loadDefaultConfig(): Promise<Config> {
    if (import.meta.env.DEV) {
        try {
            const devModule = await import('./config.dev')
            return devModule.DEFAULT_CONFIG_DEV
        } catch (error) {
            logger.error('Error loading default config dev', error)
            return DEFAULT_CONFIG_PROD
        }
    }
    return DEFAULT_CONFIG_PROD
}
