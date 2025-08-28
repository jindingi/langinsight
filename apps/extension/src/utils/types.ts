export interface TextSelection {
    text: string
    context: string
}

export interface SelectionContext {
    url: string
    textSelection: TextSelection
}

export interface ContextOptions {
    beforeSentences?: number
    afterSentences?: number
}