import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Gift, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

const HAMPER_THEMES = [
    { id: 'diwali', name: 'Diwali Fest', emoji: '🪔', color: '#FF9F1C', desc: 'Diyas, sweets & decor' },
    { id: 'holi', name: 'Holi Colors', emoji: '🎨', color: '#FF006E', desc: 'Colors, gulal & joy' },
    { id: 'rakhi', name: 'Rakhi Special', emoji: '🎀', color: '#E91E8C', desc: 'Sweets & sibling love' },
    { id: 'wedding', name: 'Wedding Luxe', emoji: '💍', color: '#E85D04', desc: 'Traditional & premium' },
    { id: 'birthday', name: 'Birthday Bash', emoji: '🎂', color: '#8338EC', desc: 'Fun, festive & sweet' },
    { id: 'corporate', name: 'Corporate Pro', emoji: '🤝', color: '#3A86FF', desc: 'Elegant & professional' },
    { id: 'wellness', name: 'Self-Care Spa', emoji: '🌿', color: '#2A9D8F', desc: 'Relaxation & calm' },
    { id: 'housewarming', name: 'New Home', emoji: '🏡', color: '#F4A261', desc: 'Decor & warmth' },
    { id: 'romance', name: 'Date Night', emoji: '🌹', color: '#D90429', desc: 'Love & sweet treats' },
    { id: 'eco', name: 'Eco Green', emoji: '🌱', color: '#4CAF50', desc: 'Sustainable crafts' },
];

