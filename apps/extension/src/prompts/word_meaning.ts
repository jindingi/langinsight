// import * as Handlebars from 'handlebars/runtime';
import Handlebars from 'handlebars'
import './templates.precompiled'
import {
    SELECTED_TEXT_MARKER,
    SELECTED_TEXT_MARKER_END,
} from '@/consts/selection'
import { logger } from '@/utils/logger'
import { Language, SUPPORTED_TARGET_LANGUAGES } from '@/consts/language'

const wordMeaningPromptTemplates: Record<string, HandlebarsTemplateDelegate> =
    {}

const prompts = ['word_meaning']

for (const language of SUPPORTED_TARGET_LANGUAGES) {
    for (const prompt of prompts) {
        const key: string = `${prompt}_${language}.hbs`
        const template = Handlebars.templates[key]
        if (!template) {
            logger.error(`[Prompt] ${key} not found`)
            logger.error(`[Prompt] ${prompt} ${language} not found`)
            throw new Error(`[Prompt] ${prompt} ${language} not found`)
        }
        logger.log(`[Prompt] ${key} loaded`)
        wordMeaningPromptTemplates[`${prompt}_${language}`] = template
    }
}

export function getWordMeaningPrompt(targetLanguage: Language) {
    const key = `word_meaning_${targetLanguage}`
    if (!wordMeaningPromptTemplates[key]) {
        logger.error(`[wordMeaningPrompt] ${targetLanguage} not found`)
        throw new Error(`[wordMeaningPrompt] ${targetLanguage} not found`)
    }
    const wordMeaningPromptTemplate = wordMeaningPromptTemplates[key]
    const prompt = wordMeaningPromptTemplate({
        SELECTED_TEXT_MARKER,
        SELECTED_TEXT_MARKER_END,
    })
    logger.log(`[wordMeaningPrompt] ${targetLanguage}: ${prompt}`)
    return prompt
}
