
import { useState } from 'react';
import { Package, User, Heart, Settings, LayoutDashboard, BarChart2 } from 'lucide-react';

const Dashboards = () => {
    const [userType, setUserType] = useState('customer'); // toggle for demo
    const [activeTab, setActiveTab] = useState('overview');

    const customerTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'orders', label: 'My Orders', icon: Package },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const sellerTabs = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'My Products', icon: Package },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const tabs = userType === 'customer' ? customerTabs : sellerTabs;

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-heading font-bold">My Dashboard</h1>
                {/* Demo Toggle */}
                <div className="bg-gray-100 p-1 rounded-lg flex text-xs">
                    <button
                        className={`px-3 py-1 rounded transition ${userType === 'customer' ? 'bg-white shadow' : ''}`}
                        onClick={() => setUserType('customer')}
                    >Customer</button>
                    <button
                        className={`px-3 py-1 rounded transition ${userType === 'seller' ? 'bg-white shadow' : ''}`}
                        onClick={() => setUserType('seller')}
                    >Seller</button>
                    <button
                        className={`px-3 py-1 rounded transition ${userType === 'admin' ? 'bg-white shadow' : ''}`}
                        onClick={() => setUserType('admin')}
                    >Admin</button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit">
                    <div className="flex items-center gap-3 mb-6 p-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {userType === 'customer' ? 'JD' : 'AC'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{userType === 'customer' ? 'John Doe' : 'Artisan Crafters'}</p>
                            <p className="text-xs text-gray-500 capitalize">{userType}</p>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                    <h2 className="text-xl font-bold mb-6 capitalize">{activeTab}</h2>
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                        <p>No data to display currently.</p>
                        <p className="text-sm">Start exploring to see activity here.</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboards;
