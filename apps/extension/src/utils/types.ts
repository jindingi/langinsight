export interface TextSelection {
    text: string
    context: string
}

export interface ContextOptions {
    beforeSentences?: number
    afterSentences?: number
}

export enum TranslateType {
    MYMEMORY = 'mymemory',
    AI = 'ai',
}

export interface TranslateRequest {
    type: TranslateType
    selection: TextSelection
}

export interface Resp<T> {
    code: number
    data: T
    error?: string
}
