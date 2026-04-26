import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const CHART_COLORS = ['#E85D04', '#FFD700', '#06D6A0', '#7C3AED', '#FF006E'];

const SellerAnalytics = () => {
    const { currentUser } = useAuth();
    const { products, sellers, orders } = useData();
    const navigate = useNavigate();

    if (!currentUser || currentUser.role !== 'seller') { navigate('/auth'); return null; }

    const sellerId = currentUser.sellerId;
    const seller = sellers.find(s => s.id === sellerId);

    if (!seller) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-heading font-bold mb-2">Complete your seller profile first</h1>
                <p className="text-gray-500 mb-4">You need a seller profile to view analytics.</p>
                <button onClick={() => navigate('/dashboard/seller')} className="px-6 py-3 rounded-xl text-white font-bold" style={{ background: 'var(--btn-gradient)' }}>
                    Go to Dashboard
                </button>
            </div>
        );
    }

    const sellerProducts = products.filter(p => p.sellerId === sellerId);
    const sellerOrders = orders.filter(o => o.items.some(i => sellerProducts.find(p => p.id === i.productId)));

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

    const categoryData = useMemo(() => {
        const cats = {};
        sellerProducts.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
        return Object.entries(cats).map(([name, value]) => ({ name, value }));
    }, [sellerProducts]);

    const stats = [
        { label: 'Total Products', value: sellerProducts.length, icon: <Package className="w-6 h-6" />, color: '#E85D04' },
        { label: 'Total Orders', value: sellerOrders.length, icon: <ShoppingCart className="w-6 h-6" />, color: '#7C3AED' },
        { label: 'Total Revenue', value: `₹${actualTotalRevenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: '#06D6A0' },
        { label: 'Avg Rating', value: seller?.rating || 'N/A', icon: <TrendingUp className="w-6 h-6" />, color: '#FFD700' },
    ];

    return (
        <div className="container py-8 pb-20 lg:pb-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold mb-2">📈 Seller Analytics</h1>
                <p className="text-gray-500">Track your performance, revenue trends, and product insights.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(stat => (
                    <div key={stat.label} className="festival-card rounded-2xl p-5 text-center">
                        <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
                        <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="festival-card rounded-2xl p-5">
                        <h3 className="font-bold mb-4">Orders Trend</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="orders" stroke="rgb(var(--color-primary))" strokeWidth={3} dot={{ fill: 'rgb(var(--color-primary))', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="festival-card rounded-2xl p-5">
                        <h3 className="font-bold mb-4">Revenue Growth</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={monthlyRevenue}>
                                <defs>
                                    <linearGradient id="colorRevAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                                <Area type="monotone" dataKey="revenue" stroke="#06D6A0" strokeWidth={3} fillOpacity={1} fill="url(#colorRevAnalytics)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Bar Chart */}
                <div className="festival-card rounded-2xl p-5">
                    <h3 className="font-bold mb-4">Monthly Revenue Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                            <Bar dataKey="revenue" fill="rgb(var(--color-primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {categoryData.length > 0 && (
                    <div className="festival-card rounded-2xl p-5 max-w-2xl mx-auto w-full">
                        <h3 className="font-bold mb-4 text-center">Products by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={70} outerRadius={90} paddingAngle={2}>
                                    {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value) => [value, 'Products']} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerAnalytics;
