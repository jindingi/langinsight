import { cn } from '@/lib/utils'
import { Selection } from './selection'
import { NOTRANSLATE_CLASS } from '@/consts/dom-labels'

export function App() {
    return (
        <div className={cn('text-black dark:text-white', NOTRANSLATE_CLASS)}>
            <Selection />
        </div>
    )
}