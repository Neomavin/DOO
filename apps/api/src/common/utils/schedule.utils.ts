/**
 * Utilidades para manejo de horarios de restaurantes
 */

export interface RestaurantSchedule {
  openTime: string | null;     // "08:00"
  closeTime: string | null;    // "22:00"
  closedDays: string | null;   // "0,6" = cerrado domingo y sábado
}

/**
 * Verifica si un restaurante está abierto en este momento
 */
export function isRestaurantOpen(schedule: RestaurantSchedule): boolean {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Verificar si está cerrado hoy
  if (schedule.closedDays) {
    const closedDaysArray = schedule.closedDays.split(',').map(d => parseInt(d.trim()));
    if (closedDaysArray.includes(currentDay)) {
      return false;
    }
  }

  // Verificar horario
  if (schedule.openTime && schedule.closeTime) {
    const openTime = schedule.openTime;
    const closeTime = schedule.closeTime;

    // Caso normal: 08:00 - 22:00
    if (closeTime > openTime) {
      return currentTime >= openTime && currentTime <= closeTime;
    }
    
    // Caso especial: cierra después de medianoche (ej: 20:00 - 02:00)
    return currentTime >= openTime || currentTime <= closeTime;
  }

  // Si no hay horarios definidos, asumimos que está abierto
  return true;
}

/**
 * Obtiene el estado del restaurante con mensaje
 */
export function getRestaurantStatus(schedule: RestaurantSchedule): {
  isOpen: boolean;
  message: string;
} {
  const isOpen = isRestaurantOpen(schedule);
  
  if (!isOpen) {
    const now = new Date();
    const currentDay = now.getDay();
    
    // Verificar si está cerrado por el día
    if (schedule.closedDays) {
      const closedDaysArray = schedule.closedDays.split(',').map(d => parseInt(d.trim()));
      if (closedDaysArray.includes(currentDay)) {
        return {
          isOpen: false,
          message: `Cerrado hoy`,
        };
      }
    }
    
    // Cerrado por horario
    if (schedule.openTime) {
      return {
        isOpen: false,
        message: `Abre a las ${schedule.openTime}`,
      };
    }
    
    return {
      isOpen: false,
      message: 'Cerrado',
    };
  }
  
  return {
    isOpen: true,
    message: 'Abierto ahora',
  };
}

/**
 * Calcula cuánto tiempo falta para que abra (en minutos)
 */
export function getMinutesUntilOpen(schedule: RestaurantSchedule): number | null {
  if (!schedule.openTime) return null;
  
  const now = new Date();
  const [openHour, openMinute] = schedule.openTime.split(':').map(n => parseInt(n));
  
  const openingTime = new Date(now);
  openingTime.setHours(openHour, openMinute, 0, 0);
  
  if (openingTime <= now) {
    // Si ya pasó la hora de apertura hoy, calcular para mañana
    openingTime.setDate(openingTime.getDate() + 1);
  }
  
  const diffMs = openingTime.getTime() - now.getTime();
  return Math.floor(diffMs / 60000); // convertir a minutos
}

/**
 * Formatea el horario para mostrar al usuario
 */
export function formatSchedule(schedule: RestaurantSchedule): string {
  if (!schedule.openTime || !schedule.closeTime) {
    return 'Horario no disponible';
  }
  
  let scheduleText = `${schedule.openTime} - ${schedule.closeTime}`;
  
  if (schedule.closedDays && schedule.closedDays.length > 0) {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const closedDaysArray = schedule.closedDays.split(',').map(d => parseInt(d.trim()));
    const closedDayNames = closedDaysArray.map(d => dayNames[d]).join(', ');
    scheduleText += ` (Cerrado: ${closedDayNames})`;
  }
  
  return scheduleText;
}

/**
 * Valida si un horario es válido
 */
export function isValidSchedule(openTime: string, closeTime: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(openTime) || !timeRegex.test(closeTime)) {
    return false;
  }
  
  return true;
}
