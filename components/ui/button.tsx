'use client'

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-center whitespace-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover',
        secondary: 'border-border bg-card text-foreground hover:bg-zinc-50',
        outline: 'border-border bg-card text-foreground hover:bg-zinc-50',
        ghost: 'border-transparent text-foreground hover:bg-muted',
        destructive: 'border-destructive bg-destructive/10 text-foreground hover:bg-destructive/20',
        link: 'border-transparent text-foreground underline underline-offset-4 hover:bg-muted',
      },
      size: {
        default: '',
        xs: 'px-3 text-xs',
        sm: 'px-3',
        lg: 'min-h-12 px-6',
        icon: 'size-11 p-0',
        'icon-xs': 'size-11 p-0',
        'icon-sm': 'size-11 p-0',
        'icon-lg': 'size-12 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>

function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="default" />
}

function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />
}

export { Button, PrimaryButton, SecondaryButton, buttonVariants }
export type { ButtonProps }
