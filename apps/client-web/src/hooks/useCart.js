import { useCartStore } from '../store';

/**
 * Custom hook para manejar la lógica del carrito
 * Encapsula todas las operaciones del carrito en un solo lugar
 */
export const useCart = () => {
    const items = useCartStore(state => state.items);
    const restaurant = useCartStore(state => state.restaurant);
    const addItem = useCartStore(state => state.addItem);
    const removeItem = useCartStore(state => state.removeItem);
    const updateQuantity = useCartStore(state => state.updateQuantity);
    const clearCart = useCartStore(state => state.clearCart);
    const getTotal = useCartStore(state => state.getTotal);
    const getItemCount = useCartStore(state => state.getItemCount);

    /**
     * Obtiene el total del carrito
     */
    const total = getTotal();

    /**
     * Obtiene el número total de items en el carrito
     */
    const itemCount = getItemCount();

    /**
     * Verifica si el carrito está vacío
     */
    const isEmpty = items.length === 0;

    /**
     * Agrega un item al carrito con la cantidad especificada
     * @param {Object} item - El item a agregar
     * @param {number} quantity - La cantidad a agregar (default: 1)
     */
    const addToCart = (item, quantity = 1) => {
        addItem({ ...item, quantity });
    };

    /**
     * Incrementa la cantidad de un item en el carrito
     * @param {number} itemId - ID del item
     */
    const incrementItem = (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            updateQuantity(itemId, item.quantity + 1);
        }
    };

    /**
     * Decrementa la cantidad de un item en el carrito
     * @param {number} itemId - ID del item
     */
    const decrementItem = (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            if (item.quantity > 1) {
                updateQuantity(itemId, item.quantity - 1);
            } else {
                removeItem(itemId);
            }
        }
    };

    return {
        // Estado
        items,
        restaurant,
        total,
        itemCount,
        isEmpty,

        // Acciones
        addToCart,
        removeItem,
        incrementItem,
        decrementItem,
        updateQuantity,
        clearCart,
    };
};
