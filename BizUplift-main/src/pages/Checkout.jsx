import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Package, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import { formatOrderId } from '../utils/formatters';

const Confetti = () => {
    const colors = ['#FFD700', '#FF006E', '#06D6A0', '#E85D04', '#7C3AED', '#FF6B00'];
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="absolute animate-confetti-fall" style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}px`,
                    width: `${6 + Math.random() * 8}px`,
                    height: `${6 + Math.random() * 8}px`,
                    background: colors[Math.floor(Math.random() * colors.length)],
                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                }} />
            ))}
        </div>
    );
};

const Checkout = () => {
    const { cartItems, total, subtotal, platformFee, couponAmount, creditsAmount, deliveryFee, clearCart } = useCart();
    const { currentUser } = useAuth();
    const { addOrder, addNotification, addCredits, redeemCredits } = useData();
    const { showToast, addNotification: addNotif } = useNotifications();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: address, 2: payment, 3: success
    const [address, setAddress] = useState({ name: currentUser?.name || '', line1: '', city: '', state: '', pincode: '', phone: currentUser?.mobile || '' });
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [upiId, setUpiId] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('user_addresses');
        if (saved) {
            const parsed = JSON.parse(saved);
            setSavedAddresses(parsed);
            // Auto-select default or first address
            const defaultAddr = parsed.find(a => a.isDefault) || parsed[0];
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
                setAddress({
                    name: defaultAddr.name,
                    line1: defaultAddr.line1,
                    city: defaultAddr.city,
                    state: defaultAddr.state,
                    pincode: defaultAddr.pincode,
                    phone: defaultAddr.phone
                });
            }
        }
    }, []);

    const handleSelectSavedAddress = (addr) => {
        setSelectedAddressId(addr.id);
        setAddress({
            name: addr.name,
            line1: addr.line1,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            phone: addr.phone
        });
    };

    const STATES = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'];

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // For COD, use the old flow
            if (paymentMethod === 'COD') {
                await new Promise(r => setTimeout(r, 1500)); // simulate processing
                const order = await addOrder({ 
                    customerId: currentUser.id, 
                    items: cartItems.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price, image: i.image })), 
                    total, 
                    paymentMethod, 
                    address 
                });
                
                // Deduct spent credits
                if (creditsAmount > 0) {
                    await redeemCredits(creditsAmount);
                }
                
                // Add newly earned credits is now handled strictly by the backend in orderController.js
                setOrderId(order.id || order._id);
                clearCart();
                setShowConfetti(true);
                setStep(3);
                showToast('Order placed successfully! 🎉');
            } else {
                // Razorpay Online Flow
                const response = await fetch('/api/orders/razorpay', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('bizuplift_token')}`
                    },
                    body: JSON.stringify({ amount: total, currency: 'INR' })
                });
                const { razorpayOrder } = await response.json();

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Should be provided by user
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: 'BizUplift',
                    description: 'Festival Marketplace Purchase',
                    order_id: razorpayOrder.id,
                    handler: async function (response) {
                        // Verify payment signature
                        setLoading(true);
                        const verifyRes = await fetch('/api/orders/verify', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('bizuplift_token')}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderDetails: {
                                    items: cartItems.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
                                    total,
                                    address,
                                    paymentMethod
                                }
                            })
                        });
                        const verifyJson = await verifyRes.json();
                        
                        if (verifyJson.success) {
                            // Deduct spent credits
                            if (creditsAmount > 0) await redeemCredits(creditsAmount);
                            
                            setOrderId(verifyJson.order._id);
                            clearCart();
                            setShowConfetti(true);
                            setStep(3);
                            showToast('Payment successful & Order placed! 💳');
                            addNotif(currentUser.id, { 
                                type: 'order', 
                                title: 'Payment Success!', 
                                body: `Your order ${verifyJson.order._id} has been confirmed. Thank you for shopping!` 
                            });
                        } else {
                            showToast('Payment verification failed', 'error');
                        }
                        setLoading(false);
                    },
                    prefill: {
                        name: address.name,
                        contact: address.phone,
                        email: currentUser.email
                    },
                    theme: { color: '#FF6B00' },
                    modal: {
                        ondismiss: function() {
                            setLoading(false);
                            showToast('Payment cancelled', 'info');
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            console.error('Order error:', error);
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            if (paymentMethod === 'COD') setLoading(false);
        }
    };

    if (!currentUser) { navigate('/auth'); return null; }
    if (cartItems.length === 0 && step !== 3) { navigate('/cart'); return null; }

    return (
        <div className="container py-6 pb-20 lg:pb-6 max-w-3xl">
            {showConfetti && <Confetti />}

            {/* Progress */}
            {step < 3 && (
                <div className="flex items-center gap-2 mb-8">
                    {['Address', 'Payment', 'Confirm'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={step === i + 1 ? { background: 'rgb(var(--color-primary))' } : {}}>
                                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-primary' : 'text-gray-400'}`}>{s}</span>
                            {i < 2 && <div className="flex-1 h-0.5 bg-gray-200" />}
                        </div>
                    ))}
                </div>
            )}

            {/* Step 1: Address */}
            {step === 1 && (
                <div className="space-y-6">
                    {savedAddresses.length > 0 && (
                        <div className="animate-fade-in">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Select Saved Address</h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                {savedAddresses.map(addr => (
                                    <button 
                                        key={addr.id}
                                        onClick={() => handleSelectSavedAddress(addr)}
                                        className={`flex-shrink-0 w-64 p-4 rounded-2xl border-2 text-left transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/[0.02] shadow-lg shadow-primary/10' : 'border-gray-100 bg-white opacity-60 hover:opacity-100'}`}
                                        style={selectedAddressId === addr.id ? { borderColor: 'rgb(var(--color-primary))' } : {}}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-gray-100">{addr.label}</span>
                                            {selectedAddressId === addr.id && <Check className="w-4 h-4 text-primary" />}
                                        </div>
                                        <p className="text-sm font-bold text-gray-800 truncate">{addr.name}</p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{addr.line1}, {addr.city}</p>
                                        <p className="text-[10px] font-semibold text-gray-400 mt-2">📞 {addr.phone}</p>
                                    </button>
                                ))}
                                <button 
                                    onClick={() => { setSelectedAddressId('new'); setAddress({ name: '', line1: '', city: '', state: '', pincode: '', phone: '' }); }}
                                    className={`flex-shrink-0 w-40 p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary transition-all ${selectedAddressId === 'new' ? 'border-primary bg-primary/[0.02] text-primary' : 'border-gray-200 bg-white/50'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">+</div>
                                    <span className="text-xs font-bold">New Address</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="festival-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        {/* Decorative background for the active address form */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] pointer-events-none" />
                        
                        <h2 className="font-bold text-xl mb-6 relative">
                            {selectedAddressId === 'new' ? 'New Delivery Address' : 'Confirm Delivery Details'}
                        </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Full Name', key: 'name', placeholder: 'Arjun Mehta' },
                            { label: 'Phone', key: 'phone', placeholder: '9876543210' },
                            { label: 'Address Line', key: 'line1', placeholder: '42, Shanti Nagar', full: true },
                            { label: 'City', key: 'city', placeholder: 'Mumbai' },
                            { label: 'Pincode', key: 'pincode', placeholder: '400001' },
                        ].map(field => (
                            <div key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">{field.label}</label>
                                <input value={address[field.key]} onChange={e => setAddress(a => ({ ...a, [field.key]: e.target.value }))} placeholder={field.placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary font-body" />
                            </div>
                        ))}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">State</label>
                            <select value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none font-body">
                                <option value="">Select State</option>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={() => { if (Object.values(address).some(v => !v)) { showToast('Please fill all fields', 'error'); return; } setStep(2); }} className="mt-6 w-full py-3 rounded-xl font-bold text-white" style={{ background: 'var(--btn-gradient)' }}>
                        Continue to Payment
                    </button>
                </div>
            </div>
        )}

            {/* Step 2: Payment */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="festival-card rounded-2xl p-6">
                        <h2 className="font-bold text-xl mb-6">Payment Method</h2>
                        <div className="space-y-3">
                            {[
                                { id: 'UPI', icon: <Smartphone className="w-5 h-5" />, label: 'UPI / QR Code', desc: 'Pay via PhonePe, GPay, Paytm' },
                                { id: 'Card', icon: <CreditCard className="w-5 h-5" />, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                                { id: 'COD', icon: <Package className="w-5 h-5" />, label: 'Cash on Delivery', desc: 'Pay when you receive' },
                            ].map(method => (
                                <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`} style={paymentMethod === method.id ? { borderColor: 'rgb(var(--color-primary))' } : {}}>
                                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-primary" />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg" style={{ background: 'rgba(var(--color-primary), 0.1)', color: 'rgb(var(--color-primary))' }}>{method.icon}</div>
                                        <div>
                                            <p className="font-semibold text-sm">{method.label}</p>
                                            <p className="text-xs text-gray-500">{method.desc}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {paymentMethod === 'UPI' && (
                            <div className="mt-4">
                                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
                            </div>
                        )}
                    </div>

                    {/* Order summary */}
                    <div className="festival-card rounded-2xl p-4">
                        <h3 className="font-bold mb-3">Order Summary</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Platform Fee (2%)</span><span>₹{platformFee.toLocaleString()}</span></div>
                            {couponAmount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-₹{couponAmount}</span></div>}
                            {creditsAmount > 0 && <div className="flex justify-between text-green-600"><span>Credits</span><span>-₹{creditsAmount}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                            <hr className="my-2" />
                            <div className="flex justify-between font-bold text-base"><span>Total</span><span style={{ color: 'rgb(var(--color-primary))' }}>₹{total.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-sm">← Back</button>
                        <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70" style={{ background: 'var(--btn-gradient)' }}>
                            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : `Pay ₹${total.toLocaleString()}`}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
                <div className="text-center py-12 max-w-lg mx-auto">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-5xl animate-bounce-once shadow-inner">🎉</div>
                    <h2 className="text-4xl font-heading font-bold mb-3" style={{ background: 'var(--btn-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Thank you for your order!
                    </h2>
                    <p className="text-lg font-medium text-gray-700 mb-6">
                        We've received your request and we're getting it ready for you.
                    </p>
                    
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 mb-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'var(--btn-gradient)' }} />
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Order Identifier</p>
                                <p className="text-xl font-mono font-bold text-gray-800">{formatOrderId(orderId)}</p>
                            </div>
                            <div className="h-px bg-gray-50 w-full" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Estimated Arrival</p>
                                <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2" style={{ color: 'rgb(var(--color-primary))' }}>
                                    <Package className="w-6 h-6" />
                                    {(() => {
                                        const min = new Date(); min.setDate(min.getDate() + 3);
                                        const max = new Date(); max.setDate(max.getDate() + 7);
                                        const opt = { month: 'short', day: 'numeric' };
                                        return `${min.toLocaleDateString('en-US', opt)} — ${max.toLocaleDateString('en-US', opt)}`;
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/orders')} className="flex-1 px-8 py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-primary/20 transition-all active:scale-95" style={{ background: 'var(--btn-gradient)' }}>
                            Track Your Order
                        </button>
                        <button onClick={() => navigate('/')} className="flex-1 px-8 py-4 rounded-2xl border-2 border-gray-100 bg-white font-bold text-gray-600 hover:border-gray-200 transition-all active:scale-95">
                            Back to Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
