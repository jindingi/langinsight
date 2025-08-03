import { logger } from '@/utils/logger'
import { onMessage } from '@/utils/message'


export default defineBackground(() => {
  logger.info('[background.index]')

  onMessage('translateText', async (message) => {
    logger.log('[background.onMessage] text:', message.data)

    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(message.data)}&langpair=en|zh-CN`;
    const response = await fetch(apiUrl)
    const data = await response.json()
    logger.log('[background.onMessage] data:', data)
    return data.responseData.translatedText
  })
})
