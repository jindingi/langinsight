import { getDefaultStore } from 'jotai'
import { modelAtom, languageAtom } from '@/config/atoms'
import { Config, ModelType, LanguageType } from '@/config/type'

/**
 * Bridge utilities for accessing configuration values in both React and non-React contexts
 * 
 * In React components: Use atoms directly with useAtom/useAtomValue
 * In services/utilities: Use these bridge functions for synchronous access
 */

const store = getDefaultStore()

/**
 * Get current model configuration
 * For use in services and non-React contexts
 */
export async function getModelConfig(): Promise<ModelType> {
    return store.get(modelAtom)
}

/**
 * Get current language configuration  
 * For use in services and non-React contexts
 */
export async function getLanguageConfig(): Promise<LanguageType> {
    return store.get(languageAtom)
}

/**
 * Get full configuration object (backward compatibility)
 * Combines individual atom values into a single config object
 */
export async function getFullConfig(): Promise<Config> {
    const [model, language] = await Promise.all([
        getModelConfig(),
        getLanguageConfig(),
    ])
    
    return {
        model,
        language,
    }
}

/**
 * Update model configuration from non-React contexts
 */
export async function setModelConfig(modelConfig: ModelType): Promise<void> {
    store.set(modelAtom, modelConfig)
}

/**
 * Update language configuration from non-React contexts  
 */
export async function setLanguageConfig(languageConfig: LanguageType): Promise<void> {
    store.set(languageAtom, languageConfig)
}
