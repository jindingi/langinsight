import { useEffect, useRef } from 'react'
import { useCompletion } from '@ai-sdk/react'
import { llmService } from '@/services/llm-service'
import { logger } from '@/utils/logger'
import { Streamdown } from 'streamdown'
import { Loader } from '@/components/ai-elements/loader'
import type { SelectionContext } from '@/utils/types'

interface TranslationCardProps {
    selectionContext: SelectionContext
}

export function TranslationCard({ selectionContext }: TranslationCardProps) {
    const hasSentRef = useRef(false)

    const initialInput = selectionContext.textSelection.context
    const { completion, handleSubmit, error } = useCompletion({
        fetch: llmService.getCompletionFetchFunction(selectionContext),
        initialInput: initialInput,
    })

    // Trigger translation only once per unique input (防止React dev模式双重渲染导致重复调用)
    useEffect(() => {
        if (initialInput && !hasSentRef.current) {
            logger.info(
                '[TranslationCard.useEffect] Sending message:',
                initialInput,
            )
            hasSentRef.current = true
            handleSubmit()
        }
    }, [initialInput, handleSubmit])

    const baseCardClasses = 'w-80 min-h-[3rem] rounded-2xl px-4 py-3'
    const normalCardClasses = `${baseCardClasses} shadow-sm bg-white text-gray-700 border border-gray-200 shadow-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:shadow-gray-800`

    return (
        <div className="flex">
            {error ? (
                <div
                    className={`${baseCardClasses} bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800`}
                >
                    <p className="text-red-600 dark:text-red-400 text-sm">
                        {error.message}
                    </p>
                </div>
            ) : completion.length === 0 ? (
                <div
                    className={`${normalCardClasses} flex items-center justify-center`}
                >
                    <Loader />
                    <p>{selectionContext.url}</p>
                </div>
            ) : (
                completion.length > 0 && (
                    <div className={normalCardClasses}>
                        <Streamdown className="inline">{completion}</Streamdown>
                    </div>
                )
            )}
        </div>
    )
}
