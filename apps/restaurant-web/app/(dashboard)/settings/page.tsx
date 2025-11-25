'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import restaurantsService from '@/services/restaurants.service';
import authService from '@/services/auth.service';
import { Clock, MapPin, Phone, Store } from 'lucide-react';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    address: '',
    phone: '',
    openTime: '09:00',
    closeTime: '22:00',
    closedDays: [] as string[],
    deliveryRadius: 5,
  });

  const restaurantId = authService.getCurrentUser()?.restaurantId ?? 'demo';

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const data = await restaurantsService.get(restaurantId);
      setRestaurantData({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        openTime: data.openTime || '09:00',
        closeTime: data.closeTime || '22:00',
        closedDays: data.closedDays || [],
        deliveryRadius: data.deliveryRadius || 5,
      });
      setIsOpen(data.isOpen ?? true);
    } catch (error) {
      console.error('Error cargando restaurante:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await restaurantsService.update(restaurantId, restaurantData);
      alert('✅ Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleUpdate = async () => {
    setSaving(true);
    try {
      await restaurantsService.updateSchedule(restaurantId, {
        openTime: restaurantData.openTime,
        closeTime: restaurantData.closeTime,
        closedDays: restaurantData.closedDays,
      });
      alert('✅ Horarios actualizados');
    } catch (error) {
      console.error('Error actualizando horarios:', error);
      alert('❌ Error al actualizar horarios');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayKey: string) => {
    setRestaurantData((prev) => ({
      ...prev,
      closedDays: prev.closedDays.includes(dayKey)
        ? prev.closedDays.filter((d) => d !== dayKey)
        : [...prev.closedDays, dayKey],
    }));
  };

  const toggleOpenStatus = async () => {
    try {
      await restaurantsService.toggleOpen(restaurantId, !isOpen);
      setIsOpen(!isOpen);
      alert(`✅ Restaurante ${!isOpen ? 'abierto' : 'cerrado'}`);
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('❌ Error al cambiar estado');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-brand-gray">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-white">Configuración</h1>
          <p className="text-brand-gray">Información del restaurante y horarios</p>
        </div>
        <button
          onClick={toggleOpenStatus}
          className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors ${
            isOpen
              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
              : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          }`}
        >
          <div className={`h-3 w-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          {isOpen ? 'ABIERTO' : 'CERRADO'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información básica */}
        <Card className="space-y-4 bg-[#101b33]">
          <h2 className="text-xl font-semibold text-brand-white flex items-center gap-2">
            <Store className="h-5 w-5" />
            Información General
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-brand-gray mb-2 block">Nombre del restaurante</label>
              <Input
                value={restaurantData.name}
                onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
                className="bg-brand-navy border-brand-navy text-brand-white"
              />
            </div>
            <div>
              <label className="text-sm text-brand-gray mb-2 block flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección
              </label>
              <Input
                value={restaurantData.address}
                onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
                className="bg-brand-navy border-brand-navy text-brand-white"
              />
            </div>
            <div>
              <label className="text-sm text-brand-gray mb-2 block flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </label>
              <Input
                value={restaurantData.phone}
                onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })}
                className="bg-brand-navy border-brand-navy text-brand-white"
              />
            </div>
            <div>
              <label className="text-sm text-brand-gray mb-2 block">Radio de entrega (km)</label>
              <Input
                type="number"
                value={restaurantData.deliveryRadius}
                onChange={(e) =>
                  setRestaurantData({ ...restaurantData, deliveryRadius: Number(e.target.value) })
                }
                className="bg-brand-navy border-brand-navy text-brand-white"
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </Card>

        {/* Horarios */}
        <Card className="space-y-4 bg-[#101b33]">
          <h2 className="text-xl font-semibold text-brand-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de Atención
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-brand-gray mb-2 block">Hora de apertura</label>
                <Input
                  type="time"
                  value={restaurantData.openTime}
                  onChange={(e) =>
                    setRestaurantData({ ...restaurantData, openTime: e.target.value })
                  }
                  className="bg-brand-navy border-brand-navy text-brand-white"
                />
              </div>
              <div>
                <label className="text-sm text-brand-gray mb-2 block">Hora de cierre</label>
                <Input
                  type="time"
                  value={restaurantData.closeTime}
                  onChange={(e) =>
                    setRestaurantData({ ...restaurantData, closeTime: e.target.value })
                  }
                  className="bg-brand-navy border-brand-navy text-brand-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-brand-gray mb-3 block">Días de atención</label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map((day, index) => {
                  const dayKey = DAY_KEYS[index];
                  const isClosed = restaurantData.closedDays.includes(dayKey);
                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => toggleDay(dayKey)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        isClosed
                          ? 'bg-red-500/10 text-red-500 line-through'
                          : 'bg-green-500/10 text-green-500'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-brand-gray/70 mt-2">
                Click para marcar/desmarcar días cerrados
              </p>
            </div>

            <Button
              onClick={handleScheduleUpdate}
              className="w-full bg-brand-accent hover:bg-brand-accent/90"
              disabled={saving}
            >
              {saving ? 'Actualizando...' : 'Actualizar Horarios'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
