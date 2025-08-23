import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends React.ComponentProps<typeof Input> {
    /**
     * Custom class name for the container div
     */
    containerClassName?: string
}

export function PasswordInput({
    containerClassName,
    className,
    ...props
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
        <div className={cn('relative', containerClassName)}>
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn('pr-10', className)}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-md hover:bg-primary/10 active:bg-primary/20"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                )}
            </button>
        </div>
    )
}
