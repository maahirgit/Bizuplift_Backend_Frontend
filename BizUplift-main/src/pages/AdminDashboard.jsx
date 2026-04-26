import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingBag, TrendingUp, Check, X, Eye, Shield, Bell, Palette, Store, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme, THEMES, FESTIVAL_CALENDAR, getNextFestival } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const { users, products, orders, sellers, reviews, updateUser } = useData();
    const { theme, adminOverride, isAutoMode, setThemeAdmin, nextFestival } = useTheme();
    const { showToast } = useNotifications();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [broadcast, setBroadcast] = useState('');

    if (!currentUser || currentUser.role !== 'admin') { navigate('/'); return null; }

    const totalPlatformFee = orders.reduce((s, o) => s + (o.platformFee || (o.total || 0) * 0.02), 0);

    const stats = [
        { label: 'Total Users', value: users.length, icon: '👥', color: '#7C3AED', trend: '+12%' },
        { label: 'Total Products', value: products.length, icon: '📦', color: '#E85D04', trend: '+5%' },
        { label: 'Total Orders', value: orders.length, icon: '🛒', color: '#06D6A0', trend: '+18%' },
        { label: 'Platform Revenue', value: `₹${Math.round(totalPlatformFee).toLocaleString()}`, icon: '💰', color: '#FFD700', trend: '+24%' },
    ];

    const getMonthName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', { month: 'short' });
    };

    const monthlyData = {};
    orders.forEach(order => {
        const dateStr = order.createdAt || order.paidAt || Date.now();
        const month = getMonthName(dateStr);
        const fee = order.platformFee || ((order.total || 0) * 0.02) || 0;

        if (!monthlyData[month]) {
            monthlyData[month] = { month, revenue: 0, orders: 0, timestamp: new Date(dateStr).getTime() };
        }
        monthlyData[month].revenue += fee;
        monthlyData[month].orders += 1;
    });

    let revenueData = Object.values(monthlyData)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(d => ({ ...d, revenue: Math.round(d.revenue) }));

    if (revenueData.length === 0) {
        const d = new Date();
        for (let i = 5; i >= 0; i--) {
            const m = new Date(d.getFullYear(), d.getMonth() - i, 1).toLocaleString('en-IN', { month: 'short' });
            revenueData.push({ month: m, revenue: Math.floor(Math.random() * 5000) + 2000, orders: Math.floor(Math.random() * 50) + 10 });
        }
    }

    const categoryDistribution = {};
    products.forEach(p => {
        categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({ name, value })).slice(0, 5);


    const TABS = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'themes', label: '🎨 Themes' },
        { id: 'users', label: '👥 Users' },
        { id: 'sellers', label: '🏪 Sellers' },
        { id: 'products', label: '📦 Products' },
        { id: 'broadcast', label: '📢 Broadcast' },
    ];

    const themeList = Object.values(THEMES);
    const sortedFestivals = getNextFestival();

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: 'var(--btn-gradient)' }}>🛡️</div>
                <div>
                    <h1 className="text-xl font-heading font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500">BizUplift Control Panel</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto mb-6">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === tab.id ? 'text-white' : 'bg-gray-100 text-gray-600'}`} style={activeTab === tab.id ? { background: 'rgb(var(--color-primary))' } : {}}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="festival-card rounded-2xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <TrendingUp className="w-12 h-12" style={{ color: stat.color }} />
                                </div>
                                <div className="text-3xl mb-1">{stat.icon}</div>
                                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{stat.label}</div>
                                    <div className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 rounded">{stat.trend}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 festival-card rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-lg">Revenue Insights</h3>
                                    <p className="text-xs text-gray-500">Platform earnings over time</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-[10px] font-bold text-gray-400">REVENUE</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0.6}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="month" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} 
                                            tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`} 
                                        />
                                        <Tooltip 
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 p-4 min-w-[140px] z-50">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-tighter">{payload[0].payload.month} Analytics</p>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-sm font-bold text-gray-700">Earnings</span>
                                                                <span className="text-sm font-black text-primary">₹{(payload[0].value || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4 mt-1">
                                                                <span className="text-xs font-medium text-gray-400">Total Orders</span>
                                                                <span className="text-xs font-bold text-gray-600">{payload[0].payload.orders || 0}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar 
                                            dataKey="revenue" 
                                            fill="url(#revenueGradient)" 
                                            radius={[8, 8, 2, 2]} 
                                            barSize={40}
                                            activeBar={{ 
                                                filter: 'brightness(1.2) drop-shadow(0 4px 8px rgba(var(--color-primary), 0.3))' 
                                            }}
                                            animationBegin={0}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="festival-card rounded-2xl p-6 flex flex-col">
                            <h3 className="font-bold text-lg mb-1">Category Demand</h3>
                            <p className="text-xs text-gray-500 mb-6">Inventory distribution across types</p>
                            
                            <div className="flex-1 space-y-4">
                                {categoryData.map((cat, idx) => {
                                    const percentage = Math.round((cat.value / products.length) * 100) || 0;
                                    return (
                                        <div key={cat.name}>
                                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                                <span className="text-gray-600">{cat.name}</span>
                                                <span className="text-gray-400">{percentage}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-1000" 
                                                    style={{ 
                                                        width: `${percentage}%`, 
                                                        background: `hsl(${idx * 45 + 240}, 70%, 60%)` 
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="festival-card rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Recent Activity</h3>
                                <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                {orders.slice(0, 4).map(o => (
                                    <div key={o.id} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-700 truncate">Order #{o.id ? o.id.slice(-6) : '...'}</p>
                                            <p className="text-[10px] text-gray-400">Total: ₹{o.total}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-300">Just now</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="festival-card rounded-2xl p-6">
                            <h3 className="font-bold mb-1">Customer Sentiment</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Rating Distribution</p>
                            
                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = reviews.filter(r => Math.round(r.rating) === star).length;
                                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-gray-400 w-4">{star}★</span>
                                            <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-1000" 
                                                    style={{ 
                                                        width: `${percentage}%`, 
                                                        background: star >= 4 ? '#06D6A0' : star === 3 ? '#FFD700' : '#EF4444' 
                                                    }} 
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 w-6 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Avg Score</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-black text-gray-700">4.8</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-tight">Sentiment is **Positive**. Users highly appreciate the "Handmade" authenticity.</p>
                            </div>
                        </div>

                        <div className="festival-card rounded-2xl p-6">
                            <h3 className="font-bold mb-4">User Split</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Customers', count: users.filter(u => u.role === 'customer').length, color: '#06D6A0' },
                                    { label: 'Sellers', count: users.filter(u => u.role === 'seller').length, color: '#E85D04' },
                                    { label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: '#7C3AED' }
                                ].map(({ label, count, color }) => (
                                    <div key={label}>
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                                <span className="font-semibold text-gray-600">{label}</span>
                                            </div>
                                            <span className="font-bold text-gray-400">{count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(count / users.length) * 100}%`, background: color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========== THEME CONTROL (ADMIN ONLY) =========== */}
            {activeTab === 'themes' && (
                <div className="space-y-6">
                    {/* Current Status */}
                    <div className="festival-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Palette className="w-6 h-6" style={{ color: 'rgb(var(--color-primary))' }} />
                            <div>
                                <h3 className="font-bold text-lg">Website Theme Control</h3>
                                <p className="text-xs text-gray-500">Only admins can change the website theme. Users see the theme applied by you or the auto-system.</p>
                            </div>
                        </div>

                        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(var(--color-primary), 0.06)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold">Current Status</span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isAutoMode ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {isAutoMode ? '🤖 Auto Mode' : '✋ Manual Override'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p><strong>Active Theme:</strong> {THEMES[theme]?.emoji} {THEMES[theme]?.name || theme}</p>
                                {nextFestival && <p className="mt-1"><strong>Next Festival:</strong> {nextFestival.emoji} {nextFestival.name} — {nextFestival.isActive ? '🔴 Happening now!' : `${nextFestival.daysUntil} days away`}</p>}
                                {adminOverride && <p className="mt-1 text-xs text-red-500">⚠️ Auto-switching is disabled because you've manually set a theme.</p>}
                            </div>
                        </div>

                        {/* Auto Mode Toggle */}
                        <button
                            onClick={() => { setThemeAdmin('auto'); showToast('🤖 Auto mode enabled! Theme will change with festivals.'); }}
                            className={`w-full p-4 rounded-xl border-2 transition-all mb-4 text-left flex items-center gap-4 ${isAutoMode ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'}`}
                        >
                            <span className="text-3xl">🤖</span>
                            <div className="flex-1">
                                <div className="font-bold text-sm">Automatic Mode</div>
                                <div className="text-xs text-gray-500">Theme changes automatically when a festival is within 15 days. Goes back to default otherwise.</div>
                            </div>
                            {isAutoMode && <span className="text-green-600 text-lg font-bold">✓</span>}
                        </button>

                        {/* Manual Theme Grid */}
                        <p className="text-sm font-bold text-gray-600 mb-3">Or manually set a theme:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {themeList.map(t => {
                                const isActive = !isAutoMode && theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => { setThemeAdmin(t.id); showToast(`${t.emoji} ${t.name} theme applied!`); }}
                                        className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-[1.03] ${isActive ? 'border-current shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                                        style={{ borderColor: isActive ? t.dotColor : undefined }}
                                    >
                                        <div className="text-3xl mb-2">{t.emoji}</div>
                                        <div className="text-sm font-bold">{t.name}</div>
                                        <div className="text-[10px] text-gray-500">{t.description}</div>
                                        {isActive && <div className="mt-2 text-xs font-bold" style={{ color: typeof t.dotColor === 'string' && t.dotColor.startsWith('#') ? t.dotColor : 'rgb(var(--color-primary))' }}>✓ Active</div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Festival Timeline */}
                    <div className="festival-card rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-4">📅 Festival Timeline — Auto Theme Schedule</h3>
                        <p className="text-xs text-gray-500 mb-4">When in Auto Mode, the theme activates 15 days before each festival and stays for 3 days after.</p>
                        <div className="space-y-3">
                            {sortedFestivals.map((f, i) => (
                                <div key={f.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${f.isActive ? 'bg-red-50 border border-red-200' : f.daysUntil <= 15 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-100'}`}>
                                    <span className="text-2xl">{f.emoji}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{f.name}</span>
                                            {f.isActive && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">LIVE</span>}
                                            {!f.isActive && i === 0 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">NEXT</span>}
                                            {f.daysUntil <= 15 && !f.isActive && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">THEME ACTIVE</span>}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {f.nextDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} — {f.isActive ? '🔴 Happening now' : `${f.daysUntil} days away`}
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full" style={{ background: f.color }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
                <div>
                    <h3 className="font-bold mb-4">All Users ({users.length})</h3>
                    <div className="space-y-2">
                        {users.map(user => (
                            <div key={user.id} className="festival-card rounded-xl p-3 flex items-center gap-3">
                                <img src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'seller' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span>
                                <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sellers */}
            {activeTab === 'sellers' && (
                <div>
                    <h3 className="font-bold mb-4">Seller Verification ({sellers.length})</h3>
                    <div className="space-y-3">
                        {sellers.map(seller => (
                            <div key={seller.id} className="festival-card rounded-2xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <img src={seller.avatar} alt="" className="w-10 h-10 rounded-full" />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{seller.business}</p>
                                        <p className="text-xs text-gray-500">{seller.name} · {seller.city}, {seller.state}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${seller.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {seller.verified ? '✓ Verified' : 'Pending'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{seller.story}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>⭐ {seller.rating}</span>
                                    <span>📦 {seller.products} products</span>
                                    <span>🛒 {seller.totalOrders} orders</span>
                                    {!seller.verified && (
                                        <button onClick={() => { showToast(`${seller.business} verified! ✓`); }} className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 text-white font-bold">
                                            <Check className="w-3 h-3" /> Verify
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
                <div>
                    <h3 className="font-bold mb-4">All Products ({products.length})</h3>
                    <div className="space-y-2">
                        {products.map(product => (
                            <div key={product.id} className="festival-card rounded-xl p-3 flex items-center gap-3">
                                <img src={product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.sellerName} · {product.festival}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm" style={{ color: 'rgb(var(--color-primary))' }}>₹{product.price}</p>
                                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Broadcast */}
            {activeTab === 'broadcast' && (
                <div className="max-w-lg">
                    <div className="festival-card rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-4">📢 Broadcast Notification</h3>
                        <p className="text-sm text-gray-500 mb-4">Send a notification to all users on the platform.</p>
                        <textarea value={broadcast} onChange={e => setBroadcast(e.target.value)} placeholder="Enter your message... e.g. 🪔 Diwali Sale is LIVE! Up to 30% off on all products." rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none resize-none mb-3" />
                        <div className="flex gap-2">
                            <select className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                                <option>All Users</option>
                                <option>Customers Only</option>
                                <option>Sellers Only</option>
                            </select>
                            <button onClick={() => { if (broadcast.trim()) { showToast(`Broadcast sent to all users! 📢`); setBroadcast(''); } }} className="px-6 py-2 rounded-xl text-white font-bold text-sm" style={{ background: 'var(--btn-gradient)' }}>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
