import { useAtom } from 'jotai'
import * as React from 'react'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/PasswordInput'
import { modelAtom, languageAtom } from '@/config/atoms'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { MODLE_PROVIDERS, MODEL_PROVIDER_SETTINGS } from '@/consts/model'
import { SUPPORTED_TARGET_LANGUAGES, Language } from '@/consts/language'

function Popup() {
    const [modelConfig, setModelConfig] = useAtom(modelAtom)
    const [languageConfig, setLanguageConfig] = useAtom(languageAtom)

    const provider = modelConfig.modelProvider
    const model = modelConfig.modelName || MODEL_PROVIDER_SETTINGS[provider]?.models[0]?.id || ''
    const targetLanguage = languageConfig.targetLanguage

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

    // Model setting handlers - much simpler with direct atom updates
    const handleProviderChange = (value: string) => {
        // Type-safe validation of provider value
        const isValidProvider = MODLE_PROVIDERS.some(provider => provider === value)
        if (!isValidProvider) {
            console.error('Invalid model provider:', value)
            return
        }
        
        setModelConfig({
            ...modelConfig,
            modelProvider: value as typeof MODLE_PROVIDERS[number],
            modelName: MODEL_PROVIDER_SETTINGS[value]?.models[0]?.id || '',
        })
    }

    const handleModelChange = (value: string) => {
        if (value === '') return
        setModelConfig({
            ...modelConfig,
            modelName: value,
        })
    }

    const handleBaseUrlChange = (value: string) => {
        setModelConfig({
            ...modelConfig,
            baseUrl: value,
        })
    }

    const handleApiKeyChange = (value: string) => {
        setModelConfig({
            ...modelConfig,
            apiKey: value,
        })
    }

    // Language setting handlers - much simpler with direct atom updates
    const handleLanguageChange = (value: string) => {
        // Validate that the value is a valid Language enum value
        const targetLanguage = Object.values(Language).includes(value as Language) 
            ? value as Language 
            : Language.English
        
        setLanguageConfig({
            ...languageConfig,
            targetLanguage,
        })
    }

    return (
        <div className="p-4 min-w-[320px]">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Language Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                        Language Settings
                    </h3>
                    <div className="space-y-2">
                        <Label htmlFor="targetLanguage">Target Language</Label>
                        <Select
                            value={targetLanguage}
                            onValueChange={handleLanguageChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 z-50">
                                {SUPPORTED_TARGET_LANGUAGES.map(language => (
                                    <SelectItem key={language} value={language}>
                                        {language}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Model Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                        Model Settings
                    </h3>
                    <div className="space-y-2">
                        <Label htmlFor="modelProvider">Model Provider</Label>
                        <Select
                            value={provider}
                            onValueChange={handleProviderChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 z-50">
                                {MODLE_PROVIDERS.map(provider => (
                                    <SelectItem key={provider} value={provider}>
                                        {provider.charAt(0).toUpperCase() +
                                            provider.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="modelName">Model</Label>
                        <Select value={model} onValueChange={handleModelChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 z-50">
                                {MODEL_PROVIDER_SETTINGS[provider]?.models.map(
                                    model => (
                                        <SelectItem key={model.id} value={model.id}>
                                            {model.name}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {MODEL_PROVIDER_SETTINGS[provider]?.enableCustomBaseUrl && (
                        <div className="space-y-2">
                            <Label htmlFor="baseUrl">Base URL</Label>
                            <Input
                                id="baseUrl"
                                type="url"
                                value={modelConfig?.baseUrl || ''}
                                onChange={e => handleBaseUrlChange(e.target.value)}
                                placeholder={
                                    MODEL_PROVIDER_SETTINGS[provider]
                                        ?.baseUrlDefault
                                }
                                className="font-mono"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <PasswordInput
                            id="apiKey"
                            value={modelConfig?.apiKey || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleApiKeyChange(e.target.value)
                            }
                            placeholder="Enter your API key"
                            className="font-mono"
                        />
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Popup
