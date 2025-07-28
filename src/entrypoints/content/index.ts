import { ContentController } from './controller';

export default defineContentScript({
    matches: ['*://*/*'], // Match all websites
    main() {
        console.log('Text selection detector loaded');

        const controller = new ContentController();
        controller.setupEventListeners();
    },
}); 