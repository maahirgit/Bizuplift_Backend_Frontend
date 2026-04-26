import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, RotateCcw, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatOrderId } from '../utils/formatters';

const STATUS_STEPS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const OrderTimeline = ({ status }) => {
    const currentIdx = STATUS_STEPS.indexOf(status);
    return (
        <div className="flex items-center gap-1 mt-3">
            {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all ${i <= currentIdx ? 'text-white' : 'bg-gray-200 text-gray-400'}`} style={i <= currentIdx ? { background: 'rgb(var(--color-primary))' } : {}}>
                        {i < currentIdx ? '✓' : i === currentIdx ? '●' : '○'}
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} style={i < currentIdx ? { background: 'rgb(var(--color-primary))' } : {}} />}
                </div>
            ))}
        </div>
    );
};

const Orders = () => {
    const { orders } = useData();
    const { currentUser } = useAuth();
    const { showToast } = useNotifications();
    const [activeTab, setActiveTab] = useState('All');
    const [returnModal, setReturnModal] = useState(null);

    const TABS = ['All', 'Processing', 'Shipped', 'Delivered'];
    const userOrders = orders.filter(o => o.customerId === (currentUser?.id || currentUser?._id));
    const filtered = activeTab === 'All' ? userOrders : userOrders.filter(o => o.status === activeTab);

    const statusColors = { Processing: 'bg-yellow-100 text-yellow-700', Confirmed: 'bg-blue-100 text-blue-700', Shipped: 'bg-purple-100 text-purple-700', 'Out for Delivery': 'bg-orange-100 text-orange-700', Delivered: 'bg-green-100 text-green-700' };

    if (!currentUser) return <div className="container py-20 text-center"><p>Please <Link to="/auth" className="text-primary">sign in</Link> to view orders.</p></div>;

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            <h1 className="text-2xl font-heading font-bold mb-6">My Orders</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === tab ? 'text-white' : 'bg-gray-100 text-gray-600'}`} style={activeTab === tab ? { background: 'rgb(var(--color-primary))' } : {}}>
                        {tab}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                    <Link to="/marketplace" className="px-6 py-3 rounded-full font-bold text-white" style={{ background: 'var(--btn-gradient)' }}>Shop Now</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(order => (
                        <div key={order.id} className="festival-card rounded-2xl p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-mono text-sm font-bold">{formatOrderId(order.id || order._id)}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                                    <span className="font-bold text-sm" style={{ color: 'rgb(var(--color-primary))' }}>₹{order.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="flex gap-2 mb-3 overflow-x-auto">
                                {order.items.map(item => (
                                    <div key={item.productId} className="flex-shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                        <div>
                                            <p className="text-xs font-semibold line-clamp-1 max-w-[120px]">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Timeline */}
                            <OrderTimeline status={order.status} />

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <span className="text-xs text-gray-500 flex items-center gap-1"><Package className="w-3 h-3" /> {order.paymentMethod}</span>
                                {order.status === 'Delivered' && (
                                    <button onClick={() => setReturnModal(order)} className="ml-auto text-xs text-red-500 flex items-center gap-1 hover:underline">
                                        <RotateCcw className="w-3 h-3" /> Return
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Return Modal */}
            {returnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">Return Request</h3>
                            <button onClick={() => setReturnModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Order: <span className="font-mono font-bold">{formatOrderId(returnModal.id || returnModal._id)}</span></p>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-3 outline-none">
                            <option>Select reason</option>
                            <option>Product damaged</option>
                            <option>Wrong item received</option>
                            <option>Quality not as expected</option>
                            <option>Changed my mind</option>
                        </select>
                        <textarea placeholder="Additional details..." rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-4 outline-none resize-none" />
                        <div className="flex gap-2">
                            <button onClick={() => setReturnModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
                            <button onClick={() => { showToast('Return request submitted! We\'ll contact you within 24 hours.'); setReturnModal(null); }} className="flex-1 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'var(--btn-gradient)' }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
