import { wxtStorageAdapter } from '@/lib/storage'
import { Config, configSchema } from './type'
import { DEFAULT_CONFIG_PROD } from './config.prod'


let config: Config | null = null

export let DEFAULT_CONFIG: Config

export async function getConfig(): Promise<Config> {
    if (!config) {
        const configStr = await wxtStorageAdapter.getItem('config')
        const result = configSchema.safeParse(configStr)
        if (result.error) {
            throw result.error
        }
        if (result.success) {
            config = result.data
        } else {
            config = DEFAULT_CONFIG
        }
    }
    return config
}

export async function initConfig() {
    const defaultConfig = await loadDefaultConfig()
    config = defaultConfig
    DEFAULT_CONFIG = defaultConfig
    logger.info('Config initialized', config)
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