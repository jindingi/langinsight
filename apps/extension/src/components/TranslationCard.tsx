import { useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { llmService } from '@/services/llm-service'
import { logger } from '@/utils/logger'
import {Streamdown} from 'streamdown'
import {Loader} from '@/components/ai-elements/loader'

interface TranslationCardProps {
    initialInput: string
}

export function TranslationCard({initialInput}: TranslationCardProps) {
    const hasSentRef = useRef(false)
    const { error, messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            fetch: llmService.getFetchFunction(),
        }),
    })

    // Trigger translation only once per unique input (防止React dev模式双重渲染导致重复调用)
    useEffect(() => {
        if (initialInput && !hasSentRef.current) {
            logger.info('[TranslationCard.useEffect] Sending message:', initialInput)
            hasSentRef.current = true
            sendMessage({
                text: initialInput,
            })
        }
    }, [initialInput, sendMessage])
    


    // Get the latest assistant message for translation display
    const latestAssistantMessage = messages.filter(message => message.role === 'assistant').at(-1)

    const baseCardClasses = "w-80 min-h-[3rem] rounded-2xl px-4 py-3"
    const normalCardClasses = `${baseCardClasses} shadow-sm bg-white text-gray-700 border border-gray-200 shadow-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:shadow-gray-800 transition-all duration-200 ease-out`
    
    return (
        <div className="flex">
            {error ? (
                <div className={`${baseCardClasses} bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800`}>
                    <p className="text-red-600 dark:text-red-400 text-sm">
                        {error.message}
                    </p>
                </div>
            ) : status === 'submitted' ? (
                <div className={`${normalCardClasses} flex items-center justify-center`}>
                    <Loader />
                </div>
            ) : (
                latestAssistantMessage && (
                    <div className={normalCardClasses}>
                        {latestAssistantMessage.parts.map((part) => {
                            switch (part.type) {
                                case 'text':
                                    return (
                                        <div key={latestAssistantMessage.id} className="w-full break-words leading-relaxed">
                                            <Streamdown className="inline">
                                                {part.text}
                                            </Streamdown>
                                        </div>
                                    )
                                default:
                                    return null
                            }
                        })}
                    </div>
                )
            )}
        </div>
    )
}


