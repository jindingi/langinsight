import { defineExtensionMessaging } from '@webext-core/messaging'
import { ContextData, Resp, TranslateRequest } from '@/utils/protocol'

interface ProtocolMap {
    translateText(text: TranslateRequest): Resp<string>
    getContext(): Resp<ContextData>
}

export const { sendMessage, onMessage } =
    defineExtensionMessaging<ProtocolMap>()