const HamperBuilder = () => {
    const { products } = useData();
    const { addToCart } = useCart();
    const { showToast } = useNotifications();
    const [selectedTheme, setSelectedTheme] = useState(HAMPER_THEMES[0]);
    const [hamperItems, setHamperItems] = useState([]);
    const [recipientName, setRecipientName] = useState('');
    const [personalMessage, setPersonalMessage] = useState('');
    const [budget, setBudget] = useState(2000);

    let baseProducts = products.filter(p => p.festival && p.festival.toLowerCase() === selectedTheme.id);
    if (baseProducts.length < 4) {
        let extra = [];
        if (selectedTheme.id === 'wedding') extra = products.filter(p => p.category === 'Jewelry' || p.category === 'Clothing');
        if (selectedTheme.id === 'corporate') extra = products.filter(p => p.category === 'Handicrafts' || p.category === 'Pottery');
        if (selectedTheme.id === 'birthday') extra = products.filter(p => p.category === 'Food & Sweets' || p.category === 'Decoration');
        if (selectedTheme.id === 'wellness') extra = products.filter(p => p.category === 'Candles & Diyas' || p.category === 'Pottery');
        if (selectedTheme.id === 'housewarming') extra = products.filter(p => p.category === 'Decoration' || p.category === 'Pottery' || p.category === 'Candles & Diyas');
        if (selectedTheme.id === 'romance') extra = products.filter(p => p.category === 'Jewelry' || p.category === 'Food & Sweets' || p.category === 'Candles & Diyas');
        if (selectedTheme.id === 'eco') extra = products.filter(p => p.category === 'Handicrafts' || p.category === 'Pottery');
        
        baseProducts = [...baseProducts, ...extra];
    }
    
    // Fallback to 'All' festival items and remove duplicates
    const allItems = [...baseProducts, ...products.filter(p => p.festival === 'All')];
    const uniqueProducts = Array.from(new Set(allItems.map(p => p.id)))
        .map(id => allItems.find(p => p.id === id));
        
    const suggestedProducts = uniqueProducts.slice(0, 8);
    const hamperTotal = hamperItems.reduce((s, item) => s + item.price * item.qty, 0);

    const addToHamper = (product) => {
        setHamperItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromHamper = (id) => setHamperItems(prev => prev.filter(i => i.id !== id));
    const updateQty = (id, qty) => {
        if (qty < 1) { removeFromHamper(id); return; }
        setHamperItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    };

    const handleAddAllToCart = () => {
        if (hamperItems.length === 0) { showToast('Add items to your hamper first!', 'error'); return; }
        hamperItems.forEach(item => addToCart(item, item.qty));
        showToast(`🎁 Hamper with ${hamperItems.length} items added to cart!`);
    };

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            <div className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Hamper Builder</h1>
                <p className="text-gray-500">Create the perfect festival gift hamper for your loved ones</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Builder Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Theme Selection */}
                    <div className="festival-card rounded-2xl p-6 border border-gray-100 shadow-sm bg-white overflow-hidden">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span> 
                            Choose Hamper Theme
                        </h2>
                        
                        {/* Unique Horizontal Arch Cards */}
                        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 pt-2 -mx-2 px-2 snap-x">
                            {HAMPER_THEMES.map(theme => {
                                const isSelected = selectedTheme.id === theme.id;
                                return (
                                    <button 
                                        key={theme.id} 
                                        onClick={() => setSelectedTheme(theme)} 
                                        className={`relative flex-shrink-0 w-32 h-44 rounded-t-full rounded-b-3xl p-4 flex flex-col items-center justify-center text-center transition-all duration-500 group snap-center border-2 ${isSelected ? 'shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] transform -translate-y-2 border-transparent' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-gray-100/50'}`}
                                        style={isSelected ? { background: `linear-gradient(135deg, ${theme.color}, ${theme.color}dd)` } : {}}
                                    >
                                        {/* Decorative inner aura when selected */}
                                        {isSelected && (
                                            <div className="absolute top-0 inset-x-0 h-24 bg-white opacity-20 rounded-t-full blur-md" />
                                        )}
                                        
                                        <div className={`text-4xl mb-4 transition-transform duration-500 relative z-10 ${isSelected ? 'scale-125 drop-shadow-md -translate-y-1' : 'group-hover:scale-110 drop-shadow-sm'}`}>
                                            {theme.emoji}
                                        </div>
                                        
                                        <div className={`text-sm font-black leading-tight relative z-10 transition-colors ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                            {theme.name}
                                        </div>
                                        
                                        <div className={`text-[9px] uppercase tracking-widest font-bold mt-2 relative z-10 transition-colors ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                            {theme.desc.split(',')[0]}
                                        </div>

                                        {/* Sparkles effect for selected state */}
                                        {isSelected && (
                                            <div className="absolute -bottom-1 -left-2 text-white/30 text-5xl rotate-12">
                                                <Sparkles className="w-12 h-12 stroke-1" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="festival-card rounded-2xl p-6 border border-gray-100 shadow-sm bg-white">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span> 
                            Set Budget
                        </h2>
                        <div className="px-2">
                            <input type="range" min={500} max={10000} step={100} value={budget} onChange={e => setBudget(+e.target.value)} className="w-full accent-primary mb-4 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400">₹500</span>
                                <span className="font-black text-2xl text-primary">₹{budget.toLocaleString()}</span>
                                <span className="text-xs font-bold text-gray-400">₹10,000</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="festival-card rounded-2xl p-6 border border-gray-100 shadow-sm bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span> 
                                Curated Products for {selectedTheme.name}
                            </h2>
                        </div>
                        
                        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-2 px-2 snap-x">
                            {suggestedProducts.map(product => {
                                const qtyInHamper = hamperItems.find(i => i.id === product.id)?.qty || 0;
                                return (
                                    <div key={product.id} className="relative flex-shrink-0 w-40 snap-start group">
                                        <div className="bg-gray-50 rounded-t-[2rem] rounded-b-xl p-2 border border-gray-100 transition-all group-hover:border-primary/30 group-hover:shadow-md">
                                            <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden relative mb-3">
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            
                                            <div className="px-2 text-center pb-2">
                                                <p className="text-[11px] font-bold text-gray-800 line-clamp-1 mb-1">{product.name}</p>
                                                <p className="text-sm font-black text-primary">₹{product.price}</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => addToHamper(product)} 
                                                className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 flex items-center justify-center gap-1 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> {qtyInHamper > 0 ? `Add Another (${qtyInHamper})` : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Personalization */}
                    <div className="festival-card rounded-2xl p-5">
                        <h2 className="font-bold mb-3">4. Personalize</h2>
                        <div className="space-y-3">
                            <input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Recipient's name" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                            <textarea value={personalMessage} onChange={e => setPersonalMessage(e.target.value)} placeholder="Personal message (will be printed on gift card)..." rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none resize-none" />
                        </div>
                    </div>
                </div>

                {/* Hamper Summary */}
                <div>
                    <div className="festival-card rounded-2xl p-5 sticky top-20">
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-2">{selectedTheme.emoji}</div>
                            <h3 className="font-bold">{selectedTheme.name}</h3>
                            {recipientName && <p className="text-sm text-gray-500">For: {recipientName}</p>}
                        </div>

                        {hamperItems.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                <Gift className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Add items to build your hamper</p>
                            </div>
                        ) : (
                            <div className="space-y-2 mb-4">
                                {hamperItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <img src={item.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-500">₹{item.price} × {item.qty}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                                            <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t pt-3 mb-4">
                            <div className="flex justify-between font-bold">
                                <span>Hamper Total</span>
                                <span style={{ color: hamperTotal > budget ? '#EF4444' : 'rgb(var(--color-primary))' }}>₹{hamperTotal.toLocaleString()}</span>
                            </div>
                            {hamperTotal > budget && <p className="text-xs text-red-500 mt-1">⚠️ Over budget by ₹{(hamperTotal - budget).toLocaleString()}</p>}
                        </div>

                        <button onClick={handleAddAllToCart} disabled={hamperItems.length === 0} className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--btn-gradient)' }}>
                            <ShoppingBag className="w-4 h-4" /> Add Hamper to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HamperBuilder;
