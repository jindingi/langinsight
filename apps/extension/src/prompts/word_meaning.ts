// import * as Handlebars from 'handlebars/runtime';
import Handlebars from 'handlebars'
import './templates.precompiled'
import {
    SELECTED_TEXT_MARKER,
    SELECTED_TEXT_MARKER_END,
} from '@/consts/selection'
import { logger } from '@/utils/logger'
import { Language, SUPPORTED_TARGET_LANGUAGES } from '@/consts/language'

const promptTemplates: Record<string, HandlebarsTemplateDelegate> = {}

const prompts = ['word_meaning', 'translation']

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
        promptTemplates[`${prompt}_${language}`] = template
    }
}

function getPrompt(promptName: string, targetLanguage: Language): string {
    const key = `${promptName}_${targetLanguage}`
    if (!promptTemplates[key]) {
        logger.error(`[${promptName}Prompt] ${targetLanguage} not found`)
        throw new Error(`[${promptName}Prompt] ${targetLanguage} not found`)
    }
    const template = promptTemplates[key]
    const prompt = template({
        SELECTED_TEXT_MARKER,
        SELECTED_TEXT_MARKER_END,
    })
    logger.log(`[${promptName}Prompt] ${targetLanguage}: ${prompt}`)
    return prompt
}

export function getWordMeaningPrompt(targetLanguage: Language): string {
    return getPrompt('word_meaning', targetLanguage)
}

export function getTranslationPrompt(targetLanguage: Language): string {
    return getPrompt('translation', targetLanguage)
}
