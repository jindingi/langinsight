import { atomWithStorage } from 'jotai/utils'
import { ModelType, LanguageType, modelSchema, languageSchema } from '@/config/type'
import { createFieldStorageAdapter } from '@/lib/storage-field'
import { DEFAULT_CONFIG_PROD } from '@/config/config.prod'

// Storage keys for each configuration field
export const MODEL_STORAGE_KEY = 'config_model'
export const LANGUAGE_STORAGE_KEY = 'config_language'

// Create storage adapters for each configuration field
const modelStorageAdapter = createFieldStorageAdapter(modelSchema, 'model')
const languageStorageAdapter = createFieldStorageAdapter(languageSchema, 'language')

/**
 * Model configuration atom
 * Stores model provider, model name, API key, and optional base URL
 */
export const modelAtom = atomWithStorage<ModelType>(
    MODEL_STORAGE_KEY,
    DEFAULT_CONFIG_PROD.model,
    modelStorageAdapter,
)

/**
 * Language configuration atom  
 * Stores target language for translations and responses
 */
export const languageAtom = atomWithStorage<LanguageType>(
    LANGUAGE_STORAGE_KEY,
    DEFAULT_CONFIG_PROD.language,
    languageStorageAdapter,
)

// Export atom utilities for extensibility
export { modelStorageAdapter, languageStorageAdapter }