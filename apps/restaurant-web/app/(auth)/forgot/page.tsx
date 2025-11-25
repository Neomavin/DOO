'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authService from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await authService.requestPasswordReset(email);
      setMessage('Si tu correo existe, te enviaremos un enlace para restablecer tu contraseña.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-brand-navy to-black">
      <div className="w-full max-w-md rounded-2xl border border-brand-navy bg-[#0b162b]/90 p-8 shadow-card">
        <h1 className="text-2xl font-bold text-brand-white">¿Olvidaste tu contraseña?</h1>
        <p className="mb-6 text-sm text-brand-gray">
          Ingresa tu email y te enviaremos instrucciones para recuperarla.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-brand-gray">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="tu@restaurante.com"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-brand-gray">
          ¿Recordaste tu contraseña?{' '}
          <button 
            type="button"
            className="text-brand-accent hover:underline font-semibold" 
            onClick={() => router.push('/login')}
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
