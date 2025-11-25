const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.3:4000';

// Algunos entornos todavía especifican /api aunque el backend no tenga prefijo.
// Normalizamos quitando el /api final para evitar 404 en auth/login o auth/register.
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');
export const API_URL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl.slice(0, -4)
  : normalizedApiUrl;

export const COLORS = {
  black: '#000000',
  navy: '#14213d',
  accent: '#fca311',
  gray: '#e5e5e5',
  white: '#ffffff',
};

export const ORDER_STATUSES = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as const;
