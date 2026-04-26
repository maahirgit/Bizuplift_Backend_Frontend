import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Users, ChevronRight, ChevronLeft, Clock, Calendar, TrendingUp, Heart, Package, Shield, Gift, Lock } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import SellerCard from '../components/UI/SellerCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useTheme, THEMES, FESTIVAL_CALENDAR, getNextFestival, FESTIVAL_PALETTES } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const getNextDate = (mmdd) => {
    const [month, day] = mmdd.split('-').map(Number);
    const now = new Date();
    const y = now.getFullYear();
    let d = new Date(y, month - 1, day);
    if (d < now) d = new Date(y + 1, month - 1, day);
    return d;
};

const Countdown = ({ targetDate, size = 'lg' }) => {
    const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
    useEffect(() => {
        const tick = () => {
            const diff = Math.max(0, targetDate - Date.now());
            setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    const isLarge = size === 'lg';

    return (
        <div className="flex items-center gap-4 perspective-container">
            {[['d', 'Days'], ['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']].map(([k, label], i) => (
                <div key={k} className="flex items-center gap-4">
                    <div className="group relative" style={{ perspective: '1000px' }}>
                        <div className={`
                            relative ${isLarge ? 'w-20 h-24 text-3xl' : 'w-14 h-16 text-xl'} 
                            flex flex-col items-center justify-center rounded-xl transition-transform duration-500 transform-style-3d group-hover:rotate-x-12
                         `}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                                transform: 'rotateX(5deg)',
                            }}>
                            {/* Inner glossy highlight */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none" />

                            <div className="font-bold font-heading tabular-nums text-white drop-shadow-md z-10">
                                {String(time[k]).padStart(2, '0')}
                            </div>
                            <div className="text-[9px] uppercase tracking-widest text-white/70 font-bold mt-1 z-10">{label}</div>

                            {/* 3D Reflection at bottom */}
                            <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-t from-transparent to-white/10 blur-md transform rotateX(180deg) opacity-40" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const FloatingTag = ({ children, style, className = '' }) => (
    <div className={`absolute px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${className}`}
        style={{ ...style, backdropFilter: 'blur(12px)' }}>
        {children}
    </div>
);

// Extracted to src/components/UI/ ProductCard and SellerCard

const CATEGORY_TAGS = [
    { label: 'Gifts', emoji: '🎁' },
    { label: 'Home Decor', emoji: '🏠' },
    { label: 'Sweets', emoji: '🍬' },
    { label: 'Dry Fruits', emoji: '🥜' },
    { label: 'Hampers', emoji: '🧺' },
    { label: 'Festive Fashion', emoji: '👗' },
];

const Home = () => {
    const { theme } = useTheme();
    const { products, sellers, posts, isWishlisted, toggleWishlist, isDataLoading } = useData();
    const { isAuthenticated, currentUser } = useAuth();
    const navigate = useNavigate();
    const heroRef = useRef(null);

    const sortedFestivals = useMemo(() => getNextFestival(), []);
    const [activeFestivalIdx, setActiveFestivalIdx] = useState(0);
    const [visibleSections, setVisibleSections] = useState(new Set());

    const heroFestival = sortedFestivals[activeFestivalIdx] || sortedFestivals[0] || FESTIVAL_CALENDAR[0];
    const heroDate = useMemo(() => heroFestival.nextDate || getNextDate(heroFestival.date), [heroFestival]);
    const palette = FESTIVAL_PALETTES[theme] || FESTIVAL_PALETTES.default;

    const featuredProducts = products.filter(p => p.featured).slice(0, 8);
    const trendingProducts = products.slice(0, 8);
    const featuredSellers = sellers.slice(0, 4);
    const recentPosts = posts.slice(0, 3);

    useEffect(() => {
        if (isDataLoading) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setVisibleSections(prev => new Set([...prev, entry.target.id]));
                    }
                });
            },
            { threshold: 0.12 }
        );
        document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [isDataLoading]);

    const stats = useMemo(() => ({
        totalProducts: products.length,
        totalSellers: sellers.length,
        totalOrders: sellers.reduce((s, v) => s + v.totalOrders, 0),
    }), [products, sellers]);

    if (isDataLoading) {
        return <LoadingSpinner fullPage />;
    }

    const navigateFestival = (dir) => {
        setActiveFestivalIdx(prev => {
            const next = prev + dir;
            if (next < 0) return sortedFestivals.length - 1;
            if (next >= sortedFestivals.length) return 0;
            return next;
        });
    };

    return (
        <div className="pb-16 lg:pb-0">

            {/* ═══════════════════════════════════════════════
                SECTION 1 — "Celebrate the Soul of India"
               ═══════════════════════════════════════════════ */}
            <section ref={heroRef} className="relative min-h-[80vh] flex items-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FFF5EB 0%, #FFE4CC 25%, #FFDAB3 50%, #FFB980 75%, #F5A461 100%)' }}>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full opacity-30"
                        style={{ background: 'radial-gradient(circle, #FFD4A8, transparent)', filter: 'blur(60px)' }} />
                    <div className="absolute bottom-10 right-[20%] w-60 h-60 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, #FF9A5C, transparent)', filter: 'blur(50px)' }} />
                </div>

                <div className="container relative z-10 py-12 md:py-20">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">

                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest"
                                style={{ background: 'rgba(180, 100, 30, 0.1)', color: '#9A5B2F', border: '1px solid rgba(180, 100, 30, 0.15)' }}>
                                <Star className="w-3 h-3 fill-current" />
                                <span>Made in India</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-bold leading-[1.15] mb-5"
                                style={{ color: '#2D1B0E' }}>
                                Celebrate the{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #E85D04, #FF6B00, #D4380A)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    Soul of India
                                </span>
                            </h1>

                            <p className="text-base md:text-lg mb-2 max-w-md leading-relaxed" style={{ color: '#5C4033' }}>
                                Discover handcrafted treasures from 2,000+ verified artisans.
                            </p>
                            <p className="text-sm font-semibold mb-8 tracking-wide" style={{ color: '#9A6B48' }}>
                                Authentic. Ethnic. Beautiful.
                            </p>

                            <div className="flex flex-wrap gap-3 mb-8">
                                <Link to="/marketplace" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                                    style={{ background: 'linear-gradient(135deg, #E85D04, #D4380A)', boxShadow: '0 8px 30px rgba(232, 93, 4, 0.35)' }}>
                                    Shop Collection <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 pt-4" style={{ borderTop: '1px solid rgba(154, 107, 72, 0.15)' }}>
                                {[{ value: `${stats.totalProducts}+`, label: 'Products' }, { value: `${stats.totalSellers}+`, label: 'Artisans' }, { value: `${stats.totalOrders.toLocaleString()}+`, label: 'Orders' }].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-lg font-bold font-heading" style={{ color: '#E85D04' }}>{s.value}</div>
                                        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9A6B48' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative h-[440px]" style={{ perspective: '1000px' }}>
                                {featuredProducts.slice(0, 3).map((p, i) => {
                                    const configs = [
                                        { top: '5%', left: '5%', width: '220px', rotate: '-4deg', z: 20, delay: '0s' },
                                        { top: '15%', left: '40%', width: '240px', rotate: '3deg', z: 40, delay: '0.5s' },
                                        { top: '30%', left: '55%', width: '200px', rotate: '-2deg', z: 30, delay: '1s' },
                                    ];
                                    const c = configs[i];
                                    return (
                                        <div key={p.id}
                                            className="absolute rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105"
                                            style={{
                                                top: c.top, left: c.left, width: c.width,
                                                transform: `rotate(${c.rotate}) translateZ(${c.z}px)`,
                                                zIndex: c.z,
                                                animation: `float ${6 + i}s ease-in-out infinite`,
                                                animationDelay: c.delay,
                                                border: '3px solid rgba(255,255,255,0.7)',
                                            }}>
                                            <div className="relative aspect-[4/5] overflow-hidden">
                                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <p className="text-white text-xs font-bold truncate drop-shadow-lg">{p.name}</p>
                                                    <p className="text-white/80 text-[11px] font-semibold mt-0.5">₹{p.price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <FloatingTag style={{ top: '0%', right: '5%', background: 'rgba(255,255,255,0.85)', color: '#E85D04', border: '1px solid rgba(232,93,4,0.15)' }} className="animate-float"><span className="flex items-center gap-1.5"><Package className="w-3 h-3" /> Fresh Arrivals</span></FloatingTag>
                                <FloatingTag style={{ bottom: '15%', left: '0%', background: 'rgba(255,255,255,0.85)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.15)', animationDelay: '1.5s' }} className="animate-float"><span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Verified Sellers</span></FloatingTag>
                                <FloatingTag style={{ bottom: '5%', right: '15%', background: 'rgba(232,93,4,0.9)', color: 'white', animationDelay: '2.5s' }} className="animate-float"><span className="flex items-center gap-1.5"><Heart className="w-3 h-3" /> Handcrafted</span></FloatingTag>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 2 — Festival Countdown Banner (DYNAMIC)
               ═══════════════════════════════════════════════ */}
            <section className={`relative overflow-hidden py-16 md:py-24 transition-colors duration-1000 ease-in-out bg-gradient-to-br ${heroFestival.bg || 'from-orange-500 to-amber-600'}`}>

                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-container">
                    <div className="absolute inset-0 opacity-[0.07]"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                    {/* Floating Orbs */}
                    <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full opacity-20 blur-3xl animate-pulse-slow"
                        style={{ background: 'radial-gradient(circle, white, transparent)', animation: 'pulse-slow 8s infinite' }} />
                    <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse-slow"
                        style={{ background: 'radial-gradient(circle, white, transparent)', animationDelay: '2s', animation: 'pulse-slow 10s infinite' }} />

                    {/* 3D Floating Icons specific to festival */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i}
                            className="absolute text-6xl opacity-10 animate-float"
                            style={{
                                top: `${10 + Math.random() * 80}%`,
                                left: `${5 + Math.random() * 90}%`,
                                animation: `float ${6 + i}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 5}s`,
                                transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random()})`,
                                filter: 'blur(1px)'
                            }}>
                            {heroFestival.emoji}
                        </div>
                    ))}
                </div>

                <div className="container relative z-10">
                    <div className="flex flex-col items-center text-center">

                        {/* 3D Heading Construction */}
                        <div className="relative mb-6 group cursor-default" style={{ perspective: '500px' }}>
                            <div className="flex items-center gap-6 transition-transform duration-500 group-hover:rotate-x-12 group-hover:scale-105">
                                <button onClick={() => navigateFestival(-1)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 backdrop-blur-sm border border-white/10">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="text-center relative">
                                    <div className="absolute -inset-10 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-2">Next Celebration</div>
                                    <h2 className="text-4xl md:text-6xl font-heading font-black text-white drop-shadow-2xl flex items-center justify-center gap-4">
                                        <span className="animate-bounce-once inline-block">{heroFestival.emoji}</span>
                                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                                            {heroFestival.name}
                                        </span>
                                        <span className="animate-bounce-once inline-block" style={{ animationDelay: '0.1s' }}>{heroFestival.emoji}</span>
                                    </h2>
                                    <p className="text-white/80 font-medium text-lg mt-2">
                                        {heroDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>

                                <button onClick={() => navigateFestival(1)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 backdrop-blur-sm border border-white/10">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Enhanced 3D Countdown */}
                        <div className="mb-12 py-6 px-10 rounded-3xl backdrop-blur-sm border border-white/5 bg-white/5 shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-colors duration-500">
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            {!heroFestival.isActive ? (
                                <Countdown targetDate={heroDate} size="lg" />
                            ) : (
                                <div className="text-4xl md:text-6xl font-heading font-black text-white animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                    Happening Now!
                                    <div className="text-xl font-normal mt-2 opacity-90">Enjoy exclusive festival deals</div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Dot Selector */}
                        <div className="flex items-center gap-3 mb-10 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                            {sortedFestivals.slice(0, 5).map((f, i) => (
                                <button key={f.id + i}
                                    onClick={() => setActiveFestivalIdx(i)}
                                    className={`relative group w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${activeFestivalIdx === i
                                            ? 'scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)] z-10 bg-white text-black'
                                            : 'hover:scale-110 hover:bg-white/20 text-white hover:text-white'
                                        }`}
                                    title={f.name}>
                                    <span className="relative z-10">{f.emoji}</span>
                                    {activeFestivalIdx === i && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full translate-y-2" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Frosted Glass Categories */}
                        <div className="flex flex-wrap justify-center gap-3 perspective-container">
                            {CATEGORY_TAGS.map((tag, i) => (
                                <Link key={tag.label} to={`/marketplace`}
                                    className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group"
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(12px)',
                                        animation: `fadeInUp 0.5s ease-out ${0.5 + i * 0.1}s both`
                                    }}>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span className="text-lg">{tag.emoji}</span> {tag.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 3 — Trending Products
               ═══════════════════════════════════════════════ */}
            <section id="trending" data-animate className="py-14">
                <div className="container">
                    <div className={`flex items-center justify-between mb-8 ${visibleSections.has('trending') ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
                                <h2 className="text-2xl md:text-3xl font-heading font-bold">Trending Now</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Handpicked festival specials from verified sellers</p>
                        </div>
                        {isAuthenticated && (
                            <Link to="/marketplace" className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all px-4 py-2 rounded-full"
                                style={{ color: 'rgb(var(--color-primary))', background: 'rgba(var(--color-primary), 0.08)' }}>
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 perspective-container ${visibleSections.has('trending') ? '' : 'opacity-0'}`}>
                        {trendingProducts.map((p, i) => (
                            <div key={p.id} className="relative group" style={{ animation: visibleSections.has('trending') ? `fadeInUp 0.5s ease-out ${i * 0.07}s both` : 'none' }}>
                                <div style={{ pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'all 0.4s' }}>
                                    <ProductCard 
                                        product={p} 
                                        isWishlisted={isWishlisted(p.id)}
                                        onWishlist={toggleWishlist}
                                    />
                                </div>
                                {!isAuthenticated && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                                        <div className="bg-white/95 p-3.5 rounded-full shadow-xl border border-gray-100 flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-gray-800" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {isAuthenticated && (
                        <div className="flex justify-center mt-6 sm:hidden">
                            <Link to="/marketplace" className="flex items-center gap-1 text-sm font-semibold px-5 py-2.5 rounded-full"
                                style={{ color: 'rgb(var(--color-primary))', background: 'rgba(var(--color-primary), 0.08)' }}>
                                View All Products <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 4 — Featured Sellers
               ═══════════════════════════════════════════════ */}
            <section id="sellers" data-animate className="py-14" style={{ background: 'rgba(var(--color-primary), 0.03)' }}>
                <div className="container">
                    <div className={`flex items-center justify-between mb-8 ${visibleSections.has('sellers') ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
                                <h2 className="text-2xl md:text-3xl font-heading font-bold">Featured Artisans</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Real stories, real craftsmanship</p>
                        </div>
                        {isAuthenticated && (
                            <Link to="/collaborate" className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all px-4 py-2 rounded-full"
                                style={{ color: 'rgb(var(--color-primary))', background: 'rgba(var(--color-primary), 0.08)' }}>
                                All Sellers <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 perspective-container ${visibleSections.has('sellers') ? '' : 'opacity-0'}`}>
                        {featuredSellers.map((s, i) => (
                            <div key={s.id} className="relative group" style={{ animation: visibleSections.has('sellers') ? `fadeInUp 0.5s ease-out ${i * 0.1}s both` : 'none' }}>
                                <div style={{ pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'all 0.4s' }}>
                                    <SellerCard seller={s} />
                                </div>
                                {!isAuthenticated && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                                        <div className="bg-white/95 p-3.5 rounded-full shadow-xl border border-gray-100 flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-gray-800" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 5 — Curated Hampers
               ═══════════════════════════════════════════════ */}
            <section id="hampers" data-animate className="py-14">
                <div className="container">
                    <div className={`flex items-center justify-between mb-8 ${visibleSections.has('hampers') ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Gift className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
                                <h2 className="text-2xl md:text-3xl font-heading font-bold">Curated Gift Hampers</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Handpicked gift sets for every celebration</p>
                        </div>
                        {isAuthenticated && (
                            <Link to="/hamper" className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all px-4 py-2 rounded-full"
                                style={{ color: 'rgb(var(--color-primary))', background: 'rgba(var(--color-primary), 0.08)' }}>
                                Build Yours <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-container">
                        {[
                            { name: 'Diwali Delight', emoji: '🪔', items: ['Lakshmi Diya Set', 'Kaju Katli Box', 'Brass Puja Thali'], price: 1899, color: '#FFD700', gradient: 'linear-gradient(135deg, #1a0a3a, #312e81)' },
                            { name: 'Holi Splash', emoji: '🎨', items: ['Organic Gulal Set', 'Premium Pichkari', 'Thandai Mix'], price: 849, color: '#FF006E', gradient: 'linear-gradient(135deg, #831843, #6b21a8)' },
                            { name: 'Navratri Celebration', emoji: '💃', items: ['Dandiya Sticks', 'Chaniya Choli', 'Garland Set'], price: 3299, color: '#DC267F', gradient: 'linear-gradient(135deg, #4c1d95, #831843)' },
                        ].map((hamper, i) => (
                            <div key={hamper.name} className="relative group">
                                <div
                                    className="rounded-2xl p-6 card-3d transition-all duration-300 relative overflow-hidden h-full"
                                    style={{
                                        background: hamper.gradient,
                                        border: `1px solid ${hamper.color}33`,
                                        animation: visibleSections.has('hampers') ? `fadeInUp 0.5s ease-out ${i * 0.15}s both` : 'none',
                                        opacity: visibleSections.has('hampers') ? 1 : 0,
                                        pointerEvents: isAuthenticated ? 'auto' : 'none'
                                    }}>
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${hamper.color}, transparent)` }} />
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{hamper.emoji}</div>
                                        <h3 className="font-bold text-xl mb-3 text-white">{hamper.name}</h3>
                                        <ul className="space-y-2 mb-5">
                                            {hamper.items.map(item => (
                                                <li key={item} className="text-sm text-white/70 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: hamper.color }} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xl" style={{ color: hamper.color }}>₹{hamper.price}</span>
                                            <Link to="/hamper" className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
                                                style={{ background: hamper.color, boxShadow: `0 4px 20px ${hamper.color}44` }}>
                                                Customize
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                {!isAuthenticated && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                                        <div className="bg-white/95 p-3.5 rounded-full shadow-xl border border-gray-100 flex items-center justify-center">
                                            <Lock className="w-7 h-7 text-gray-800" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 6 — How It Works
               ═══════════════════════════════════════════════ */}
            <section id="howitworks" data-animate className="py-14" style={{ background: 'rgba(var(--color-primary), 0.03)' }}>
                <div className="container">
                    <div className={`text-center mb-10 ${visibleSections.has('howitworks') ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">How It Works</h2>
                        <p className="text-gray-500 text-sm">From discovery to celebration in 4 simple steps</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                        {[
                            { icon: '🔍', step: '01', title: 'Browse', desc: 'Explore 500+ handmade products from verified local sellers', color: palette.primary },
                            { icon: '🤝', step: '02', title: 'Negotiate', desc: 'Use AI-powered chat to get the best price from sellers', color: palette.accent },
                            { icon: '💳', step: '03', title: 'Pay Securely', desc: 'Secure payment via UPI, Card, or Cash on Delivery', color: palette.secondary || palette.primary },
                            { icon: '🎉', step: '04', title: 'Celebrate', desc: 'Receive your order and earn credit points for next time', color: palette.primary },
                        ].map((step, i) => (
                            <div key={step.step} className="text-center relative"
                                style={{
                                    animation: visibleSections.has('howitworks') ? `fadeInUp 0.5s ease-out ${i * 0.12}s both` : 'none',
                                    opacity: visibleSections.has('howitworks') ? undefined : 0
                                }}>
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px opacity-20"
                                        style={{ background: `linear-gradient(to right, ${step.color}, transparent)` }} />
                                )}
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-all duration-300 hover:scale-110 hover:rotate-6 card-3d"
                                    style={{ background: `${step.color}15`, boxShadow: `0 4px 20px ${step.color}15` }}>
                                    {step.icon}
                                </div>
                                <div className="text-[10px] font-bold mb-1.5 opacity-30 tracking-wider">{step.step}</div>
                                <h3 className="font-bold mb-1.5 text-sm">{step.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 7 — Community Voices
               ═══════════════════════════════════════════════ */}
            <section id="community" data-animate className="py-14">
                <div className="container">
                    <div className={`flex items-center justify-between mb-8 ${visibleSections.has('community') ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
                                <h2 className="text-2xl md:text-3xl font-heading font-bold">Community Voices</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">What our community is saying</p>
                        </div>
                        {isAuthenticated && (
                            <Link to="/community" className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all px-4 py-2 rounded-full"
                                style={{ color: 'rgb(var(--color-primary))', background: 'rgba(var(--color-primary), 0.08)' }}>
                                Join Community <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {recentPosts.map((post, i) => (
                            <div key={post.id} className="relative group festival-card rounded-2xl overflow-hidden card-3d"
                                style={{
                                    animation: visibleSections.has('community') ? `fadeInUp 0.5s ease-out ${i * 0.12}s both` : 'none',
                                    opacity: visibleSections.has('community') ? undefined : 0
                                }}>
                                <div style={{ pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'all 0.4s' }}>
                                    {post.image && (
                                        <div className="overflow-hidden h-44">
                                            <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <img src={post.authorAvatar} alt="" className="w-8 h-8 rounded-full border-2" style={{ borderColor: 'rgba(var(--color-primary), 0.3)' }} />
                                            <div>
                                                <span className="text-sm font-semibold block leading-tight">{post.authorName}</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5"
                                                    style={{ background: 'rgba(var(--color-primary), 0.1)', color: 'rgb(var(--color-primary))' }}>{post.festival}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{post.content}</p>
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(var(--color-primary), 0.1)' }}>
                                            <span className="text-xs text-gray-400 flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                                            <span className="text-xs text-gray-400">{post.comments} comments</span>
                                        </div>
                                    </div>
                                </div>
                                {!isAuthenticated && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                                        <div className="bg-white/95 p-3.5 rounded-full shadow-xl border border-gray-100 flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-gray-800" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 8 — Credits CTA
               ═══════════════════════════════════════════════ */}
            <section id="credits-cta" data-animate className="py-10">
                <div className="container">
                    <div className={`rounded-3xl p-8 md:p-10 text-white relative overflow-hidden ${visibleSections.has('credits-cta') ? 'animate-scale-in' : 'opacity-0'}`}
                        style={{ background: 'var(--btn-gradient)' }}>
                        <div className="absolute inset-0 opacity-[0.06]"
                            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, white, transparent)' }} />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                            <div className="text-5xl md:text-6xl">⭐</div>
                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">Earn Points on Every Purchase</h2>
                                <p className="opacity-80 text-sm md:text-base">10 points per ₹100 spent. 2x multiplier during festivals. Redeem for exclusive discounts.</p>
                            </div>
                            <Link to="/credits" className="inline-flex items-center gap-2 bg-white px-7 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-lg whitespace-nowrap"
                                style={{ color: 'rgb(var(--color-primary))' }}>
                                Learn More <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 9 — Seller Stories
               ═══════════════════════════════════════════════ */}
            <section id="testimonials" data-animate className="py-14" style={{ background: 'rgba(var(--color-primary), 0.03)' }}>
                <div className="container">
                    <div className={`text-center mb-8 ${visibleSections.has('testimonials') ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">Seller Stories</h2>
                        <p className="text-gray-500 text-sm">Real artisans, real impact</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sellers.slice(0, 2).map((seller, i) => (
                            <div key={seller.id} className="festival-card rounded-2xl p-6 card-3d"
                                style={{
                                    animation: visibleSections.has('testimonials') ? `fadeInUp 0.5s ease-out ${i * 0.15}s both` : 'none',
                                    opacity: visibleSections.has('testimonials') ? undefined : 0
                                }}>
                                <div className="text-4xl mb-3 opacity-20 font-serif">"</div>
                                <p className="text-gray-600 italic mb-5 leading-relaxed line-clamp-3">{seller.story}</p>
                                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(var(--color-primary), 0.1)' }}>
                                    <img src={seller.avatar} alt={seller.name} className="w-11 h-11 rounded-full border-2" style={{ borderColor: 'rgba(var(--color-primary), 0.3)' }} />
                                    <div>
                                        <p className="font-bold text-sm">{seller.name}</p>
                                        <p className="text-xs text-gray-500">{seller.business}, {seller.city}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-bold">{seller.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECTION 10 — Newsletter
               ═══════════════════════════════════════════════ */}
            <section id="newsletter" data-animate className="py-14">
                <div className={`container max-w-xl text-center ${visibleSections.has('newsletter') ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                        style={{ background: 'rgba(var(--color-primary), 0.08)' }}>📬</div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">Stay Festival-Ready</h2>
                    <p className="text-gray-500 mb-6 text-sm">Get early access to festival deals, new seller stories, and exclusive offers.</p>
                    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); alert('Thanks for subscribing!'); }}>
                        <input type="email" placeholder="your@email.com" required className="flex-1 px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary outline-none font-body text-sm transition-colors" />
                        <button type="submit" className="px-6 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                            style={{ background: 'var(--btn-gradient)', boxShadow: `0 4px 20px ${palette.primary}33` }}>
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Home;
