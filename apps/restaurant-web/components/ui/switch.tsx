'use client';
import * as React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Switch({ checked, onChange, ...props }: SwitchProps) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} {...props} />
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-brand-accent' : 'bg-[#1f2c45]'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-brand-black transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </label>
  );
}
