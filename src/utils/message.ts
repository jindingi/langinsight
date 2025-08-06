import { defineExtensionMessaging } from '@webext-core/messaging';

interface Response {
    code: number;
    data: string;
    error?: string;
}

interface ProtocolMap {
    translateText(text: string): Response;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();