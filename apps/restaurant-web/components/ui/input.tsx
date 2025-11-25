import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-brand-navy bg-[#0f1c30] px-3 py-2 text-sm text-brand-gray shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent placeholder:text-brand-gray/70 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
