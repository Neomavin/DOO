'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authService from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validaciones básicas
    if (!name || name.length < 3) {
      setError('El nombre del restaurante debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Ingresa un email válido');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Concatenar +504 si hay teléfono
      const fullPhone = phone ? `+504${phone}` : undefined;
      await authService.register({ name, email, password, phone: fullPhone });
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => router.replace('/'), 1500);
    } catch (err: any) {
      console.error('Error de registro:', err);
      const message = err.response?.data?.message || err.message || 'No se pudo registrar';
      
      // Mensajes de error más específicos
      if (message.includes('email') || message.includes('Email')) {
        setError('Este email ya está registrado. Intenta con otro o inicia sesión.');
      } else if (message.includes('phone') || message.includes('teléfono')) {
        setError('El formato del teléfono no es válido. Usa: +504 XXXX-XXXX');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-brand-navy to-black">
      <div className="w-full max-w-md rounded-2xl border border-brand-navy bg-[#0b162b]/90 p-8 shadow-card">
        <h1 className="text-2xl font-bold text-brand-white">Crear cuenta</h1>
        <p className="mb-6 text-sm text-brand-gray">Registra tu restaurante para comenzar</p>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="text-sm font-semibold text-brand-gray" htmlFor="register-name">
              Nombre del restaurante *
            </label>
            <Input 
              id="register-name"
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi Restaurante"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-gray" htmlFor="register-email">
              Email *
            </label>
            <Input 
              id="register-email"
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@restaurante.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-gray" htmlFor="register-phone">
              Teléfono (opcional)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-brand-navy bg-brand-navy/30 px-3 py-2 min-w-[70px]">
                <span className="text-brand-gray font-medium">+504</span>
              </div>
              <Input 
                id="register-phone"
                type="tel"
                value={phone} 
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 8) {
                    setPhone(value);
                  }
                }}
                placeholder="XXXX-XXXX"
                maxLength={8}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-brand-gray" htmlFor="register-password">
              Contraseña *
            </label>
            <Input 
              id="register-password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando...' : 'Registrarse'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-brand-gray">
          ¿Ya tienes cuenta?{' '}
          <button 
            type="button"
            className="text-brand-accent hover:underline font-semibold" 
            onClick={() => router.push('/login')}
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}
