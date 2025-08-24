import { useAtomValue } from 'jotai'
import { selectionContentAtom } from '@/entrypoints/content/atom'
import { useQuery } from '@tanstack/react-query'
import { logger } from '@/utils/logger'

export function TranslationCard() {
    const selectionContent = useAtomValue(selectionContentAtom)
    
    const translationQueryFn = async () => {
        logger.log('[TranslationCard.translationQueryFn] selectionContent:', selectionContent)
        if (!selectionContent) {
            return ''
        }
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${selectionContent?.text}&langpair=en|zh-CN`,
        )
        logger.log('[TranslationCard.translationQueryFn] response:', response)
        const data = await response.json()
        return data.responseData.translatedText
    }
    const { data, isLoading, error } = useQuery({
        queryKey: ['translation', selectionContent],
        queryFn: translationQueryFn,
    })

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 min-w-[200px] max-w-[400px]">
            <div className="space-y-2">
                {selectionContent?.text && (
                    <div className="text-sm text-gray-600 border-b pb-2">
                        {selectionContent.text}
                    </div>
                )}
                {isLoading && (
                    <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    </div>
                )}
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        翻译出错: {error.message}
                    </div>
                )}
                {data && (
                    <div className="text-sm font-medium">
                        {data}
                    </div>
                )}
            </div>
        </div>
    )
}

