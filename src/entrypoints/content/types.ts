export interface TextSelection {
    text: string;
    context: string;
}

export interface ContextOptions {
    beforeSentences?: number;
    afterSentences?: number;
}

export interface PopupState {
    currentPopup: HTMLDivElement | null;
    currentSelection: TextSelection | null;
    popupOpenTime: number;
    ignoreNextSelectionChange: boolean;
}

export interface PopupConfig {
    minWidth: number;
    maxWidth: number;
    zIndex: number;
    debounceTime: number;
    clickProtectionTime: number;
}

export type PopupCloseReason =
    | 'close-button'
    | 'outside-click'
    | 'no-selection'
    | 'unknown'; 