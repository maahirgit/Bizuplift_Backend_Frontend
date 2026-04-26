import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Edit3, Trash2, X, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';

const CATEGORIES = ['Handicrafts', 'Food & Sweets', 'Clothing', 'Decoration', 'Jewelry', 'Candles & Diyas', 'Pottery'];

const SellerDashboard = () => {
    const { currentUser } = useAuth();
    const { products, sellers, orders, addProduct, updateProduct, deleteProduct, updateOrderStatus } = useData();
    const { showToast, addNotification } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab && ['overview', 'products', 'orders'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const [productModal, setProductModal] = useState(null); // null | 'add' | product object
    const [productForm, setProductForm] = useState({ name: '', description: '', category: 'Handicrafts', mrp: '', price: '', minPrice: '', maxDiscount: 20, stock: 10, negotiable: true, images: ['https://picsum.photos/seed/new/400/400'], tags: '' });

    const { updateCurrentUser } = useAuth();
    const { createSellerProfile } = useData();

    if (!currentUser || currentUser.role !== 'seller') { navigate('/auth'); return null; }

    const sellerId = currentUser.sellerId;
    const seller = sellers.find(s => s.id === sellerId);

    // Onboarding State
    const [onboardingForm, setOnboardingForm] = useState({ business: '', category: 'Handicrafts', city: '', state: '', story: '' });

    if (!seller) {
        const handleOnboarding = (e) => {
            e.preventDefault();
            if (!onboardingForm.business || !onboardingForm.city) { showToast('Please fill all required fields', 'error'); return; }

            const newSellerId = createSellerProfile({
                ...onboardingForm,
                name: currentUser.name,
                email: currentUser.email,
                avatar: currentUser.avatar
            });

            updateCurrentUser({ sellerId: newSellerId });
            showToast('Seller profile created! Welcome aboard 🎉');
        };

        return (
            <div className="container py-10 max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold mb-2">Welcome, {currentUser.name}! 👋</h1>
                    <p className="text-gray-500">Let's set up your seller profile to start selling on BizUplift.</p>
                </div>

                <div className="festival-card rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleOnboarding} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Business Name *</label>
                            <input value={onboardingForm.business} onChange={e => setOnboardingForm({ ...onboardingForm, business: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" placeholder="e.g. ArtyCrafty" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Primary Category *</label>
                            <select value={onboardingForm.category} onChange={e => setOnboardingForm({ ...onboardingForm, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">City *</label>
                                <input value={onboardingForm.city} onChange={e => setOnboardingForm({ ...onboardingForm, city: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" placeholder="City" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">State *</label>
                                <input value={onboardingForm.state} onChange={e => setOnboardingForm({ ...onboardingForm, state: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" placeholder="State" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Your Story (Bio)</label>
                            <textarea value={onboardingForm.story} onChange={e => setOnboardingForm({ ...onboardingForm, story: e.target.value })}
                                rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary resize-none"
                                placeholder="Tell customers about your craft and journey..." />
                        </div>

                        <button type="submit" className="w-full py-3 rounded-xl text-white font-bold mt-4" style={{ background: 'var(--btn-gradient)' }}>
                            Create Seller Profile
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const sellerProducts = products.filter(p => p.sellerId === sellerId);
    const sellerOrders = orders.filter(o => o.items.some(i => sellerProducts.find(p => p.id === i.productId)));

    // Revenue data for overview chart
    const monthlyRevenue = useMemo(() => {
        const result = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result.push({
                month: d.toLocaleString('en-US', { month: 'short' }),
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
                revenue: 0,
                orders: 0
            });
        }
        sellerOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const bucket = result.find(r => r.monthIndex === orderDate.getMonth() && r.year === orderDate.getFullYear());
            if (bucket) {
                const orderRevenue = order.items.reduce((sum, item) => {
                    const isMyProduct = sellerProducts.find(p => p.id === item.productId || p._id === item.productId);
                    return isMyProduct ? sum + ((item.price || 0) * (item.quantity || 1)) : sum;
                }, 0);
                if (orderRevenue > 0) {
                    bucket.orders += 1;
                    bucket.revenue += orderRevenue;
                }
            }
        });
        return result;
    }, [sellerOrders, sellerProducts]);

    const actualTotalRevenue = useMemo(() => {
        return sellerOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => {
                const isMyProduct = sellerProducts.find(p => p.id === item.productId || p._id === item.productId);
                return isMyProduct ? itemSum + ((item.price || 0) * (item.quantity || 1)) : itemSum;
            }, 0);
        }, 0);
    }, [sellerOrders, sellerProducts]);

    const stats = [
        { label: 'Total Products', value: sellerProducts.length, icon: '📦', color: '#E85D04' },
        { label: 'Total Orders', value: sellerOrders.length, icon: '🛒', color: '#7C3AED' },
        { label: 'Total Revenue', value: `₹${actualTotalRevenue.toLocaleString()}`, icon: '💰', color: '#06D6A0' },
        { label: 'Avg Rating', value: seller?.rating || 'N/A', icon: '⭐', color: '#FFD700' },
    ];

    const handleProductSave = () => {
        if (!productForm.name || !productForm.price) { showToast('Name and price are required', 'error'); return; }
        const data = { ...productForm, mrp: +productForm.mrp, price: +productForm.price, minPrice: +productForm.minPrice || Math.floor(+productForm.price * 0.8), sellerId, sellerName: seller.business, tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean) };
        if (productModal === 'add') { addProduct(data); showToast('Product added! 🎉'); }
        else { updateProduct(productModal.id, data); showToast('Product updated!'); }
        setProductModal(null);
    };

    const handleReturnAction = async (order, newStatus) => {
        try {
            await updateOrderStatus(order.id || order._id, newStatus);
            
            // Notify the buyer
            const buyerId = typeof order.customerId === 'object' ? (order.customerId.id || order.customerId._id) : order.customerId;
            addNotification(buyerId, {
                title: newStatus === 'Returned' ? 'Return Request Accepted' : 'Return Request Rejected',
                body: newStatus === 'Returned' 
                    ? `Seller ${seller?.business} has accepted your return for Order ${order.id || order._id}. Refund will be processed soon.`
                    : `Seller ${seller?.business} has rejected your return for Order ${order.id || order._id}.`,
                type: 'order'
            });

            showToast(`Return ${newStatus === 'Returned' ? 'accepted' : 'rejected'} successfully!`);
        } catch (err) {
            showToast('Failed to update return status', 'error');
        }
    };

    const TABS = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'products', label: '📦 Products' },
        { id: 'orders', label: '🛒 Orders' },
    ];

    const ProductFormModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{productModal === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
                    <button onClick={() => setProductModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="space-y-3">
                    <input value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                    <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none resize-none" />
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Category</label>
                            <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[['MRP (₹)', 'mrp'], ['Selling Price (₹)', 'price'], ['Min Price (₹)', 'minPrice']].map(([label, key]) => (
                            <div key={key}>
                                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                                <input type="number" value={productForm[key]} onChange={e => setProductForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                            <input type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: +e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={productForm.negotiable} onChange={e => setProductForm(f => ({ ...f, negotiable: e.target.checked }))} className="accent-primary" />
                                <span className="text-sm">Negotiable</span>
                            </label>
                        </div>
                    </div>
                    <input value={productForm.tags} onChange={e => setProductForm(f => ({ ...f, tags: e.target.value }))} placeholder="Tags (comma separated): diwali, handmade, gift" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={() => setProductModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
                    <button onClick={handleProductSave} className="flex-1 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'var(--btn-gradient)' }}>
                        {productModal === 'add' ? 'Add Product' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <img src={currentUser.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-4" style={{ borderColor: 'rgb(var(--color-primary))' }} />
                <div>
                    <h1 className="text-xl font-heading font-bold">{seller?.business || currentUser.name}</h1>
                    <p className="text-sm text-gray-500">{seller?.city} · {seller?.verified ? '✓ Verified Seller' : 'Pending Verification'}</p>
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
                            <div key={stat.label} className="festival-card rounded-2xl p-4 text-center">
                                <div className="text-3xl mb-1">{stat.icon}</div>
                                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="festival-card rounded-2xl p-5">
                        <h3 className="font-bold mb-4">Revenue (Last 6 Months)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="rgb(var(--color-primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">My Products ({sellerProducts.length})</h3>
                        <button onClick={() => { setProductForm({ name: '', description: '', category: 'Handicrafts', mrp: '', price: '', minPrice: '', maxDiscount: 20, stock: 10, negotiable: true, images: ['https://picsum.photos/seed/new/400/400'], tags: '' }); setProductModal('add'); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'var(--btn-gradient)' }}>
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                    <div className="space-y-3">
                        {sellerProducts.map(product => (
                            <div key={product.id} className="festival-card rounded-xl p-4 flex items-center gap-4">
                                <img src={product.images[0]} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold" style={{ color: 'rgb(var(--color-primary))' }}>₹{product.price}</span>
                                        <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                                        <span className="text-xs text-gray-500">⭐ {product.rating}</span>
                                        {product.negotiable && <span className="text-xs text-green-600">🤝 Negotiable</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setProductForm({ ...product, tags: product.tags.join(', ') }); setProductModal(product); }} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit3 className="w-4 h-4" /></button>
                                    <button onClick={() => { if (confirm('Delete this product?')) { deleteProduct(product.id); showToast('Product deleted'); } }} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
                <div>
                    <h3 className="font-bold mb-4">Orders ({sellerOrders.length})</h3>
                    {sellerOrders.length === 0 ? <p className="text-center py-10 text-gray-500">No orders yet</p> : sellerOrders.map(order => (
                        <div key={order.id} className="festival-card rounded-xl p-4 mb-3">
                            <div className="flex justify-between mb-2">
                                <span className="font-mono text-sm font-bold">{order.id}</span>
                                <span className="font-bold" style={{ color: 'rgb(var(--color-primary))' }}>₹{order.total}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                {order.items.map(item => <img key={item.productId} src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                                <div className="flex items-center gap-2">
                                    {order.status === 'Return Requested' ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleReturnAction(order, 'Returned')}
                                                className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-all shadow-sm"
                                            >
                                                Accept Return
                                            </button>
                                            <button 
                                                onClick={() => handleReturnAction(order, 'Return Rejected')}
                                                className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all shadow-sm"
                                            >
                                                Reject Return
                                            </button>
                                        </div>
                                    ) : (
                                        <select value={order.status} onChange={e => { updateOrderStatus(order.id, e.target.value); showToast('Order status updated!'); }} className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white">
                                            {['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Return Rejected'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {productModal && <ProductFormModal />}
        </div>
    );
};

export default SellerDashboard;
