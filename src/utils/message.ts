import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
    translateText(text: string): string;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();