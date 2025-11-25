import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useWebSocket } from '../hooks/useWebSocket';
import 'leaflet/dist/leaflet.css';
import './OrderTracking.css';

// Fix for Leaflet default icon not showing
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map center
function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

// Custom Icons
const courierIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const restaurantIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4287/4287725.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
});

function OrderTracking({ order }) {
    const { subscribe } = useWebSocket();
    const [courierLocation, setCourierLocation] = useState(null);
    const [orderStatus, setOrderStatus] = useState(order?.status);

    // Initial positions (Mock coordinates for Ocotepeque if not provided)
    const restaurantPos = order?.restaurant?.location ?
        [order.restaurant.location.lat, order.restaurant.location.lng] :
        [14.4333, -89.1833]; // Ocotepeque center

    const customerPos = order?.address?.location ?
        [order.address.location.lat, order.address.location.lng] :
        [14.4350, -89.1850]; // Slightly offset

    useEffect(() => {
        // Listen for courier location updates
        const unsubscribeLocation = subscribe('courierLocation', (data) => {
            if (data.orderId === order.id) {
                setCourierLocation([data.lat, data.lng]);
            }
        });

        // Listen for order status changes
        const unsubscribeStatus = subscribe('orderStatusChange', (data) => {
            if (data.orderId === order.id) {
                setOrderStatus(data.status);
            }
        });

        return () => {
            unsubscribeLocation();
            unsubscribeStatus();
        };
    }, [order.id, subscribe]);

    const showMap = ['ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'ON_ROUTE'].includes(orderStatus);

    if (!showMap) return null;

    return (
        <div className="tracking-map-container">
            <h3>📍 Seguimiento en Tiempo Real</h3>
            <div className="map-wrapper">
                <MapContainer
                    center={courierLocation || restaurantPos}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                >
                    <ChangeView center={courierLocation || restaurantPos} zoom={15} />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Restaurant Marker */}
                    <Marker position={restaurantPos} icon={restaurantIcon}>
                        <Popup>
                            <b>{order?.restaurant?.name || 'Restaurante'}</b>
                        </Popup>
                    </Marker>

                    {/* Customer Marker */}
                    <Marker position={customerPos} icon={homeIcon}>
                        <Popup>
                            <b>Tu ubicación</b>
                        </Popup>
                    </Marker>

                    {/* Courier Marker (only if location available) */}
                    {courierLocation && (
                        <Marker position={courierLocation} icon={courierIcon}>
                            <Popup>
                                <b>Repartidor</b>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            <div className="tracking-status">
                <div className="status-indicator">
                    <span className="pulse-dot"></span>
                    {orderStatus === 'ON_ROUTE' ? 'Repartidor en camino' : 'Esperando al repartidor...'}
                </div>
            </div>
        </div>
    );
}

export default OrderTracking;
