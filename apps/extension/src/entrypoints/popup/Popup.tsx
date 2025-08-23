import { useAtom } from 'jotai'
import * as React from 'react'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/PasswordInput'
import { configFields } from '@/config/atom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { MODLE_PROVIDERS, MODEL_PROVIDER_SETTINGS } from '@/consts/model'

function Popup() {
  const [modelConfig, setModelConfig] = useAtom(configFields.model)
  
  const provider = modelConfig?.modelProvider || 'openai'
  const model = modelConfig?.modelName || MODEL_PROVIDER_SETTINGS[provider]?.models[0]?.id || ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleProviderChange = (value: string) => {
    setModelConfig({
      ...modelConfig,
      modelProvider: value,
      modelName: MODEL_PROVIDER_SETTINGS[value]?.models[0]?.id || ''
    })
  }

  const handleModelChange = (value: string) => {
    if (value === '') return

    setModelConfig({
      ...modelConfig,
      modelName: value
    })
  }

  return (
    <div className="p-4 min-w-[320px]">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              {MODLE_PROVIDERS.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelName">Model</Label>
          <Select
            value={model}
            onValueChange={handleModelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 z-50">
              {MODEL_PROVIDER_SETTINGS[provider]?.models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
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
              onChange={(e) => setModelConfig({...modelConfig, baseUrl: e.target.value})}
              placeholder={MODEL_PROVIDER_SETTINGS[provider]?.baseUrlDefault}
              className="font-mono"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <PasswordInput
            id="apiKey"
            value={modelConfig?.apiKey || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModelConfig({...modelConfig, apiKey: e.target.value})}
            placeholder="Enter your API key"
            className="font-mono"
          />
        </div>
      </form>
    </div>
  )
}

export default Popup
