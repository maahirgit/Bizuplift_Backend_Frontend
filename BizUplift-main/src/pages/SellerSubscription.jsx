import { useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const SellerSubscription = () => {
    const { currentUser } = useAuth();
    const { showToast } = useNotifications();
    const navigate = useNavigate();

    if (!currentUser || currentUser.role !== 'seller') { navigate('/auth'); return null; }

    const handleSubscriptionPayment = async (planName, amount) => {
        const res = await loadRazorpayScript();
        if (!res) {
            showToast('Razorpay SDK failed to load. Are you online?', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('bizuplift_token');
            let razorpayOrderId = `mock_order_${Date.now()}`;
            let rzpAmount = amount * 100;
            
            if (token) {
                try {
                    const response = await fetch('/api/orders/razorpay', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ amount, receipt: `sub_${Date.now()}` })
                    });
                    const data = await response.json();
                    if (data.success && data.razorpayOrder) {
                        razorpayOrderId = data.razorpayOrder.id;
                        rzpAmount = data.razorpayOrder.amount;
                    }
                } catch (e) { console.warn('Backend Razorpay generation failed, using mock ID'); }
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: rzpAmount,
                currency: 'INR',
                name: 'BizUplift',
                description: `${planName} Plan Subscription`,
                order_id: razorpayOrderId.startsWith('mock') ? undefined : razorpayOrderId,
                handler: function (response) {
                    showToast(`Successfully upgraded to ${planName} Plan! 🎉`);
                },
                prefill: {
                    name: currentUser?.name || 'Seller',
                    email: currentUser?.email || 'seller@bizuplift.com',
                    contact: '9999999999'
                },
                theme: {
                    color: planName === 'Premium' ? '#dc2626' : '#f97316'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error(error);
            showToast('Something went wrong during checkout', 'error');
        }
    };

    return (
        <div className="container py-8 pb-20 lg:pb-8">
            <div className="pt-4 pb-12">
                <div className="relative rounded-[2.5rem] overflow-hidden p-6 md:p-10 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800">
                    
                    {/* Animated Background Orbs */}
                    <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px]" />

                    <div className="relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 drop-shadow-md">Elevate Your Business</h2>
                            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                                Choose the perfect glass-tier subscription to unlock powerful features, detailed analytics, and premium placement on BizUplift.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto font-body">
                            
                            {/* Free Plan */}
                            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] flex flex-col">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-500 border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                                    <span className="text-2xl">🌱</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-wide">Starter</h3>
                                <p className="text-xs text-slate-400 mb-6 h-10">Perfect for new sellers testing the waters.</p>
                                
                                <div className="text-4xl font-black text-white mb-8 tracking-tight">
                                    ₹0 <span className="text-sm font-semibold text-slate-500 tracking-normal">/ month</span>
                                </div>

                                <div className="flex-1 space-y-4 text-sm font-medium text-slate-300">
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]"/> Up to 50 Products</div>
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]"/> Basic Analytics</div>
                                    <div className="flex items-center gap-3 opacity-40"><X className="w-5 h-5 text-slate-500"/> Priority Support</div>
                                    <div className="flex items-center gap-3 opacity-40"><X className="w-5 h-5 text-slate-500"/> Featured Placement</div>
                                    <div className="flex items-center gap-3 text-amber-200/70"><span className="w-5 h-5 flex items-center justify-center font-bold text-amber-400">%</span> Pays 2% Fee</div>
                                </div>

                                <button onClick={() => showToast('You are already on the Starter Plan!')} className="mt-8 w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors border border-white/10">
                                    Current Plan
                                </button>
                            </div>

                            {/* Standard Plan */}
                            <div className="group relative bg-gradient-to-b from-orange-500/20 to-white/5 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_0_50px_rgba(249,115,22,0.25)] flex flex-col transform md:scale-105 z-10">
                                <div className="absolute -top-4 inset-x-0 flex justify-center">
                                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/30 animate-pulse">
                                        Most Popular
                                    </span>
                                </div>
                                
                                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-500/30">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Standard</h3>
                                <p className="text-xs text-orange-200/60 mb-6 h-10">For growing businesses scaling their sales.</p>
                                
                                <div className="text-4xl font-black text-white mb-8 tracking-tight">
                                    ₹999 <span className="text-sm font-semibold text-orange-200/40 tracking-normal">/ month</span>
                                </div>

                                <div className="flex-1 space-y-4 text-sm font-medium text-orange-50">
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"/> Up to 500 Products</div>
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"/> Advanced Analytics</div>
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"/> Priority Support</div>
                                    <div className="flex items-center gap-3 opacity-40"><X className="w-5 h-5 text-slate-400"/> Featured Placement</div>
                                    <div className="flex items-center gap-3 text-orange-200/80"><span className="w-5 h-5 flex items-center justify-center font-bold text-orange-400">%</span> Pays 1% Fee</div>
                                </div>

                                <button onClick={() => handleSubscriptionPayment('Standard', 999)} className="mt-8 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/25">
                                    Upgrade Now
                                </button>
                            </div>

                            {/* Premium Plan */}
                            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(220,38,38,0.15)] flex flex-col">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform duration-500 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                                    <span className="text-2xl">👑</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-wide">Premium</h3>
                                <p className="text-xs text-slate-400 mb-6 h-10">Ultimate power and zero fees for top sellers.</p>
                                
                                <div className="text-4xl font-black text-white mb-8 tracking-tight">
                                    ₹2999 <span className="text-sm font-semibold text-slate-500 tracking-normal">/ month</span>
                                </div>

                                <div className="flex-1 space-y-4 text-sm font-medium text-slate-300">
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-red-500 drop-shadow-[0_0_3px_rgba(220,38,38,0.5)]"/> Unlimited Products</div>
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-red-500 drop-shadow-[0_0_3px_rgba(220,38,38,0.5)]"/> Adv + Custom Reports</div>
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-red-500 drop-shadow-[0_0_3px_rgba(220,38,38,0.5)]"/> Dedicated Manager</div>
                                    <div className="flex items-center gap-3"><Check className="w-5 h-5 text-red-500 drop-shadow-[0_0_3px_rgba(220,38,38,0.5)]"/> Homepage Placement</div>
                                    <div className="flex items-center gap-3 text-red-300/80"><Check className="w-5 h-5 text-red-500 drop-shadow-[0_0_3px_rgba(220,38,38,0.5)]"/> Zero Platform Fee</div>
                                </div>

                                <button onClick={() => handleSubscriptionPayment('Premium', 2999)} className="mt-8 w-full bg-white/5 hover:bg-red-500/20 text-white font-bold py-3 rounded-xl transition-colors border border-white/10 hover:border-red-500/50 hover:text-red-300">
                                    Go Premium
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerSubscription;
