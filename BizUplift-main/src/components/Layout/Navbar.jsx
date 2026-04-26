import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Bell, Home, Store, Heart, MessageCircle, ChevronDown, LogOut, Package, Star, Settings } from 'lucide-react';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { useData } from '../../context/DataContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { theme } = useTheme();
    const { currentUser, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const { getUserNotifications, getUnreadCount, markAllRead } = useNotifications();
    const { products } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);
    const notifRef = useRef(null);

    const isDiwali = theme === 'diwali';
    const navBg = isDiwali ? 'rgba(13,2,33,0.97)' : 'rgba(255,255,255,0.92)';
    const navBorder = isDiwali ? 'rgba(255,215,0,0.2)' : 'rgba(229,231,235,1)';
    const textColor = isDiwali ? '#FFF8E7' : '#1F2937';
    const mutedColor = isDiwali ? 'rgba(255,248,231,0.6)' : '#6B7280';

    const notifications = currentUser ? getUserNotifications(currentUser.id) : [];
    const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;

    // Search suggestions
    const searchResults = searchQuery.length > 1
        ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false); setUserMenuOpen(false); } };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    useEffect(() => { setIsMenuOpen(false); setSearchOpen(false); }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) { navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery(''); }
    };

    const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };

    const getDashboardLink = () => {
        if (!currentUser) return '/auth';
        if (currentUser.role === 'admin') return '/dashboard/admin';
        if (currentUser.role === 'seller') return '/dashboard/seller';
        return '/dashboard/customer';
    };

    let navLinks = [];
    if (isAuthenticated) {
        if (currentUser?.role === 'seller') {
            navLinks = [
                { to: '/', label: 'Home' },
                { to: '/marketplace', label: 'Marketplace' },
                { to: '/seller-analytics', label: 'Analytics' },
                { to: '/seller-subscription', label: 'Subscriptions' },
                { to: '/community', label: 'Community' },
                { to: '/collaborate', label: 'Collaborate' },
            ];
        } else {
            navLinks = [
                { to: '/', label: 'Home' },
                { to: '/marketplace', label: 'Marketplace' },
                { to: '/festivals', label: 'Festivals' },
                { to: '/hamper', label: 'Hampers' },
                { to: '/community', label: 'Community' },
                { to: '/collaborate', label: 'Collaborate' },
            ];
        }
    }

    return (
        <>
            {/* Search Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
                    <div className="max-w-2xl mx-auto mt-20 px-4" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                ref={searchRef}
                                autoFocus
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products, sellers, festivals..."
                                className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-primary/30 focus:border-primary outline-none shadow-2xl font-body"
                                style={{ background: isDiwali ? '#1a0a3a' : 'white', color: textColor }}
                            />
                            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Search className="w-6 h-6 text-primary" />
                            </button>
                        </form>
                        {searchResults.length > 0 && (
                            <div className="mt-2 rounded-xl shadow-2xl overflow-hidden" style={{ background: isDiwali ? '#1a0a3a' : 'white' }}>
                                {searchResults.map(p => (
                                    <button key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchOpen(false); setSearchQuery(''); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 text-left transition-colors">
                                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: textColor }}>{p.name}</p>
                                            <p className="text-xs" style={{ color: mutedColor }}>₹{p.price} · {p.sellerName}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <nav className="sticky top-0 z-50 backdrop-blur-md border-b shadow-sm" style={{ background: navBg, borderColor: navBorder }}>
                <div className="container flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xl">🛍️</span>
                        <span className="text-xl font-bold font-heading" style={{ background: 'var(--heading-gradient)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            BizUplift
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to}
                                className="text-sm font-medium transition-colors hover:text-primary"
                                style={{ color: location.pathname === link.to ? 'rgb(var(--color-primary))' : mutedColor }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search & Cart */}
                        {isAuthenticated && (
                            <>
                                <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" style={{ color: mutedColor }}>
                                    <Search className="w-5 h-5" />
                                </button>
                                {currentUser?.role === 'customer' && (
                                    <Link to="/cart" className="relative p-2 rounded-lg hover:bg-primary/10 transition-colors" style={{ color: mutedColor }}>
                                        <ShoppingBag className="w-5 h-5" />
                                        {itemCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: 'rgb(var(--color-primary))' }}>
                                                {itemCount > 9 ? '9+' : itemCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </>
                        )}

                        {/* Notifications */}
                        {isAuthenticated && (
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }} className="relative p-2 rounded-lg hover:bg-primary/10 transition-colors" style={{ color: mutedColor }}>
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white bg-red-500">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50" style={{ background: isDiwali ? '#1a0a3a' : 'white', borderColor: navBorder }}>
                                        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: navBorder }}>
                                            <h3 className="font-semibold text-sm" style={{ color: textColor }}>Notifications</h3>
                                            <button onClick={() => markAllRead(currentUser.id)} className="text-xs text-primary hover:underline">Mark all read</button>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <p className="text-center py-6 text-sm" style={{ color: mutedColor }}>No notifications</p>
                                            ) : notifications.slice(0, 6).map(n => (
                                                <div key={n.id} className={`px-4 py-3 border-b transition-colors ${!n.read ? 'bg-primary/5' : ''}`} style={{ borderColor: navBorder }}>
                                                    <p className="text-sm font-semibold" style={{ color: textColor }}>{n.title}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: mutedColor }}>{n.body}</p>
                                                    <p className="text-xs mt-1 opacity-50" style={{ color: mutedColor }}>{new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-colors">
                                    <img src={currentUser.avatar || `https://i.pravatar.cc/40?u=${currentUser.id}`} alt="" className="w-7 h-7 rounded-full object-cover" />
                                    <span className="hidden md:block text-sm font-semibold" style={{ color: textColor }}>{currentUser.name.split(' ')[0]}</span>
                                    <ChevronDown className="w-3 h-3 hidden md:block" style={{ color: mutedColor }} />
                                </button>
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl border overflow-hidden z-50" style={{ background: isDiwali ? '#1a0a3a' : 'white', borderColor: navBorder }}>
                                        <div className="px-4 py-3 border-b" style={{ borderColor: navBorder }}>
                                            <p className="text-sm font-bold" style={{ color: textColor }}>{currentUser.name}</p>
                                            <p className="text-xs" style={{ color: mutedColor }}>{currentUser.email}</p>
                                        </div>
                                        {[
                                            { to: getDashboardLink(), icon: <Settings className="w-4 h-4" />, label: 'Dashboard' },
                                            { to: '/orders', icon: <Package className="w-4 h-4" />, label: 'My Orders', hideFor: ['seller', 'admin'] },
                                            { to: '/wishlist', icon: <Heart className="w-4 h-4" />, label: 'Wishlist', hideFor: ['seller', 'admin'] },
                                            { to: '/credits', icon: <Star className="w-4 h-4" />, label: 'Credit Points', hideFor: ['seller', 'admin'] },
                                        ].filter(item => !item.hideFor?.includes(currentUser.role)).map(item => (
                                            <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors" style={{ color: textColor }}>
                                                {item.icon} {item.label}
                                            </Link>
                                        ))}
                                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full border-t" style={{ borderColor: navBorder }}>
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/auth" className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full text-white transition-all hover:opacity-90 hover:scale-105" style={{ background: 'var(--btn-gradient)' }}>
                                <User className="w-4 h-4" /> Sign In
                            </Link>
                        )}

                        {/* Mobile hamburger */}
                        {isAuthenticated && (
                            <button className="lg:hidden p-2 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ color: textColor }}>
                                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t p-4 flex flex-col gap-2" style={{ background: navBg, borderColor: navBorder }}>
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} className="py-2.5 px-3 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10" style={{ color: textColor }}>
                                {link.label}
                            </Link>
                        ))}
                        <hr style={{ borderColor: navBorder }} />
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="py-2.5 px-3 text-sm font-medium text-red-500 text-left">Sign Out</button>
                        ) : (
                            <Link to="/auth" className="py-3 text-center text-sm font-bold rounded-xl text-white" style={{ background: 'var(--btn-gradient)' }}>Sign In</Link>
                        )}
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Navigation */}
            {isAuthenticated && (
                <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t shadow-lg" style={{ background: navBg, borderColor: navBorder }}>
                    <div className="flex items-center justify-around py-2">
                        {[
                            { to: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
                            { to: '/marketplace', icon: <Store className="w-5 h-5" />, label: 'Shop' },
                            { to: '/cart', icon: <ShoppingBag className="w-5 h-5" />, label: 'Cart', badge: itemCount },
                            { to: '/community', icon: <MessageCircle className="w-5 h-5" />, label: 'Community' },
                            { to: getDashboardLink(), icon: <User className="w-5 h-5" />, label: 'Profile' },
                        ].map(item => (
                            <Link key={item.to} to={item.to} className="flex flex-col items-center gap-0.5 relative px-3 py-1 rounded-lg transition-colors"
                                style={{ color: location.pathname === item.to ? 'rgb(var(--color-primary))' : mutedColor }}>
                                {item.icon}
                                <span className="text-[10px] font-medium">{item.label}</span>
                                {item.badge > 0 && (
                                    <span className="absolute -top-0.5 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: 'rgb(var(--color-primary))' }}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
