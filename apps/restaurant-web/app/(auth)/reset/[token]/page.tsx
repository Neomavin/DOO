'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authService from '@/services/auth.service';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await authService.resetPassword(token, password);
      setSuccess('Tu contraseña fue actualizada. Redirigiendo al login...');
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-brand-navy to-black">
      <div className="w-full max-w-md rounded-2xl border border-brand-navy bg-[#0b162b]/90 p-8 shadow-card">
        <h1 className="text-2xl font-bold text-brand-white">Restablecer contraseña</h1>
        <p className="mb-6 text-sm text-brand-gray">Ingresa una nueva contraseña segura.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-brand-gray">Nueva contraseña</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="text-sm text-brand-gray">Confirmar contraseña</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </form>
      </div>
    </div>
  );
}
