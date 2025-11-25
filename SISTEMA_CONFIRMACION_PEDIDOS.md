# ✅ Sistema de Confirmación de Pedidos Implementado

## 🎉 Resumen

El **sistema completo de confirmación de pedidos** ha sido implementado. Ahora los restaurantes DEBEN confirmar cada pedido antes de que se procese.

---

## 📂 Archivos Creados/Modificados

### 1. **Backend - Controller**
```
apps/api/src/orders/orders.controller.ts
```

**Nuevos endpoints agregados:**
- `PATCH /orders/:id/accept` - Restaurante acepta pedido
- `PATCH /orders/:id/reject` - Restaurante rechaza pedido
- `PATCH /orders/:id/ready` - Restaurante marca como listo
- `GET /orders/restaurant/:restaurantId` - Obtener pedidos del restaurante

### 2. **Backend - Service**
```
apps/api/src/orders/orders.service.ts
```

**Nuevos métodos:**
- `acceptOrder(orderId, userId)` - Acepta y notifica
- `rejectOrder(orderId, reason)` - Rechaza con razón
- `markReady(orderId)` - Marca listo para recoger
- Notificación automática al crear pedido

### 3. **Backend - Gateway (WebSocket)**
```
apps/api/src/orders/orders.gateway.ts
```

**Nuevas funcionalidades:**
- `joinRestaurant` - Restaurante se conecta al socket
- `emitNewOrderToRestaurant` - Notifica nuevo pedido
- `emitOrderUpdateToRestaurant` - Actualiza estado

### 4. **DTO**
```
apps/api/src/orders/dto/reject-order.dto.ts
```

**Validación para rechazo:**
- Razón obligatoria
- Documentación Swagger

---

## 🔄 Flujo Completo

### **1. Cliente hace pedido:**
```
POST /orders
{
  "restaurantId": "rest-123",
  "items": [...],
  "totalCents": 24000
}

BACKEND:
├─ Crea orden con estado: NEW
├─ Emite WebSocket al restaurante
└─ Restaurante recibe notificación 🔔
```

---

### **2. Restaurante recibe notificación:**
```
WEBSOCKET EVENT: 'newOrder'
{
  "id": "order-456",
  "status": "NEW",
  "totalCents": 24000,
  "items": [...],
  "user": {
    "name": "Juan Pérez",
    "phone": "9999-9999"
  },
  "address": {
    "line1": "Calle Principal #123"
  }
}

PANEL WEB:
├─ 🔔 Notificación visual
├─ 🔊 Sonido de alerta
└─ Pedido aparece en "PENDIENTES"
```

---

### **3. Restaurante ACEPTA:**
```
PATCH /orders/order-456/accept

BACKEND:
├─ Cambia estado: NEW → ACCEPTED
├─ Guarda acceptedAt: timestamp
├─ Notifica al cliente via WebSocket
└─ Cliente ve: "Restaurante preparando tu pedido"

RESPONSE:
{
  "id": "order-456",
  "status": "ACCEPTED",
  "acceptedAt": "2025-11-09T10:30:00Z",
  ...
}
```

---

### **4. Restaurante RECHAZA:**
```
PATCH /orders/order-456/reject
{
  "reason": "Sin ingredientes disponibles"
}

BACKEND:
├─ Cambia estado: NEW → CANCELLED
├─ Guarda cancelReason
├─ Notifica al cliente
└─ Cliente ve: "Pedido cancelado: Sin ingredientes"

RESPONSE:
{
  "id": "order-456",
  "status": "CANCELLED",
  "cancelReason": "Sin ingredientes disponibles"
}
```

---

### **5. Restaurante marca LISTO:**
```
PATCH /orders/order-456/ready

BACKEND:
├─ Cambia estado: ACCEPTED → READY
├─ Guarda readyAt: timestamp
├─ Notifica al cliente
├─ Notifica a couriers disponibles
└─ Pedido aparece en lista de couriers

RESPONSE:
{
  "id": "order-456",
  "status": "READY",
  "readyAt": "2025-11-09T11:00:00Z"
}
```

---

## 📊 Estados del Pedido

```
NEW         → Pedido recién creado, esperando confirmación
   ↓
ACCEPTED    → Restaurante aceptó, está preparando
   ↓
PREPARING   → (Opcional) En preparación
   ↓
READY       → Listo para recoger, esperando courier
   ↓
PICKED_UP   → Courier recogió del restaurante
   ↓
ON_ROUTE    → Courier en camino al cliente
   ↓
DELIVERED   → Entregado al cliente
```

