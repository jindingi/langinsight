import { defineConfig, WxtViteConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import toUtf8 from './scripts/vite_plugin_to_utf8'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => {
    return {
      plugins: [
        toUtf8(),
        react(),
        tailwindcss(),
      ],
    } as WxtViteConfig
  },
  manifest: {
    name: 'LangInsight',
    description: 'Understand words and sentences instantly - select any text to see its meaning',
    version: '0.0.4',
    permissions: [
      'activeTab',
      'storage'
    ],
    content_scripts: [
      {
        matches: ['*://paulgraham.com/*', '*://news.ycombinator.com/*'],
        js: ['content-scripts/content.js'],
        run_at: 'document_end'
      }
    ]
  },
  dev: {
    server: {
      port: 3333,
    },
  },
  webExt: {
    startUrls: ['https://paulgraham.com/read.html'],
    chromiumArgs: [
      '--user-data-dir=./.wxt/chrome-data',
    ],
  }
});
