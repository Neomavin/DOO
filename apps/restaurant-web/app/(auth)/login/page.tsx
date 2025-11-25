'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authService from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const [email, setEmail] = useState('demo@food.dev');
  const [password, setPassword] = useState('Demo123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      router.replace(redirectTo);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-brand-navy to-black">
      <div className="w-full max-w-md rounded-2xl border border-brand-navy bg-[#0b162b]/90 p-8 shadow-card">
        <h1 className="text-2xl font-bold text-brand-white">Bienvenido</h1>
        <p className="mb-6 text-sm text-brand-gray">Ingresa para gestionar tu restaurante</p>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="text-sm font-semibold text-brand-gray" htmlFor="login-email">
              Email
            </label>
            <Input
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@restaurante.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-gray" htmlFor="login-password">
              Contraseña
            </label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <button 
            type="button"
            className="text-brand-accent hover:underline" 
            onClick={() => router.push('/forgot')}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-brand-gray">
          ¿No tienes cuenta?{' '}
          <button 
            type="button"
            className="text-brand-accent hover:underline font-semibold" 
            onClick={() => router.push('/register')}
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}
