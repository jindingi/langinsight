import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [
      tailwindcss(),
    ],
  }),
  manifest: {
    name: 'LangInsight',
    description: 'Understand words and sentences instantly - select any text to see its meaning',
    version: '0.0.4',
    permissions: [
      'activeTab'
    ],
    content_scripts: [
      {
        matches: ['*://paulgraham.com/*'],
        js: ['content-scripts/content.js'],
        run_at: 'document_end'
      }
    ]
  },
  dev: {
    server: {
      port: 3333,
    },
  }
});
