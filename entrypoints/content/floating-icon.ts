import { FLOATING_ICON_STYLES } from './styles';
import type { TextSelection } from './types';

export class FloatingIconManager {
    private currentIcon: HTMLDivElement | null = null;

    showFloatingIcon(rect: DOMRect, selectedText: string, onIconClick: (selection: TextSelection) => void) {
        // Remove existing icon if present
        this.hideFloatingIcon();

        const icon = document.createElement('div');
        icon.id = 'text-insight-icon';
        icon.innerHTML = '💡'; // Simple emoji icon for now

        // Position the icon near the selection
        icon.style.cssText = `
      ${FLOATING_ICON_STYLES}
      left: ${rect.right + 5}px;
      top: ${rect.top}px;
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
            console.log('💡 Icon clicked for text:', selectedText);
            console.log('💡 Event:', e);

            const selection: TextSelection = { text: selectedText, rect };
            onIconClick(selection);
        });

        document.body.appendChild(icon);
        this.currentIcon = icon;
    }

    hideFloatingIcon() {
        const existingIcon = document.getElementById('text-insight-icon');
        if (existingIcon) {
            existingIcon.remove();
            this.currentIcon = null;
        }
    }

    getCurrentIcon(): HTMLDivElement | null {
        return this.currentIcon;
    }

    isIconVisible(): boolean {
        return this.currentIcon !== null;
    }
} 