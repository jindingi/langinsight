import { wxtStorageAdapter } from '@/lib/storage'
import { Config } from './type'
import { DEFAULT_CONFIG_PROD } from './config.prod'
import { logger } from '@/utils/logger'


let config: Config

let DEFAULT_CONFIG: Config
export const CONFIG_STORAGE_KEY = 'config'

export async function getConfig(): Promise<Config> {
    if (!config) {
        throw new Error('Config not initialized')
    }
    return config
}

export async function initConfig() {
    const defaultConfig = await loadDefaultConfig()
    DEFAULT_CONFIG = defaultConfig

    const storedConfig = await wxtStorageAdapter.getItem(CONFIG_STORAGE_KEY)
    if (storedConfig) {
        config = storedConfig
        logger.info('Config loaded from storage', config)
    } else {
        logger.info('No config in storage, using default config')
        config = DEFAULT_CONFIG
    }


    wxtStorageAdapter.watch(CONFIG_STORAGE_KEY, (value: Config | null) => {
        config = value || DEFAULT_CONFIG
        logger.info('Config updated', config)
    })

    logger.info('Config initialized', config, DEFAULT_CONFIG)
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