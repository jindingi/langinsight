import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'
import path from 'path'

export default defineConfig({
    plugins: [WxtVitest()],
    test: {
        globals: true,
        setupFiles: './vitest.setup.ts',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
