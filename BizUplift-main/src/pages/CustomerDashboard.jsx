import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, Star, MapPin, Edit3, Check, X, Camera, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';

const CustomerDashboard = () => {
    const { currentUser, updateCurrentUser, logout } = useAuth();
    const { orders, getUserCredits, wishlists, updateOrderStatus, products } = useData();
    const { showToast, addNotification } = useNotifications();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', mobile: currentUser?.mobile || '' });
    const [addresses, setAddresses] = useState(() => {
        const saved = localStorage.getItem('user_addresses');
        return saved ? JSON.parse(saved) : [
            { id: 'a1', label: 'Home', name: currentUser?.name, line1: '42, Shanti Nagar', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: currentUser?.mobile, isDefault: true },
        ];
    });
    const [userCredits, setUserCredits] = useState({ balance: 0, transactions: [] });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: '', name: '', line1: '', city: '', state: '', pincode: '', phone: '' });

    useEffect(() => {
        localStorage.setItem('user_addresses', JSON.stringify(addresses));
    }, [addresses]);

    const handleAddAddress = () => {
        if (!newAddress.label || !newAddress.name || !newAddress.line1) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        setAddresses(prev => [...prev, { ...newAddress, id: Date.now().toString() }]);
        setNewAddress({ label: '', name: '', line1: '', city: '', state: '', pincode: '', phone: '' });
        setShowAddressForm(false);
        showToast('Address added successfully!');
    };

    const handleRequestReturn = async (order) => {
        try {
            await updateOrderStatus(order.id || order._id, 'Return Requested');
            
            // Notify each seller involved in the order
            const sellerIds = new Set();
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId || p._id === item.productId);
                if (product?.sellerId) sellerIds.add(product.sellerId);
            });

            sellerIds.forEach(sellerId => {
                addNotification(sellerId, {
                    title: 'New Return Request',
                    body: `Customer ${currentUser.name} has requested a return for Order ${order.id || order._id}.`,
                    type: 'order'
                });
            });

            showToast('Return request sent to seller(s) 🎉');
        } catch (err) {
            showToast('Failed to request return', 'error');
        }
    };

    useEffect(() => {
        if (currentUser) {
            getUserCredits(currentUser.id).then(data => {
                if (data) {
                    setUserCredits({ 
                        balance: data.balance || 0, 
                        transactions: data.transactions || [] 
                    });
                }
            }).catch(() => {
                setUserCredits({ balance: 0, transactions: [] });
            });
        }
    }, [currentUser, getUserCredits]);

    if (!currentUser) { navigate('/auth'); return null; }

    const userOrders = orders.filter(o => o.customerId === (currentUser.id || currentUser._id));
    const wishlistCount = (wishlists.current || []).length;

    const stats = [
        { label: 'Total Orders', value: userOrders.length, icon: '📦', color: '#E85D04' },
        { label: 'Credit Points', value: userCredits.balance, icon: '⭐', color: '#FFD700' },
        { label: 'Wishlist Items', value: wishlistCount, icon: '❤️', color: '#FF006E' },
        { label: 'Total Spent', value: `₹${userOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, icon: '💰', color: '#06D6A0' },
    ];

    const handleSaveProfile = () => {
        updateCurrentUser(profileForm);
        setEditMode(false);
        showToast('Profile updated successfully!');
    };

    const TABS = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'orders', label: 'Orders', icon: '📦' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'addresses', label: 'Addresses', icon: '📍' },
        { id: 'credits', label: 'Credits', icon: '⭐' },
    ];

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <img src={currentUser.avatar || `https://i.pravatar.cc/80?u=${currentUser.id}`} alt="" className="w-16 h-16 rounded-full object-cover border-4" style={{ borderColor: 'rgb(var(--color-primary))' }} />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div>
                    <h1 className="text-xl font-heading font-bold">Welcome back, {currentUser.name.split(' ')[0]}! 👋</h1>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto mb-6">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === tab.id ? 'text-white' : 'bg-gray-100 text-gray-600'}`} style={activeTab === tab.id ? { background: 'rgb(var(--color-primary))' } : {}}>
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="festival-card rounded-2xl p-4 text-center">
                                <div className="text-3xl mb-1">{stat.icon}</div>
                                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold mb-3">Recent Orders</h3>
                        {userOrders.slice(0, 3).map(order => (
                            <div key={order.id} className="festival-card rounded-xl p-4 mb-2 flex items-center justify-between">
                                <div>
                                    <p className="font-mono text-sm font-bold">{order.id}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                                    <span className="font-bold text-sm" style={{ color: 'rgb(var(--color-primary))' }}>₹{order.total}</span>
                                </div>
                            </div>
                        ))}
                        <Link to="/orders" className="text-sm font-semibold" style={{ color: 'rgb(var(--color-primary))' }}>View all orders →</Link>
                    </div>
                </div>
            )}

            {/* Orders tab */}
            {activeTab === 'orders' && (
                <div>
                    {userOrders.length === 0 ? <p className="text-center py-10 text-gray-500">No orders yet</p> : userOrders.map(order => (
                        <div key={order.id} className="festival-card rounded-2xl p-4 mb-3">
                            <div className="flex justify-between mb-2">
                                <span className="font-mono text-sm font-bold">{order.id}</span>
                                <span className="font-bold" style={{ color: 'rgb(var(--color-primary))' }}>₹{order.total}</span>
                            </div>
                            <div className="flex gap-2 mb-2">
                                {order.items.map(item => <img key={item.productId} src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />)}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`font-bold ${order.status === 'Delivered' ? 'text-green-600' : order.status === 'Return Requested' ? 'text-orange-500' : 'text-yellow-600'}`}>{order.status}</span>
                                    {order.status === 'Delivered' && (
                                        <button 
                                            onClick={() => handleRequestReturn(order)}
                                            className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline px-2 py-1 bg-red-50 rounded-lg"
                                        >
                                            Request Return
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Profile tab */}
            {activeTab === 'profile' && (
                <div className="festival-card rounded-2xl p-6 max-w-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Personal Information</h3>
                        <button onClick={() => editMode ? handleSaveProfile() : setEditMode(true)} className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'rgb(var(--color-primary))' }}>
                            {editMode ? <><Check className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
                        </button>
                    </div>
                    <div className="space-y-4">
                        {[['Full Name', 'name'], ['Email', 'email'], ['Mobile', 'mobile']].map(([label, key]) => (
                            <div key={key}>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                                {editMode ? (
                                    <input value={profileForm[key]} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
                                ) : (
                                    <p className="text-sm font-medium">{currentUser[key]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Addresses tab */}
            {activeTab === 'addresses' && (
                <div className="space-y-6 max-w-lg">
                    {addresses.map(addr => (
                        <div key={addr.id} className="festival-card rounded-2xl p-6 relative group border border-gray-100 hover:border-primary/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="font-bold text-sm uppercase tracking-wider">{addr.label}</span>
                                </div>
                                {addr.isDefault && <span className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold border border-green-100">Default</span>}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-gray-800">{addr.name}</p>
                                <p className="text-sm text-gray-500 leading-relaxed">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="text-xs font-semibold text-gray-400 mt-2 flex items-center gap-1">
                                    <span className="text-gray-300">📞</span> {addr.phone}
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}
                                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    
                    {!showAddressForm ? (
                        <button 
                            onClick={() => setShowAddressForm(true)}
                            className="w-full py-6 rounded-[1.5rem] border-2 border-dashed border-gray-200 text-sm font-bold text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/[0.02] transition-all flex flex-col items-center gap-2"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            Add New Address
                        </button>
                    ) : (
                        <div className="festival-card rounded-[1.5rem] p-6 animate-fade-in border-2 border-primary/20">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary" />
                                New Address Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Address Label (e.g. Home, Office)</label>
                                    <input autoFocus value={newAddress.label} onChange={e => setNewAddress(a => ({ ...a, label: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="Home" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Full Name</label>
                                    <input value={newAddress.name} onChange={e => setNewAddress(a => ({ ...a, name: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="Receiver's name" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Address Line 1</label>
                                    <input value={newAddress.line1} onChange={e => setNewAddress(a => ({ ...a, line1: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="House No, Street, Area" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">City</label>
                                    <input value={newAddress.city} onChange={e => setNewAddress(a => ({ ...a, city: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="Mumbai" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">State</label>
                                    <input value={newAddress.state} onChange={e => setNewAddress(a => ({ ...a, state: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="Maharashtra" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Pincode</label>
                                    <input value={newAddress.pincode} onChange={e => setNewAddress(a => ({ ...a, pincode: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="400001" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Phone</label>
                                    <input value={newAddress.phone} onChange={e => setNewAddress(a => ({ ...a, phone: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-primary transition-colors" placeholder="10-digit mobile" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddressForm(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-all">Cancel</button>
                                <button onClick={handleAddAddress} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: 'rgb(var(--color-primary))' }}>Save Address</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Credits tab */}
            {activeTab === 'credits' && (
                <div className="max-w-2xl animate-fade-in">
                    <div className="relative overflow-hidden rounded-[2rem] p-8 mb-8 text-white shadow-2xl border border-white/10" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #E85D04 100%)' }}>
                        {/* Background Decoration */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <p className="text-white/80 font-medium mb-1 tracking-wide uppercase text-xs">Total Balance</p>
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="text-5xl font-black tracking-tight">{userCredits.balance}</span>
                                    <Star className="w-8 h-8 fill-white/30 text-white/50" />
                                </div>
                                <p className="text-white/60 text-sm mt-2 font-medium">Approximate Value: <span className="text-white">₹{userCredits.balance}</span></p>
                            </div>
                            <div className="h-px w-full md:h-16 md:w-px bg-white/20" />
                            <div className="text-center md:text-left">
                                <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Earned Today</p>
                                <p className="text-3xl font-black">+0</p>
                            </div>
                        </div>
                    </div>

                    <div className="festival-card rounded-[1.5rem] p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Recent Transactions
                            </h3>
                            <Link to="/credits" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">View All</Link>
                        </div>
                        
                        <div className="space-y-1">
                            {userCredits.transactions?.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-4xl mb-3 opacity-20">📜</div>
                                    <p className="text-gray-400 text-sm italic">No transactions yet. Start shopping to earn points!</p>
                                </div>
                            ) : userCredits.transactions.slice(0, 5).map((tx, idx) => (
                                <div key={tx.id || idx} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${tx.type === 'earn' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                            {tx.type === 'earn' ? '✨' : '💸'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">{tx.action}</p>
                                            <p className="text-[10px] font-medium text-gray-400 mt-0.5">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-black text-sm ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.type === 'earn' ? '+' : '-'}{tx.points}
                                        </span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">Points</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
