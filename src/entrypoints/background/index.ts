import { logger } from '@/utils/logger'
import { onMessage } from '@/utils/message'
import { MESSAGE_TYPE_TRANSLATE_TEXT } from '@/consts/message'


export default defineBackground(() => {
  logger.info('[background.index]')

  onMessage(MESSAGE_TYPE_TRANSLATE_TEXT, async (message) => {
    logger.log('[background.onMessage] text:', message)

    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(message.data)}&langpair=en|zh-CN`;
    const response = await fetch(apiUrl)
    const data = await response.json()
    logger.log('[background.onMessage] data:', data)
    return {
      code: 0,
      data: data.responseData.translatedText,
    }
  })
})
