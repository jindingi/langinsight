import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'LangInsight',
    description: 'Understand words and sentences instantly - select any text to see its meaning',
    version: '0.0.3',
    permissions: [
      'activeTab'
    ],
    content_scripts: [
      {
        matches: ['*://*/*'],
        js: ['content-scripts/content.js'],
        run_at: 'document_end'
      }
    ]
  }
});
