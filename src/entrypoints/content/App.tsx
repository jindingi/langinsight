import { atom, useAtom } from 'jotai'
import { Languages } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
const isVisibleAtom = atom(false)

function Content() {
    return (
        <p>
            Hello
        </p>
    )
}

export function App() {
    const [isVisible, setIsVisible] = useAtom(isVisibleAtom)
    return (
        <div>
            <button type="button" className="size-6 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer" onClick={() => {
                setIsVisible(!isVisible)
            }}>
                <Languages className="size-4" />
            </button>

            {isVisible && <Content />}
        </div>
    )
}