import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap gap-1.5 transition-colors overflow-hidden',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary/15 text-primary [a&]:hover:bg-primary/20',
                secondary:
                    'border-transparent bg-secondary/40 text-secondary-foreground [a&]:hover:bg-secondary/55',
                destructive:
                    'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90',
                outline:
                    'border-border bg-card text-foreground [a&]:hover:bg-muted',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'span';

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
