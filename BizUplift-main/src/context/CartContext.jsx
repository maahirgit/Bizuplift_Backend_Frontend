import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotifications } from './NotificationContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [appliedCredits, setAppliedCredits] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('bizuplift_cart');
        if (stored) setCartItems(JSON.parse(stored));
    }, []);

    const persist = (items) => {
        setCartItems(items);
        localStorage.setItem('bizuplift_cart', JSON.stringify(items));
    };

    const { showToast } = useNotifications();

    const addToCart = (product, quantity = 1, negotiatedPrice = null) => {
        setCartItems(prev => {
            let newCart;
            const existing = prev.find(item => item.productId === product.id && item.negotiatedPrice === negotiatedPrice);
            if (existing) {
                const combined = existing.quantity + quantity;
                if (combined > 20) showToast('Maximum 20 units allowed per product', 'warning');
                const newQuantity = Math.min(20, combined);
                newCart = prev.map(item =>
                    item.productId === product.id && item.negotiatedPrice === negotiatedPrice
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                if (quantity > 20) showToast('Maximum 20 units allowed per product', 'warning');
                newCart = [...prev, {
                    id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    productId: product.id,
                    name: product.name,
                    image: product.images && product.images.length > 0 ? product.images[0] : null,
                    sellerId: product.sellerId,
                    sellerName: product.sellerName,
                    originalPrice: product.price,
                    negotiatedPrice,
                    price: negotiatedPrice || product.price,
                    quantity: Math.min(20, quantity),
                    isNegotiated: !!negotiatedPrice,
                }];
            }
            localStorage.setItem('bizuplift_cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    const removeFromCart = (itemId) => persist(cartItems.filter(item => item.id !== itemId));

    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) return removeFromCart(itemId);
        if (quantity > 20) {
            showToast('Maximum 20 units allowed per product', 'warning');
            quantity = 20;
        }
        persist(cartItems.map(item => item.id === itemId ? { ...item, quantity } : item));
    };

    const clearCart = () => persist([]);

    const applyCoupon = async (code, currentUser) => {
        const upperCode = code.toUpperCase();
        const coupons = { 'HOLI20': 20, 'DIWALI15': 15, 'NEWUSER10': 10, 'BIZUPLIFT': 5 };
        if (coupons[upperCode]) {
            if (upperCode === 'NEWUSER10') {
                if (!currentUser) {
                    return { success: false, message: 'Please login to use NEWUSER10.' };
                }
                try {
                    const data = await api.get('/orders');
                    const orders = Array.isArray(data) ? data : data.orders || [];
                    if (orders.length > 0) {
                        return { success: false, message: 'NEWUSER10 is only valid for your first order.' };
                    }
                } catch (err) {
                    return { success: false, message: 'Failed to verify new user status.' };
                }
            }

            const festivalDates = {
                'HOLI': new Date(new Date().getFullYear(), 2, 3), // March 3
                'DIWALI': new Date(new Date().getFullYear(), 10, 8) // Nov 8
            };
            
            let festDate = null;
            if (upperCode.startsWith('HOLI')) festDate = festivalDates['HOLI'];
            else if (upperCode.startsWith('DIWALI')) festDate = festivalDates['DIWALI'];
            
            if (festDate) {
                const now = new Date();
                const diffTime = Math.abs(now - festDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 5) {
                    return { success: false, message: 'This festival coupon is only valid within 5 days of the festival date.' };
                }
            }

            setCouponCode(upperCode);
            setCouponDiscount(coupons[upperCode]);
            return { success: true, discount: coupons[upperCode] };
        }
        return { success: false, message: 'Invalid coupon code' };
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const platformFee = Math.round(subtotal * 0.02);
    const couponAmount = Math.floor(subtotal * couponDiscount / 100);
    const creditsAmount = Math.min(appliedCredits, Math.floor(subtotal * 0.1)); // max 10% via credits
    const deliveryFee = subtotal > 999 ? 0 : 49;
    const total = subtotal + platformFee - couponAmount - creditsAmount + deliveryFee;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, itemCount, subtotal, platformFee, couponAmount, creditsAmount, deliveryFee, total,
            appliedCredits, setAppliedCredits, couponCode, couponDiscount,
            addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
