export const POPUP_STYLES = `
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

export const FLOATING_ICON_STYLES = `
  position: fixed;
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