import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface MeaningPopupProps {
    selectedText: string;
    position: { x: number; y: number };
    onClose: () => void;
}

export function MeaningPopup({ selectedText, position, onClose }: MeaningPopupProps) {
    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 10002,
                minWidth: '300px',
                maxWidth: '400px',
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                    "{selectedText}"
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    style={{ minWidth: '20px' }}
                >
                    ×
                </button>
            </div>

            {/* Content with Accordion */}
            <Accordion type="multiple" defaultValue={["meaning", "example"]} className="w-full">
                <AccordionItem value="meaning">
                    <AccordionTrigger className="text-sm font-medium text-gray-700">
                        Meaning
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-gray-600 text-sm">
                            This is a placeholder meaning for the selected text. In the future, this will be fetched from an API that provides definitions, translations, or explanations.
                        </p>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="example">
                    <AccordionTrigger className="text-sm font-medium text-gray-700">
                        Example
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-gray-600 text-sm italic">
                            "This word/phrase is commonly used in academic writing."
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Footer */}
            <div className="border-t pt-2 mt-3">
                <p className="text-xs text-gray-500">
                    Powered by LangInsight Extension
                </p>
            </div>
        </div>
    );
} 