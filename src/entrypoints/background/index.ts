import { logger } from '@/utils/logger'
import { onMessage } from '@/utils/message'
import { MESSAGE_TYPE_TRANSLATE_TEXT } from '@/consts/message'
import { TextSelection, TranslateType, Resp } from '@/utils/types'

const translationActionMap: Record<TranslateType, (selectedText: TextSelection) => Promise<Resp<string>>> = {
  [TranslateType.MYMEMORY]: mymemoryTranslateText,
  [TranslateType.AI]: dummyTranslateText,
}

async function dummyTranslateText(selectedText: TextSelection): Promise<Resp<string>> {
  return {
    code: -1,
    data: 'not implemented yet',
  }
}

async function mymemoryTranslateText(selectedText: TextSelection): Promise<Resp<string>> {
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(selectedText.context)}&langpair=en|zh-CN`;
  const response = await fetch(apiUrl)
  const data = await response.json()
  logger.log('[background.onMessage] data:', data)
  return {
    code: data.responseStatus == 200 ? 0 : -1,
    data: data.responseData.translatedText,
  }
}

export default defineBackground(() => {
  logger.info('[background.index]')

  onMessage(MESSAGE_TYPE_TRANSLATE_TEXT, async (message) => {
    const { type: translateType, selection: selectedText } = message.data
    logger.log('[background.onMessage] type:', typeof selectedText)
    logger.log('[background.onMessage] text:', selectedText)

    const translateFunction = translationActionMap[translateType]
    if (translateFunction) {
      return await translateFunction(selectedText)
    }

    return {
      code: -1,
      data: '',
    }
  })
})
