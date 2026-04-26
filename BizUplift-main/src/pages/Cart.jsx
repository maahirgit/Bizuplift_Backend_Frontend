import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, Star, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';

const Cart = () => {
    const { cartItems, itemCount, subtotal, platformFee, couponAmount, creditsAmount, deliveryFee, total, appliedCredits, setAppliedCredits, couponCode, couponDiscount, removeFromCart, updateQuantity, applyCoupon } = useCart();
    const { currentUser } = useAuth();
    const { getUserCredits } = useData();
    const { showToast } = useNotifications();
    const navigate = useNavigate();
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');

    const [userCredits, setUserCredits] = useState({ balance: 0 });

    useEffect(() => {
        if (currentUser && currentUser.role !== 'customer') {
            navigate(currentUser.role === 'seller' ? '/dashboard/seller' : '/dashboard/admin');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (currentUser) {
            getUserCredits(currentUser.id)
                .then(data => {
                    if (data) {
                        setUserCredits({ balance: data.balance || 0 });
                    }
                })
                .catch(() => setUserCredits({ balance: 0 }));
        }
    }, [currentUser, getUserCredits]);

    const maxCreditsUsable = Math.min(userCredits.balance, Math.floor(subtotal * 0.1));

    const handleCoupon = async () => {
        const result = await applyCoupon(couponInput, currentUser);
        if (result.success) { showToast(`Coupon applied! ${result.discount}% off 🎉`); setCouponError(''); }
        else { setCouponError(result.message || 'Invalid coupon code'); }
    };

    const handleCheckout = () => {
        if (!currentUser) { navigate('/auth'); return; }
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="container py-20 text-center pb-20 lg:pb-6">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Discover amazing festival products from local sellers</p>
                <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white" style={{ background: 'var(--btn-gradient)' }}>
                    <ShoppingBag className="w-4 h-4" /> Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            <h1 className="text-2xl font-heading font-bold mb-6">Shopping Cart ({itemCount} items)</h1>
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="festival-card rounded-2xl p-4 flex gap-4">
                            <Link to={`/product/${item.productId}`}>
                                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link to={`/product/${item.productId}`} className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{item.name}</Link>
                                <p className="text-xs text-gray-500 mt-0.5">{item.sellerName}</p>
                                {item.isNegotiated && (
                                    <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1">🤝 Negotiated Price</span>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                                        <span className="px-3 py-1 text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold" style={{ color: 'rgb(var(--color-primary))' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="space-y-4">
                    {/* Coupon */}
                    <div className="festival-card rounded-2xl p-4">
                        <h3 className="font-bold mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Apply Coupon</h3>
                        <div className="flex gap-2">
                            <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} placeholder="HOLI20, DIWALI15..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                            <button onClick={handleCoupon} className="px-3 py-2 rounded-lg text-white text-sm font-bold" style={{ background: 'rgb(var(--color-primary))' }}>Apply</button>
                        </div>
                        {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                        {couponCode && <p className="text-xs text-green-600 mt-1">✓ {couponCode} applied! {couponDiscount}% off</p>}
                        <p className="text-xs text-gray-400 mt-2">Try: HOLI20, DIWALI15, NEWUSER10, BIZUPLIFT</p>
                    </div>

                    {/* Credits */}
                    {currentUser && userCredits.balance > 0 && (
                        <div className="festival-card rounded-2xl p-4">
                            <h3 className="font-bold mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Use Credit Points</h3>
                            <p className="text-xs text-gray-500 mb-2">Available: {userCredits.balance} pts (max 10% of order)</p>
                            <input type="range" min={0} max={maxCreditsUsable} value={appliedCredits} onChange={e => setAppliedCredits(+e.target.value)} className="w-full accent-primary" />
                            <div className="flex justify-between text-xs mt-1">
                                <span>0 pts</span>
                                <span className="font-bold text-primary">{appliedCredits} pts = ₹{appliedCredits}</span>
                                <span>{maxCreditsUsable} pts</span>
                            </div>
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="festival-card rounded-2xl p-4">
                        <h3 className="font-bold mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal ({itemCount} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Platform Fee (2%)</span><span>₹{platformFee.toLocaleString()}</span></div>
                            {couponAmount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({couponCode})</span><span>-₹{couponAmount}</span></div>}
                            {creditsAmount > 0 && <div className="flex justify-between text-green-600"><span>Credits Used</span><span>-₹{creditsAmount}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                            {deliveryFee > 0 && <p className="text-xs text-gray-400">Add ₹{999 - subtotal} more for free delivery</p>}
                            <hr className="my-2" />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span style={{ color: 'rgb(var(--color-primary))' }}>₹{total.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-green-600">You'll earn ~{Math.floor(total / 10)} credit points on this order</p>
                        </div>
                        <button onClick={handleCheckout} className="w-full mt-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: 'var(--btn-gradient)' }}>
                            Proceed to Checkout <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
