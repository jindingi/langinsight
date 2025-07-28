// Content script for text selection detection and meaning popup

export default defineContentScript({
  matches: ['*://*/*'], // Match all websites
  main() {
    console.log('Text selection detector loaded');

    let selectionTimeout: NodeJS.Timeout;
    let currentPopup: HTMLDivElement | null = null;
    let currentSelection: { text: string; rect: DOMRect } | null = null;

    // Function to create shadow DOM popup
    const createShadowPopup = (selectedText: string, rect: DOMRect) => {
      // Remove existing popup
      removeShadowPopup();

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
      styleElement.textContent = `
        :host {
          all: initial;
          position: fixed;
          z-index: 10001;
        }
        
        * {
          box-sizing: border-box;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .popup-container {
          position: fixed;
          min-width: 300px;
          max-width: 400px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          padding: 16px;
          pointer-events: auto;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .popup-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          flex: 1;
          margin-right: 8px;
          word-break: break-word;
        }

        .close-button {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          min-width: 20px;
        }

        .close-button:hover {
          color: #6b7280;
        }

        .content-section {
          margin-bottom: 12px;
        }

        .content-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .content-text {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.4;
        }

        .content-example {
          font-style: italic;
        }

        .popup-footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          margin-top: 12px;
        }

        .footer-text {
          font-size: 12px;
          color: #9ca3af;
        }
      `;
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
        closeButton.addEventListener('click', removeShadowPopup);
      }

      // Prevent clicks inside popup from closing it
      popupContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Add to DOM
      document.body.appendChild(container);
      currentPopup = container;

      console.log('Shadow popup created for text:', selectedText);
    };

    // Function to remove shadow popup
    const removeShadowPopup = () => {
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
        console.log('Shadow popup removed');
      }
    };

    // Function to handle text selection
    const handleTextSelection = () => {
      // Clear previous timeout to debounce rapid selections
      clearTimeout(selectionTimeout);

      selectionTimeout = setTimeout(() => {
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
          currentSelection = { text: selectedText, rect };

          // Show the floating icon near the selection
          showFloatingIcon(rect, selectedText);
        } else {
          // Hide the icon and popup if no text is selected
          hideFloatingIcon();
          removeShadowPopup();
          currentSelection = null;
        }
      }, 100); // 100ms debounce
    };

    // Function to show floating icon
    const showFloatingIcon = (rect: DOMRect, selectedText: string) => {
      // Remove existing icon if present
      hideFloatingIcon();

      const icon = document.createElement('div');
      icon.id = 'text-insight-icon';
      icon.innerHTML = '💡'; // Simple emoji icon for now

      // Position the icon near the selection
      icon.style.cssText = `
        position: fixed;
        left: ${rect.right + 5}px;
        top: ${rect.top}px;
        z-index: 10000;
        background: #4A90E2;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
      `;

      // Add hover effect
      icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.1)';
      });

      icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
      });

      // Add click handler to show popup
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Icon clicked for text:', selectedText);

        if (currentSelection) {
          createShadowPopup(currentSelection.text, currentSelection.rect);
        }
      });

      document.body.appendChild(icon);
    };

    // Function to hide floating icon
    const hideFloatingIcon = () => {
      const existingIcon = document.getElementById('text-insight-icon');
      if (existingIcon) {
        existingIcon.remove();
      }
    };

    // Add event listeners
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection); // For keyboard selections

    // Hide icon and popup when clicking elsewhere  
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Don't close if clicking the icon or inside popup
      if (target.id === 'text-insight-icon' ||
        target.closest('#text-insight-popup') ||
        target.closest('#text-insight-icon')) {
        return;
      }

      // Close everything
      hideFloatingIcon();
      removeShadowPopup();
      currentSelection = null;
    });

    console.log('Text selection event listeners added');
  },
});
