import type { PopupCloseReason } from './types';

export class EventHandler {
    private readonly clickProtectionTime = 200;

    constructor(
        private popupManager: { isPopupOpen: () => boolean; getPopupOpenTime: () => number },
        private floatingIconManager: { hideFloatingIcon: () => void },
        private onOutsideClick: () => void
    ) { }

    handleDocumentClick(e: MouseEvent) {
        const target = e.target as HTMLElement;

        console.log('📱 Document click detected');
        console.log('📱 Target element:', target);
        console.log('📱 Target id:', target.id);
        console.log('📱 Target closest to popup:', target.closest('#text-insight-popup'));
        console.log('📱 Target closest to icon:', target.closest('#text-insight-icon'));
        console.log('📱 Current popup exists:', this.popupManager.isPopupOpen());

        if (this.popupManager.isPopupOpen()) {
            console.log('📱 Time since popup opened:', Date.now() - this.popupManager.getPopupOpenTime(), 'ms');
        }

        // Don't close if clicking the icon or inside popup
        if (target.id === 'text-insight-icon' ||
            target.closest('#text-insight-popup') ||
            target.closest('#text-insight-icon')) {
            console.log('📱 ✅ Click ignored - inside icon or popup');
            return;
        }

        // Don't close immediately after opening (prevent same-click closing)
        if (this.popupManager.isPopupOpen() &&
            Date.now() - this.popupManager.getPopupOpenTime() < this.clickProtectionTime) {
            console.log('📱 ✅ Click ignored - too soon after opening');
            return;
        }

        // Close everything
        console.log('📱 ❌ Closing popup due to outside click');
        this.floatingIconManager.hideFloatingIcon();
        this.onOutsideClick();
    }

    setupEventListeners() {
        // Hide icon and popup when clicking elsewhere  
        document.addEventListener('click', (e) => this.handleDocumentClick(e));
    }
} 