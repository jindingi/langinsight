export interface TextSelection {
    text: string;
    context: string;
}

export interface ContextOptions {
    beforeSentences?: number;
    afterSentences?: number;
}