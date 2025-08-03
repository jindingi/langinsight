import { Languages } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { isTranslationIconVisibleAtom, mouseClickPositionAtom } from '@/entrypoints/content/atom'

export function TranslationButton() {
    const setIsTranslationIconVisible = useSetAtom(isTranslationIconVisibleAtom)
    const setMouseClickPosition = useSetAtom(mouseClickPositionAtom)

    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = rect.left
        const y = rect.top
        setMouseClickPosition({ x, y })
        setIsTranslationIconVisible(true)
        // setIsTranslatePopoverVisible(true)
    }

    return <button onClick={onClick}>
        <Languages strokeWidth={1.5} />
    </button>
}