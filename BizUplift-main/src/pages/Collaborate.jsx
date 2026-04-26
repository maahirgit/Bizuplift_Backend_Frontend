import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Handshake, Store, Users, Sparkles, Check } from 'lucide-react';

const BENEFITS = [
    { icon: '📦', title: 'Zero Commission', desc: 'Keep 100% of your earnings for the first 3 months' },
    { icon: '🌍', title: 'Pan-India Reach', desc: 'Sell to customers across all 28 states' },
    { icon: '🤝', title: 'AI Negotiation', desc: 'Let AI handle price negotiations for you' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Track sales, revenue, and customer insights' },
    { icon: '🎪', title: 'Festival Boost', desc: 'Get featured during festival seasons' },
    { icon: '💳', title: 'Instant Payouts', desc: 'Get paid within 2 business days' },
];

const Collaborate = () => {
    const { currentUser } = useAuth();
    const { showToast } = useNotifications();
    const navigate = useNavigate();
    const [form, setForm] = useState({ businessName: '', category: 'Handicrafts', city: '', state: '', description: '', phone: '', email: currentUser?.email || '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentUser) { navigate('/auth'); return; }
        setSubmitted(true);
        showToast('Application submitted! We\'ll contact you within 48 hours 🎉');
    };

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            {/* Hero */}
            <div className="text-center py-12 mb-10 rounded-3xl" style={{ background: 'var(--btn-gradient)' }}>
                <div className="text-5xl mb-4">🤝</div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Collaborate with BizUplift</h1>
                <p className="text-white/80 max-w-xl mx-auto">Join 500+ local artisans and sellers who are growing their business with BizUplift's festival marketplace</p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {BENEFITS.map(b => (
                    <div key={b.title} className="festival-card rounded-2xl p-4 text-center">
                        <div className="text-3xl mb-2">{b.icon}</div>
                        <h3 className="font-bold text-sm mb-1">{b.title}</h3>
                        <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                ))}
            </div>

            {/* Application Form */}
            <div className="max-w-lg mx-auto">
                {submitted ? (
                    <div className="festival-card rounded-3xl p-10 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Application Received! 🎉</h2>
                        <p className="text-gray-500 mb-6">Our team will review your application and contact you within 48 hours at <strong>{form.email}</strong></p>
                        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-full font-bold text-white" style={{ background: 'var(--btn-gradient)' }}>Back to Home</button>
                    </div>
                ) : (
                    <div className="festival-card rounded-3xl p-6">
                        <h2 className="font-bold text-xl mb-6">Seller Application</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Business Name *</label>
                                    <input required value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} placeholder="Priya's Crafts" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Category *</label>
                                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                                        {['Handicrafts', 'Food & Sweets', 'Clothing', 'Decoration', 'Jewelry', 'Pottery', 'Candles & Diyas'].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">City *</label>
                                    <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Jaipur" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">State *</label>
                                    <input required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Rajasthan" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Email *</label>
                                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone *</label>
                                <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="9876543210" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Tell us about your business *</label>
                                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your products, crafts, and what makes them special..." rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none resize-none" />
                            </div>
                            <button type="submit" className="w-full py-3 rounded-xl font-bold text-white" style={{ background: 'var(--btn-gradient)' }}>
                                Submit Application
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Collaborate;
