export enum TranslateType {
    MYMEMORY = 'mymemory',
    AI = 'ai',
}

export interface TranslateRequest {
    type: TranslateType
    selection: TextSelection
}

export interface ContextData {
    url: string
}

export interface Resp<T> {
    code: number
    data?: T
    error?: string
}