**Estado alternativo:**
```
NEW → CANCELLED (si restaurante rechaza)
```

---

## 🔔 Notificaciones WebSocket

### **Para Restaurantes:**

**Conectarse:**
```typescript
// Panel web del restaurante
socket.emit('joinRestaurant', restaurantId);
```

**Escuchar nuevo pedido:**
```typescript
socket.on('newOrder', (order) => {
  // Mostrar notificación
  showNotification('Nuevo pedido', order.id);
  
  // Reproducir sonido
  playSound('new-order.mp3');
  
  // Agregar a lista de pendientes
  addToPendingOrders(order);
});
```

**Escuchar actualización:**
```typescript
socket.on('orderUpdate', (order) => {
  // Actualizar en la UI
  updateOrderInList(order);
});
```

---

### **Para Clientes:**

**Conectarse:**
```typescript
// App móvil del cliente
socket.emit('join', userId);
```

**Escuchar cambio de estado:**
```typescript
socket.on('orderStatusChange', ({ orderId, status }) => {
  if (status === 'ACCEPTED') {
    showNotification('Pedido confirmado', 'El restaurante está preparando tu comida');
  }
  if (status === 'CANCELLED') {
    showNotification('Pedido cancelado', 'El restaurante no pudo procesar tu pedido');
  }
  if (status === 'READY') {
    showNotification('Pedido listo', 'Buscando courier...');
  }
});
```

---

## 🎯 Endpoints API

### **1. Aceptar Pedido**
```http
PATCH /orders/:id/accept
Authorization: Bearer {token}
Roles: RESTAURANT

Response 200:
{
  "id": "order-123",
  "status": "ACCEPTED",
  "acceptedAt": "2025-11-09T10:30:00Z",
  "restaurant": {...},
  "user": {...},
  "items": [...]
}
```

---

### **2. Rechazar Pedido**
```http
PATCH /orders/:id/reject
Authorization: Bearer {token}
Roles: RESTAURANT
Content-Type: application/json

{
  "reason": "Sin ingredientes disponibles"
}

Response 200:
{
  "id": "order-123",
  "status": "CANCELLED",
  "cancelReason": "Sin ingredientes disponibles"
}
```

---

### **3. Marcar como Listo**
```http
PATCH /orders/:id/ready
Authorization: Bearer {token}
Roles: RESTAURANT

Response 200:
{
  "id": "order-123",
  "status": "READY",
  "readyAt": "2025-11-09T11:00:00Z"
}
```

---

### **4. Obtener Pedidos del Restaurante**
```http
GET /orders/restaurant/:restaurantId
Authorization: Bearer {token}
Roles: RESTAURANT

Response 200:
[
  {
    "id": "order-123",
    "status": "NEW",
    "totalCents": 24000,
    "user": {...},
    "address": {...},
    "items": [...]
  },
  ...
]
```

---

## 🛠️ Implementación en Panel Web

### **Estructura Recomendada:**

