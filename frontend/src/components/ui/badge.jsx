import * as React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-600 text-white shadow-sm shadow-brand-600/30',
        secondary: 'border border-slate-700 bg-cinema-800 text-slate-300',
        destructive: 'border-transparent bg-rose-600/90 text-white shadow-sm shadow-rose-600/30',
        outline: 'border border-slate-700 text-slate-300',
        success: 'border-transparent bg-emerald-600/90 text-white shadow-sm shadow-emerald-600/30',
        warning: 'border-transparent bg-amber-500/90 text-black font-extrabold shadow-sm shadow-amber-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
