import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme, FESTIVAL_CALENDAR, getNextFestival } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { Clock, Calendar, ChevronRight } from 'lucide-react';

const getNextDate = (mmdd) => {
    const [month, day] = mmdd.split('-').map(Number);
    const now = new Date();
    const y = now.getFullYear();
    let d = new Date(y, month - 1, day);
    if (d < now) d = new Date(y + 1, month - 1, day);
    return d;
};

const MiniCountdown = ({ targetDate, color }) => {
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
    return (
        <div className="flex gap-2 mt-2">
            {[['d', 'D'], ['h', 'H'], ['m', 'M'], ['s', 'S']].map(([k, label]) => (
                <div key={k} className="text-center px-2 py-1 rounded-lg" style={{ background: `${color}15` }}>
                    <div className="text-sm font-bold tabular-nums" style={{ color }}>{String(time[k]).padStart(2, '0')}</div>
                    <div className="text-[8px] uppercase tracking-wider opacity-60">{label}</div>
                </div>
            ))}
        </div>
    );
};

const FEST_EXTRA = {
    pongal: { desc: 'Harvest Festival of Tamil Nadu — Celebrate with traditional kolam, sweet pongal, and sugarcane decorations.', category: 'Food & Sweets', bg: '#FFFDF0' },
    lohri: { desc: 'Bonfire Celebration — Dance around the fire with rewri, popcorn, and peanuts. Celebrate new beginnings.', category: 'Food & Sweets', bg: '#FFF5F0' },
    holi: { desc: 'Festival of Colors — Celebrate with organic gulal, pichkaris, and traditional sweets.', category: 'Decoration', bg: '#FFF0F5' },
    eid: { desc: 'Festival of Joy — Celebrate Eid with traditional attire, sweets, and gifts for your loved ones.', category: 'Food & Sweets', bg: '#F0FFF8' },
    rakhi: { desc: 'Bond of Love — Celebrate the bond of siblings with handcrafted rakhis and gifts.', category: 'Gifts', bg: '#FDF5FF' },
    onam: { desc: 'Harvest Festival of Kerala — Celebrate with pookalam, kasavu sarees, and Kerala sweets.', category: 'Clothing', bg: '#FFFDF0' },
    navratri: { desc: 'Festival of Dance — Nine nights of garba, dandiya, and devotion.', category: 'Clothing', bg: '#F5F0FF' },
    dussehra: { desc: 'Victory of Good over Evil — Celebrate the triumph of Lord Rama.', category: 'Decoration', bg: '#FFF8F0' },
    diwali: { desc: 'Festival of Lights — Celebrate with diyas, rangoli, sweets, and fireworks.', category: 'Candles & Diyas', bg: '#0D0221' },
    christmas: { desc: 'Festival of Giving — Spread joy with Christmas gifts and handmade crafts.', category: 'Decoration', bg: '#FFF5F0' },
};

const Festivals = () => {
    const { products } = useData();
    const { theme } = useTheme();

    const sortedFestivals = useMemo(() => {
        return getNextFestival().map(sf => ({
            ...sf,
            ...(FEST_EXTRA[sf.id] || { desc: '', category: 'All', bg: '#FFF' })
        }));
    }, []);

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            <div className="text-center mb-10">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Festival Calendar</h1>
                <p className="text-gray-500">Discover curated products for every Indian festival</p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-widest">
                    🤖 Website theme changes automatically as festivals approach
                </div>
            </div>

            {/* Next Festival Spotlight */}
            {sortedFestivals.length > 0 && (
                <div className="festival-card rounded-2xl p-6 mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
                        <h2 className="text-lg font-heading font-bold">
                            {sortedFestivals[0].isActive
                                ? `${sortedFestivals[0].emoji} ${sortedFestivals[0].name} is happening now!`
                                : `Next Up: ${sortedFestivals[0].emoji} ${sortedFestivals[0].name}`}
                        </h2>
                    </div>
                    {!sortedFestivals[0].isActive && (
                        <>
                            <MiniCountdown targetDate={sortedFestivals[0].nextDate} color={sortedFestivals[0].color} />
                            <p className="text-xs text-gray-400 mt-2">
                                {sortedFestivals[0].nextDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </>
                    )}
                </div>
            )}

            <div className="space-y-8">
                {sortedFestivals.map((festival, index) => {
                    // Properly filter products for this festival
                    const festProducts = products.filter(p =>
                        p.festival.toLowerCase() === festival.id ||
                        p.festival.toLowerCase() === festival.name.toLowerCase()
                    ).slice(0, 4);

                    const nextDate = festival.nextDate || getNextDate(festival.date);
                    const diffDays = festival.daysUntil;
                    const isActive = festival.isActive;
                    const isThemeActive = theme === festival.themeId;

                    return (
                        <div key={festival.id} className="festival-card rounded-3xl overflow-hidden">
                            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative" style={{ background: festival.bg }}>
                                {index === 0 && (
                                    <div className="absolute top-3 right-3">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full shadow-md text-white ${isActive ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}>
                                            {isActive ? '🔴 LIVE NOW' : '⭐ NEXT UP'}
                                        </span>
                                    </div>
                                )}
                                {isThemeActive && index !== 0 && (
                                    <div className="absolute top-3 right-3">
                                        <span className="text-[10px] font-black px-3 py-1 rounded-full shadow-md bg-green-500 text-white">
                                            ✓ ACTIVE THEME
                                        </span>
                                    </div>
                                )}
                                <div className="text-5xl">{festival.emoji}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h2 className="text-2xl font-heading font-bold">{festival.name}</h2>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {nextDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-red-100 text-red-600' : diffDays <= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {isActive ? 'Happening Now!' : diffDays <= 0 ? 'Passed' : `${diffDays} days`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 max-w-xl">{festival.desc}</p>
                                    {!isActive && diffDays > 0 && (
                                        <MiniCountdown targetDate={nextDate} color={festival.color} />
                                    )}
                                </div>
                            </div>

                            {/* Festival Products */}
                            {festProducts.length > 0 && (
                                <div className="p-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {festProducts.map(product => (
                                            <Link key={product.id} to={`/product/${product.id}`} className="group">
                                                <div className="rounded-xl overflow-hidden border border-gray-100 hover:border-primary transition-all hover:shadow-md">
                                                    <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    <div className="p-2">
                                                        <p className="text-xs font-semibold line-clamp-1">{product.name}</p>
                                                        <p className="text-xs font-bold" style={{ color: festival.color }}>₹{product.price}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link to={`/marketplace?festival=${festival.name}`} className="inline-flex items-center gap-1 mt-3 text-sm font-semibold hover:gap-2 transition-all" style={{ color: festival.color }}>
                                        View all {festival.name} products <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            )}

                            {festProducts.length === 0 && (
                                <div className="p-4 text-center text-sm text-gray-400">
                                    No products listed for {festival.name} yet — check back closer to the festival!
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Festivals;
