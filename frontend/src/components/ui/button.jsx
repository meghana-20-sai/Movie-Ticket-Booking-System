import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-white hover:bg-brand-500 shadow-md shadow-brand-600/20',
        destructive: 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/20',
        outline: 'border border-slate-700/80 bg-transparent hover:bg-slate-800/80 text-slate-200 hover:text-white',
        secondary: 'bg-cinema-800 text-slate-200 hover:bg-cinema-700 hover:text-white border border-slate-700/50',
        ghost: 'hover:bg-slate-800/60 text-slate-300 hover:text-white',
        link: 'text-brand-400 underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-brand-600 to-rose-500 text-white hover:from-brand-500 hover:to-rose-400 shadow-lg shadow-brand-600/30',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'h-9 w-9 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants, cn };
