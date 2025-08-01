/**
 * 将 Tailwind CSS 和其他样式注入到 Shadow DOM 中
 */
export function addStylesToShadow(shadow: ShadowRoot) {
    // 注入 Tailwind CSS 样式
    document.head.querySelectorAll('style').forEach((styleEl) => {
        // 检查是否是 Tailwind CSS 或其他相关样式
        const content = styleEl.textContent || '';

        if (
            content.includes('@tailwind') ||
            content.includes('tailwindcss') ||
            content.includes('--tw-') ||
            content.includes('text-base') ||
            content.includes('antialiased') ||
            content.includes('font-sans') ||
            content.includes('border-') ||
            content.includes('bg-') ||
            content.includes('text-') ||
            content.includes('p-') ||
            content.includes('m-') ||
            styleEl.getAttribute('data-vite-dev-id')?.includes('globals.css')
        ) {
            const clonedStyle = styleEl.cloneNode(true) as HTMLStyleElement;
            shadow.appendChild(clonedStyle);
            console.log('✅ Injected style to shadow DOM:', styleEl);
        }
    });

    // 也检查 link 标签中的 CSS
    document.head.querySelectorAll('link[rel="stylesheet"]').forEach((linkEl) => {
        const href = linkEl.getAttribute('href');
        if (href && (href.includes('tailwind') || href.includes('globals'))) {
            const clonedLink = linkEl.cloneNode(true) as HTMLLinkElement;
            shadow.appendChild(clonedLink);
            console.log('✅ Injected CSS link to shadow DOM:', linkEl);
        }
    });
} 