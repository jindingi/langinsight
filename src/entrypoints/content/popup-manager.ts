import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MeaningPopup } from '@/components/MeaningPopup';
import type { TextSelection, PopupCloseReason } from './types';
import { cn } from '@/lib/utils';

export class PopupManager {
  private currentPopup: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: Root | null = null;
  private popupOpenTime = 0;

  constructor(shadowRoot: ShadowRoot) {
    this.shadowRoot = shadowRoot;
  }

  createShadowPopup(selection: TextSelection, onClose: (reason: PopupCloseReason) => void) {
    const { text: selectedText, rect } = selection;

    // Remove existing popup
    this.removeShadowPopup();

    // Create container
    const container = document.createElement('div');
    container.className = cn(
      'text-base antialiased font-sans z-[2147483647]',
    )
    container.id = 'text-insight-popup';
    // Create shadow root
    const shadowRoot = container.attachShadow({ mode: 'open' });

    // Create React root container
    const reactContainer = document.createElement('div');
    shadowRoot.appendChild(reactContainer);

    // Calculate position
    const popupX = Math.min(rect.right + 10, window.innerWidth - 420);
    const popupY = Math.max(10, rect.top);

    // Create React root and render MeaningPopup
    this.reactRoot = createRoot(reactContainer);

    const handleClose = (reason: PopupCloseReason = 'close-button') => {
      console.log('🔴 Popup closed via React component. Reason:', reason);
      onClose(reason);
    };

    // Render the React component
    this.reactRoot.render(
      React.createElement(MeaningPopup, {
        selectedText,
        position: { x: popupX, y: popupY },
        onClose: () => handleClose('close-button')
      })
    );

    // Add to DOM
    document.body.appendChild(container);
    this.currentPopup = container;
    this.popupOpenTime = Date.now();

    console.log('🎯 React popup created for text:', selectedText);
    console.log('🎯 Popup open time:', this.popupOpenTime);
    console.log('🎯 Popup element:', container);
  }

  removeShadowPopup(reason: PopupCloseReason = 'unknown') {
    if (this.currentPopup) {
      console.log('❌ Removing React popup. Reason:', reason);
      console.log('❌ Popup was open for:', Date.now() - this.popupOpenTime, 'ms');

      // Cleanup React root
      if (this.reactRoot) {
        this.reactRoot.unmount();
        this.reactRoot = null;
      }

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