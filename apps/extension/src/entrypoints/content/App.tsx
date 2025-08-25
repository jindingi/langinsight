import { cn } from '@/lib/utils'
import { NOTRANSLATE_CLASS } from '@/consts/dom-labels'
import { SelectTranslation } from '@/entrypoints/content/SelectTranslation'

export function App() {
    return (
        <div className={cn('text-black dark:text-white', NOTRANSLATE_CLASS)}>
            <SelectTranslation />
        </div>
    )
}
