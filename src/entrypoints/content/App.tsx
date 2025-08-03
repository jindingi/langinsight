import { cn } from '@/lib/utils'
import { SelectionIcon } from './selection'
import { NOTRANSLATE_CLASS } from '@/consts/dom-labels'

export function App() {
    return (
        <div className={cn('text-black dark:text-white', NOTRANSLATE_CLASS)}>
            <SelectionIcon />
        </div>
    )
}