import { ContentController } from './controller';

export default defineContentScript({
    matches: ['*://*/*'],
    main() {
        console.log('Content script loaded');

        const controller = new ContentController();
        controller.setupEventListeners();
    },
});
