import { wxtStorageAdapter } from '@/lib/storage'
import { Config } from './type'
import { DEFAULT_CONFIG_PROD } from './config.prod'
import { logger } from '@/utils/logger'


export const CONFIG_STORAGE_KEY = 'config'

export async function getConfig(): Promise<Config> {
    const res = await wxtStorageAdapter.getItem(CONFIG_STORAGE_KEY, DEFAULT_CONFIG_PROD)
    if (!res) {
        throw new Error('Config not initialized')
    }
    return res
}

export async function initConfig() {
    const defaultConfig = await loadDefaultConfig()

    const storedConfig = await wxtStorageAdapter.getItem(CONFIG_STORAGE_KEY, defaultConfig)
    if (storedConfig) {
        logger.info('Config loaded from storage', storedConfig)
    } else {
        logger.info('No config in storage, using default config')
        await wxtStorageAdapter.setItem(CONFIG_STORAGE_KEY, defaultConfig)
        logger.info('Config saved to storage', defaultConfig)
    }

    logger.info('Config initialized', storedConfig, defaultConfig)
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