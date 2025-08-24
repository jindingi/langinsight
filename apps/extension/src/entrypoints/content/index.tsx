// import { ContentController } from '@/entrypoints/content/controller';
import { App } from '@/entrypoints/content/App'
import ReactDOM from 'react-dom/client'
import '@/assets/globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'

export default defineContentScript({
    matches: ['*://*/*'],
    cssInjectionMode: 'ui',
    async main(ctx) {
        const ui = await createShadowRootUi(ctx, {
            name: `langinsight-selection`,
            position: 'overlay',
            anchor: 'body',
            onMount: container => {
                // const controller = new ContentController(shadow);
                // controller.setupEventListeners();
                const queryClient = new QueryClient()

                const wrapper = document.createElement('div')
                // wrapper.className =
                // 'text-base antialiased font-sans z-[2147483647]'
                container.appendChild(wrapper)
                // Create a root on the UI container and render a component
                const root = ReactDOM.createRoot(wrapper)
                root.render(
                    <StrictMode>
                        <QueryClientProvider client={queryClient}>
                            <App />
                        </QueryClientProvider>
                    </StrictMode>,
                )
                return root
            },
            onRemove: root => {
                // Unmount the root when the UI is removed
                root?.unmount()
            },
        })

        // 4. Mount the UI
        ui.mount()
        console.log('Content script loaded')
    },
})
