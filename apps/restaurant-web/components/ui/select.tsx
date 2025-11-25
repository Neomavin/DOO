import * as React from 'react';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, options, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-10 w-full rounded-md border border-brand-navy bg-[#0f1c30] px-3 text-sm text-brand-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
      className
    )}
    {...props}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value} className="bg-brand-navy text-brand-gray">
        {option.label}
      </option>
    ))}
  </select>
));
Select.displayName = 'Select';
