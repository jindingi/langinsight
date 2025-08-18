import { defineExtensionMessaging } from '@webext-core/messaging';
import { Resp, TranslateRequest } from '@/utils/types';



interface ProtocolMap {
    translateText(text: TranslateRequest): Resp<string>;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();