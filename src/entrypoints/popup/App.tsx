import { useAtom } from 'jotai'
import * as React from 'react'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/PasswordInput'
import { configFields } from './atom'

function App() {
  const [apiKey, setApiKey] = useAtom(configFields.openaiApiKey)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <div className="p-4 min-w-[320px]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">OpenAI API Key</Label>
          <PasswordInput
            id="apiKey"
            value={apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="font-mono"
          />
        </div>
      </form>
    </div>
  )
}

export default App
