import { atom, useAtom } from 'jotai'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const isVisibleAtom = atom(false)

function Content() {
    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
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