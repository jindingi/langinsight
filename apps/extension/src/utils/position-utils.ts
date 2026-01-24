/**
 * Position utilities for floating UI elements
 * Provides viewport boundary detection and smart positioning
 */

/** Viewport padding to ensure elements don't touch the edges */
const VIEWPORT_PADDING = 20

/** Element dimensions for different UI components */
export const ELEMENT_DIMENSIONS = {
    TRANSLATION_CARD_WIDTH: 320,
    TRANSLATION_CARD_MIN_HEIGHT: 48,
    TRANSLATION_BUTTON_WIDTH: 40,
    TRANSLATION_BUTTON_HEIGHT: 32,
    MEANING_POPUP_MIN_WIDTH: 300,
    MEANING_POPUP_MAX_WIDTH: 400,
} as const

interface Position {
    x: number
    y: number
}

interface AnchorRect {
    left: number
    right: number
    top: number
    bottom: number
}

interface CalculateSafePositionOptions {
    /** Width of the element to position */
    elementWidth: number
    /** Height of the element to position (optional, defaults to estimated height) */
    elementHeight?: number
    /** Offset from anchor point */
    offset?: number
    /** Viewport padding */
    padding?: number
}

/**
 * Calculates a safe position for a floating element that stays within viewport boundaries
 * 
 * @param anchorRect - The bounding rectangle of the anchor element (e.g., text selection)
 * @param options - Configuration options for positioning
 * @returns Safe position coordinates
 */
export function calculateSafePosition(
    anchorRect: AnchorRect,
    options: CalculateSafePositionOptions
): Position {
    const {
        elementWidth,
        elementHeight = 100,
        offset = 5,
        padding = VIEWPORT_PADDING,
    } = options

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate initial position (right of selection, below it)
    let x = anchorRect.right + window.scrollX
    let y = anchorRect.bottom + window.scrollY + offset

    // Check if element would overflow right edge of viewport
    const rightOverflow = (anchorRect.right + elementWidth + padding) > viewportWidth
    if (rightOverflow) {
        // Position to the left of the selection instead
        x = anchorRect.left + window.scrollX - elementWidth - offset
        
        // If left positioning would also overflow, align to right edge with padding
        if (x < window.scrollX + padding) {
            x = window.scrollX + viewportWidth - elementWidth - padding
        }
    }

    // Check if element would overflow bottom edge of viewport
    const bottomOverflow = (anchorRect.bottom + elementHeight + padding) > viewportHeight
    if (bottomOverflow) {
        // Position above the selection instead
        y = anchorRect.top + window.scrollY - elementHeight - offset
        
        // If top positioning would also overflow, align to bottom edge with padding
        if (y < window.scrollY + padding) {
            y = window.scrollY + viewportHeight - elementHeight - padding
        }
    }

    // Final boundary checks to ensure position is never negative
    x = Math.max(window.scrollX + padding, x)
    y = Math.max(window.scrollY + padding, y)

    return { x, y }
}

/**
 * Gets the visible viewport dimensions (excluding scrollbars)
 */
export function getViewportDimensions(): { width: number; height: number } {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    }
}

/**
 * Checks if a position with given dimensions would overflow the viewport
 */
export function checkViewportOverflow(
    position: Position,
    elementWidth: number,
    elementHeight: number,
    padding = VIEWPORT_PADDING
): { overflowRight: boolean; overflowBottom: boolean; overflowLeft: boolean; overflowTop: boolean } {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    return {
        overflowRight: (position.x - scrollX + elementWidth + padding) > viewportWidth,
        overflowBottom: (position.y - scrollY + elementHeight + padding) > viewportHeight,
        overflowLeft: (position.x - scrollX) < padding,
        overflowTop: (position.y - scrollY) < padding,
    }
}

