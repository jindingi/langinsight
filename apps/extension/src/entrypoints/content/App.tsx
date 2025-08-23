import { cn } from '@/lib/utils'
import { NOTRANSLATE_CLASS } from '@/consts/dom-labels'
import { Selection } from '@/entrypoints/content/selection'

export function App() {
    return (
        <div className={cn('text-black dark:text-white', NOTRANSLATE_CLASS)}>
            <Selection />
        </div>
    )
}
