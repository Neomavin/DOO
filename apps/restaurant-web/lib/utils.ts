import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(value);

export const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
