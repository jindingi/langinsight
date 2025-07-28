import type { TextSelection } from './types';
import debounce from 'lodash.debounce';

export class TextSelectionManager {
    private currentSelection: TextSelection | null = null;
    private ignoreNextSelectionChange = false;
    private readonly debounceTime = 100;

    constructor(
        private onSelectionChange: (selection: TextSelection | null) => void,
        private isPopupOpen: () => boolean
    ) { }

    private debouncedSelectionHandler = debounce(() => {
        // Skip processing if we should ignore this change
        if (this.ignoreNextSelectionChange) {
            console.log('🔄 Ignoring selection change (icon click protection)');
            this.ignoreNextSelectionChange = false;
            return;
        }

        const selection = window.getSelection();

        if (selection && selection.toString().trim().length > 0) {
            const selectedText = selection.toString().trim();
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            console.log('Text selected:', selectedText);
            console.log('Selection position:', {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            });

            // Store current selection
            this.currentSelection = { text: selectedText, rect };

            // Notify about selection change
            this.onSelectionChange(this.currentSelection);
        } else {
            // Only clear if popup is not currently open
            if (!this.isPopupOpen()) {
                console.log('🔄 No text selected, clearing everything');
                this.currentSelection = null;
                this.onSelectionChange(null);
            } else {
                console.log('🔄 No text selected, but popup is open - keeping popup');
            }
        }
    }, this.debounceTime);

    handleTextSelection() {
        this.debouncedSelectionHandler();
    }

    setIgnoreNextSelectionChange(ignore: boolean) {
        this.ignoreNextSelectionChange = ignore;
    }

    getCurrentSelection(): TextSelection | null {
        return this.currentSelection;
    }

    clearSelection() {
        this.currentSelection = null;
    }
} 