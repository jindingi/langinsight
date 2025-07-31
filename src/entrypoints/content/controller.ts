import { PopupManager } from './popup-manager';
import { FloatingIconManager } from './floating-icon';
import { TextSelectionManager } from './text-selection';
import { EventHandler } from './event-handler';
import type { TextSelection, PopupCloseReason } from './types';

export class ContentController {
    private popupManager: PopupManager;
    private floatingIconManager: FloatingIconManager;
    private textSelectionManager: TextSelectionManager;
    private eventHandler: EventHandler;

    constructor() {
        this.popupManager = new PopupManager();
        this.floatingIconManager = new FloatingIconManager();

        this.textSelectionManager = new TextSelectionManager(
            (selection) => this.handleSelectionChange(selection),
            () => this.popupManager.isPopupOpen()
        );

        this.eventHandler = new EventHandler(
            this.popupManager,
            this.floatingIconManager,
            () => this.handleOutsideClick()
        );
    }

    private handleSelectionChange(selection: TextSelection | null) {
        if (selection) {
            // Show the floating icon near the selection
            this.floatingIconManager.showFloatingIcon(
                selection,
                (clickedSelection) => this.handleIconClick(clickedSelection)
            );
        } else {
            this.floatingIconManager.hideFloatingIcon();
            this.popupManager.removeShadowPopup('no-selection');
        }
    }

    private handleIconClick(selection: TextSelection) {
        this.popupManager.createShadowPopup(
            selection,
            (reason: PopupCloseReason) => this.handlePopupClose(reason)
        );
    }

    private handlePopupClose(reason: PopupCloseReason) {
        this.popupManager.removeShadowPopup(reason);
    }

    private handleOutsideClick() {
        this.floatingIconManager.hideFloatingIcon();
        this.popupManager.removeShadowPopup('outside-click');
        this.textSelectionManager.clearSelection();
    }

    setupEventListeners() {
        // Add event listeners for text selection
        document.addEventListener('mouseup', () => this.textSelectionManager.handleTextSelection());
        document.addEventListener('keyup', () => this.textSelectionManager.handleTextSelection()); // For keyboard selections

        // Setup document click handler
        this.eventHandler.setupEventListeners();

        console.log('Text selection event listeners added');
    }
} 