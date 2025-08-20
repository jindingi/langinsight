// import * as Handlebars from 'handlebars/runtime';
import Handlebars from 'handlebars'
import "./templates.precompiled";
import { SELECTED_TEXT_MARKER, SELECTED_TEXT_MARKER_END } from "@/consts/selection";

const wordMeaningPromptTemplate = Handlebars.templates['word_meaning']

export const wordMeaningPrompt = wordMeaningPromptTemplate({
    SELECTED_TEXT_MARKER,
    SELECTED_TEXT_MARKER_END,
})
