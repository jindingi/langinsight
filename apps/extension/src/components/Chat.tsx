import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send, Square } from 'lucide-react'
import { configFields } from '@/config/atom'
import { useAtomValue } from 'jotai'
import { Response as AIResponse } from '@/components/ai-elements/response'
import { llmService } from '@/services/llm-service'
import { extractMarkdownContent } from '@/utils/helper'

function Chat({ initialInput }: { initialInput: string }) {
    const [input, setInput] = useState(initialInput)
    const modelConfig = useAtomValue(configFields.model)
    const isApiKeyReady =
        modelConfig &&
        typeof modelConfig.apiKey === 'string' &&
        modelConfig.apiKey.trim().length > 0

    const { error, messages, sendMessage, stop, status } = useChat({
        transport: new DefaultChatTransport({
            fetch: llmService.getFetchFunction(),
        }),
    })

    const isGenerating = status === 'submitted' || status === 'streaming'

    return (
        <div className="flex flex-col h-full space-y-4 p-4 bg-gradient-to-b from-gray-50 to-white border shadow-xl dark:from-gray-900 dark:to-gray-800">
            <AIMessages messages={messages} />
            <UserInput
                input={input}
                setInput={setInput}
                isApiKeyReady={isApiKeyReady}
                isGenerating={isGenerating}
                stop={stop}
                sendMessage={sendMessage}
                error={error}
            />
        </div>
    )
}

function AIMessages({ messages }: { messages: UIMessage[] }) {
    return (
        <div className="flex-1 overflow-y-auto space-y-3">
            {messages.map(message => (
                <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/30'
                                : 'bg-white text-gray-700 border border-gray-200 shadow-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:shadow-gray-800'
                        }`}
                    >
                        {message.parts.map((part, i) => {
                            switch (part.type) {
                                case 'text':
                                    return message.role !== 'user' ? (
                                        <AIResponse key={`${message.id}-${i}`}>
                                            {extractMarkdownContent(part.text)}
                                        </AIResponse>
                                    ) : (
                                        <div
                                            key={`${message.id}-${i}`}
                                            className="whitespace-pre-wrap break-words"
                                        >
                                            {part.text}
                                        </div>
                                    )
                            }
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

function UserInput({
    input,
    setInput,
    isApiKeyReady,
    isGenerating,
    stop,
    sendMessage,
    error,
}: {
    input: string
    setInput: (input: string) => void
    isApiKeyReady: boolean | null
    isGenerating: boolean
    stop: () => void
    sendMessage: (message: { text: string }) => void
    error: Error | null | undefined
}) {
    return (
        <form
            onSubmit={e => {
                e.preventDefault()
                if (!isApiKeyReady) {
                    return
                }
                if (isGenerating) {
                    stop()
                    return
                }
                sendMessage({ text: input })
                setInput('')
            }}
            className="space-y-2"
        >
            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {error.message}
                </div>
            )}
            <div className="flex gap-2">
                <Textarea
                    value={input}
                    placeholder={
                        isApiKeyReady
                            ? 'Say something...'
                            : 'Please set your API key in settings'
                    }
                    onChange={e => setInput(e.currentTarget.value)}
                    className="flex-1 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                    disabled={!isApiKeyReady}
                />
                <Button
                    type="submit"
                    className="self-end shrink-0"
                    disabled={!isApiKeyReady}
                    aria-label={
                        isGenerating ? 'Stop generating' : 'Send message'
                    }
                    title={isGenerating ? 'Stop' : 'Send'}
                >
                    {isGenerating ? (
                        <Square className="size-6" />
                    ) : (
                        <Send className="size-6" />
                    )}
                </Button>
            </div>
        </form>
    )
}

export default Chat
