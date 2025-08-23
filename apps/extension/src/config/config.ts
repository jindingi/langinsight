import { Config } from './type'
import { DEFAULT_CONFIG_PROD } from './config.prod'

/**
 * Legacy configuration utilities
 * 
 * Note: This file is kept for backward compatibility.
 * New code should use the atom-based configuration system from '@/config/atoms'
 */

// Storage keys - kept for reference
export const MODEL_STORAGE_KEY = 'config_model'  // Used by modelAtom
export const LANGUAGE_STORAGE_KEY = 'config_language'  // Used by languageAtom

// Default configuration - still used by atoms for defaults
export const DEFAULT_CONFIG: Config = await loadDefaultConfig()

/**
 * Load default configuration based on environment
 * Used internally by the atom system
 */
export async function loadDefaultConfig(): Promise<Config> {
    if (import.meta.env.DEV) {
        try {
            const devModule = await import('./config.dev')
            return devModule.DEFAULT_CONFIG_DEV
        } catch (error) {
            console.warn('Error loading dev config, using production defaults:', error)
            return DEFAULT_CONFIG_PROD
        }
    }
    return DEFAULT_CONFIG_PROD
}