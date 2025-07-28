import { POPUP_STYLES } from './styles';
import type { TextSelection, PopupCloseReason } from './types';

export class PopupManager {
    private currentPopup: HTMLDivElement | null = null;
    private popupOpenTime = 0;

    createShadowPopup(selectedText: string, rect: DOMRect, onClose: (reason: PopupCloseReason) => void) {
        // Remove existing popup
        this.removeShadowPopup();

        // Create container
        const container = document.createElement('div');
        container.id = 'text-insight-popup';
        container.style.cssText = `
      position: fixed;
      z-index: 10001;
      pointer-events: auto;
    `;

        // Create shadow root
        const shadowRoot = container.attachShadow({ mode: 'open' });

        // Add styles to shadow DOM
        const styleElement = document.createElement('style');
        styleElement.textContent = POPUP_STYLES;
        shadowRoot.appendChild(styleElement);

        // Calculate position
        const popupX = Math.min(rect.right + 10, window.innerWidth - 420);
        const popupY = Math.max(10, rect.top);

        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-container';
        popupContent.style.cssText = `
      left: ${popupX}px;
      top: ${popupY}px;
    `;

        popupContent.innerHTML = `
      <div class="popup-header">
        <h3 class="popup-title">"${selectedText}"</h3>
        <button class="close-button" id="close-popup">×</button>
      </div>
      
      <div class="content-section">
        <h4 class="content-label">Meaning:</h4>
        <p class="content-text">
          This is a placeholder meaning for the selected text. In the future, this will be fetched from an API that provides definitions, translations, or explanations.
        </p>
      </div>

      <div class="content-section">
        <h4 class="content-label">Example:</h4>
        <p class="content-text content-example">
          "This word/phrase is commonly used in academic writing."
        </p>
      </div>

      <div class="popup-footer">
        <p class="footer-text">Powered by LangInsight Extension</p>
      </div>
    `;

        shadowRoot.appendChild(popupContent);

        // Add close button handler
        const closeButton = shadowRoot.getElementById('close-popup');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                console.log('🔴 Close button clicked');
                onClose('close-button');
            });
        }

        // Prevent clicks inside popup from closing it
        popupContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Add to DOM
        document.body.appendChild(container);
        this.currentPopup = container;
        this.popupOpenTime = Date.now();

        console.log('🎯 Shadow popup created for text:', selectedText);
        console.log('🎯 Popup open time:', this.popupOpenTime);
        console.log('🎯 Popup element:', container);
    }

    removeShadowPopup(reason: PopupCloseReason = 'unknown') {
        if (this.currentPopup) {
            console.log('❌ Removing shadow popup. Reason:', reason);
            console.log('❌ Popup was open for:', Date.now() - this.popupOpenTime, 'ms');
            this.currentPopup.remove();
            this.currentPopup = null;
            this.popupOpenTime = 0;
        }
    }

    getCurrentPopup(): HTMLDivElement | null {
        return this.currentPopup;
    }

    getPopupOpenTime(): number {
        return this.popupOpenTime;
    }

    isPopupOpen(): boolean {
        return this.currentPopup !== null;
    }
} 