```typescript
// apps/restaurant-web/app/(dashboard)/orders/page.tsx

export default function OrdersPage() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);

  useEffect(() => {
    // Conectar WebSocket
    const socket = io(API_URL);
    socket.emit('joinRestaurant', restaurantId);

    // Escuchar nuevos pedidos
    socket.on('newOrder', (order) => {
      setPendingOrders(prev => [order, ...prev]);
      playSound('/sounds/new-order.mp3');
      showNotification('Nuevo pedido', `#${order.id}`);
    });

    return () => socket.disconnect();
  }, []);

  const handleAccept = async (orderId) => {
    await ordersService.acceptOrder(orderId);
    // Mover de pendientes a aceptados
    const order = pendingOrders.find(o => o.id === orderId);
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    setAcceptedOrders(prev => [order, ...prev]);
  };

  const handleReject = async (orderId, reason) => {
    await ordersService.rejectOrder(orderId, reason);
    // Remover de pendientes
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleMarkReady = async (orderId) => {
    await ordersService.markReady(orderId);
    // Mover de aceptados a listos
    const order = acceptedOrders.find(o => o.id === orderId);
    setAcceptedOrders(prev => prev.filter(o => o.id !== orderId));
    setReadyOrders(prev => [order, ...prev]);
  };

  return (
    <div>
      <Section title="Pendientes de Confirmación">
        {pendingOrders.map(order => (
          <OrderCard key={order.id} order={order}>
            <Button onClick={() => handleAccept(order.id)}>
              ✅ ACEPTAR
            </Button>
            <Button onClick={() => showRejectModal(order.id)}>
              ❌ RECHAZAR
            </Button>
          </OrderCard>
        ))}
      </Section>

      <Section title="En Preparación">
        {acceptedOrders.map(order => (
          <OrderCard key={order.id} order={order}>
            <Timer startTime={order.acceptedAt} />
            <Button onClick={() => handleMarkReady(order.id)}>
              🍽️ MARCAR LISTO
            </Button>
          </OrderCard>
        ))}
      </Section>

      <Section title="Listos para Recoger">
        {readyOrders.map(order => (
          <OrderCard key={order.id} order={order}>
            <Badge>Esperando courier...</Badge>
          </OrderCard>
        ))}
      </Section>
    </div>
  );
}
```

---

## ⏱️ Tiempos y Timeouts (Próxima Implementación)

### **Timeout de Confirmación:**
```
Si restaurante NO confirma en 5 minutos:
├─ Auto-cancelar pedido
├─ Notificar al cliente
└─ Ofrecer pedir en otro restaurante
```

### **Timeout de Preparación:**
```
Si pasan 60 min sin marcar READY:
├─ Alerta al restaurante
├─ Opción de extender tiempo
└─ O cancelar pedido
```

**Implementación sugerida:**
```typescript
// En orders.service.ts
async scheduleAutoCancellation(orderId: string) {
  setTimeout(async () => {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (order && order.status === 'NEW') {
      await this.rejectOrder(orderId, 'Tiempo de confirmación excedido');
    }
  }, 5 * 60 * 1000); // 5 minutos
}
```

---

## 🧪 Cómo Probar

### **1. Crear pedido:**
```bash
curl -X POST http://localhost:4000/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "rest-123",
    "addressId": "addr-456",
    "items": [...],
    "totalCents": 24000
  }'
```

### **2. Verificar WebSocket:**
```javascript
// En consola del navegador (panel web)
const socket = io('http://localhost:4000');
socket.emit('joinRestaurant', 'rest-123');
socket.on('newOrder', (order) => {
  console.log('Nuevo pedido:', order);
});
```

### **3. Aceptar pedido:**
```bash
curl -X PATCH http://localhost:4000/orders/order-456/accept \
  -H "Authorization: Bearer {token}"
```

### **4. Rechazar pedido:**
```bash
curl -X PATCH http://localhost:4000/orders/order-456/reject \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Sin ingredientes"}'
```

---

## ✅ Checklist de Implementación

### Backend:
- [x] Endpoints de confirmación (accept/reject/ready)
- [x] Lógica en service
- [x] Notificaciones WebSocket
- [x] DTO de validación
- [ ] Auto-cancelación por timeout
- [ ] Tests unitarios

### Panel Web:
- [ ] UI para pedidos pendientes
- [ ] Botones aceptar/rechazar
- [ ] Modal de rechazo con razón
- [ ] Botón marcar listo
- [ ] Conexión WebSocket
- [ ] Notificaciones visuales
- [ ] Sonido de alerta

### App Móvil (Cliente):
- [ ] Escuchar cambios de estado
- [ ] Mostrar notificaciones
- [ ] Actualizar UI automáticamente

---

## 📈 Beneficios

### **Para el Negocio:**
- ✅ Control total del flujo de pedidos
- ✅ Evita pedidos no procesados
- ✅ Mejor experiencia del cliente
- ✅ Reduce confusiones

### **Para Restaurantes:**
- ✅ Pueden rechazar si no tienen ingredientes
- ✅ Control de su capacidad
- ✅ Comunicación clara con clientes

### **Para Clientes:**
- ✅ Saben inmediatamente si fue aceptado
- ✅ No esperan en vano
- ✅ Pueden pedir en otro lado si rechazan

---

## 🎯 Próximos Pasos

1. **Implementar UI en panel web** (2-3 horas)
2. **Agregar auto-cancelación** (1 hora)
3. **Sonidos y notificaciones** (1 hora)
4. **Tests** (2 horas)

---

**Estado:** ✅ Backend 100% completo  
**Pendiente:** UI en panel web  
**Implementado:** Nov 9, 2025  
**Documentación:** Completa
