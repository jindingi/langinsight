import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

interface ShadowRootProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export function ShadowRoot({ children, isOpen, onClose }: ShadowRootProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);
    const reactRootRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create shadow DOM
        if (!shadowRootRef.current) {
            shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });

            // Create style element for Tailwind CSS
            const styleElement = document.createElement('style');
            styleElement.textContent = `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        
        :host {
          all: initial;
          position: fixed;
          z-index: 10001;
        }
        
        * {
          box-sizing: border-box;
        }
      `;
            shadowRootRef.current.appendChild(styleElement);

            // Create React root container
            const reactContainer = document.createElement('div');
            shadowRootRef.current.appendChild(reactContainer);

            // Create React root
            reactRootRef.current = createRoot(reactContainer);
        }

        // Render React content
        if (reactRootRef.current && isOpen) {
            reactRootRef.current.render(
                <div onClick={onClose} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'transparent',
                    zIndex: 10001
                }}>
                    <div onClick={(e) => e.stopPropagation()}>
                        {children}
                    </div>
                </div>
            );
        } else if (reactRootRef.current && !isOpen) {
            reactRootRef.current.render(null);
        }

        return () => {
            // Cleanup is handled by the parent component
        };
    }, [children, isOpen, onClose]);

    useEffect(() => {
        // Cleanup when component unmounts
        return () => {
            if (reactRootRef.current) {
                reactRootRef.current.unmount();
                reactRootRef.current = null;
            }
        };
    }, []);

    return <div ref={containerRef} />;
} 