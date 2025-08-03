import { atom, useAtom } from 'jotai'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { TextSelector } from './text-selection'

const isVisibleAtom = atom(false)

function Content() {
    const textSelector = new TextSelector()
    const selectedText = textSelector.getSelectedText()
    console.log(selectedText)
    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>{selectedText?.text}</AccordionTrigger>
                <AccordionContent>{selectedText?.context}</AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export function App() {
    const [isVisible, setIsVisible] = useAtom(isVisibleAtom)
    return (
        <div>
            <Button variant="outline" onClick={() => {
                setIsVisible(!isVisible)
            }}>
                Click me
            </Button>

            {isVisible && <Content />}
        </div>
    )
}