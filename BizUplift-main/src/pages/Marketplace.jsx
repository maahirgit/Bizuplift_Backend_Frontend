import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Star, ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/UI/ProductCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const CATEGORIES = ['All', 'Handicrafts', 'Food & Sweets', 'Clothing', 'Decoration', 'Jewelry', 'Candles & Diyas', 'Pottery'];
const FESTIVALS_LIST = ['All', 'Lohri', 'Pongal', 'Holi', 'Eid', 'Onam', 'Raksha Bandhan', 'Navratri', 'Dussehra', 'Diwali', 'Christmas'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'negotiable', label: 'Negotiable First' },
];

const Marketplace = () => {
    const { products, isWishlisted, toggleWishlist, isDataLoading } = useData();
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    
    // Filter States
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState('All');
    const [festival, setFestival] = useState(searchParams.get('festival') || 'All');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState('newest');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [negotiableOnly, setNegotiableOnly] = useState(false);
    
    // UI States
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 20;

    useEffect(() => { 
        setSearch(searchParams.get('search') || ''); 
        if (searchParams.get('festival')) setFestival(searchParams.get('festival'));
    }, [searchParams]);

    const filtered = useMemo(() => {
        let result = [...products];
        if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()) || p.sellerName.toLowerCase().includes(search.toLowerCase()));
        if (category !== 'All') result = result.filter(p => p.category === category);
        if (festival !== 'All') {
            result = result.filter(p => 
                p.festival === 'All' || 
                p.festival.toLowerCase() === festival.toLowerCase() ||
                (festival === 'Raksha Bandhan' && p.festival.toLowerCase() === 'rakhi')
            );
        }
        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
        if (minRating > 0) result = result.filter(p => p.rating >= minRating);
        if (inStockOnly) result = result.filter(p => p.stock > 0);
        if (negotiableOnly) result = result.filter(p => p.negotiable);
        
        switch (sortBy) {
            case 'price_asc': result.sort((a, b) => a.price - b.price); break;
            case 'price_desc': result.sort((a, b) => b.price - a.price); break;
            case 'rating': result.sort((a, b) => b.rating - a.rating); break;
            case 'negotiable': result.sort((a, b) => (b.negotiable ? 1 : 0) - (a.negotiable ? 1 : 0)); break;
            default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return result;
    }, [products, search, category, festival, priceRange, minRating, sortBy, inStockOnly, negotiableOnly]);

    const paginated = filtered.slice(0, page * PER_PAGE);
    const hasMore = paginated.length < filtered.length;

    // Advanced filters check for the badge counter
    const activeAdvancedFiltersCount = [
        minRating > 0,
        inStockOnly,
        negotiableOnly,
        priceRange[1] < 10000
    ].filter(Boolean).length;

    const clearAdvancedFilters = () => {
        setPriceRange([0, 10000]);
        setMinRating(0);
        setInStockOnly(false);
        setNegotiableOnly(false);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 sm:pb-10 font-body">
            
            {/* STICKY TOP APP BAR FILTER SYSTEM */}
            <div className="relative z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="px-4 py-4 md:px-6 lg:px-8 max-w-[1920px] mx-auto space-y-4">
                    
                    {/* Top Row: Title, Search, Actions */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 flex-shrink-0 flex items-baseline gap-2 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Marketplace <span className="text-sm font-body font-medium text-gray-500">({filtered.length})</span>
                        </h1>
                        
                        <div className="flex-1 max-w-2xl relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input 
                                value={search} 
                                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                                placeholder="Search beautiful handicrafts, sweets..." 
                                className="w-full pl-11 pr-10 py-3 bg-gray-100/80 border-transparent focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl outline-none transition-all text-sm shadow-inner" 
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 relative">
                            <div className="relative flex items-center bg-gray-100/80 rounded-2xl hover:bg-gray-200/80 transition-colors">
                                <select 
                                    value={sortBy} 
                                    onChange={e => setSortBy(e.target.value)} 
                                    className="appearance-none pl-4 pr-10 py-3 bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer w-full"
                                >
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>

                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all relative overflow-hidden ${showFilters || activeAdvancedFiltersCount > 0 ? 'text-white border-transparent shadow-lg shadow-primary/20' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'}`}
                                style={showFilters || activeAdvancedFiltersCount > 0 ? { background: 'var(--btn-gradient)' } : {}}
                            >
                                <SlidersHorizontal className={`w-4 h-4 ${showFilters || activeAdvancedFiltersCount > 0 ? 'animate-pulse' : ''}`} /> 
                                <span className="hidden sm:inline">Filters</span>
                                {activeAdvancedFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-primary flex items-center justify-center text-[10px] shadow-sm transform translate-y-2 -translate-x-2">
                                        {activeAdvancedFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Middle Row: Scrollable Categories */}
                    <div className="flex items-center overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3 flex-shrink-0">Categories</span>
                        <div className="flex gap-2">
                            {CATEGORIES.map(c => (
                                <button 
                                    key={c} onClick={() => { setCategory(c); setPage(1); }}
                                    className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${category === c ? 'bg-gray-900 text-white shadow-md transform scale-105' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Bottom Row: Scrollable Festivals */}
                    <div className="flex items-center overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 pt-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3 flex-shrink-0">Festivals</span>
                        <div className="flex gap-2">
                            {FESTIVALS_LIST.map(f => (
                                <button 
                                    key={f} onClick={() => { setFestival(f); setPage(1); }}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${festival === f ? 'bg-primary/10 text-primary border border-primary/50 shadow-sm' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expandable Advanced Filters Drawer */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 pb-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Price Slider */}
                                    <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-sm text-gray-900">Price Range</h3>
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                                Up to ₹{priceRange[1].toLocaleString()}
                                            </span>
                                        </div>
                                        <input 
                                            type="range" min={0} max={10000} step={100} 
                                            value={priceRange[1]} 
                                            onChange={e => setPriceRange([0, +e.target.value])} 
                                            className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                        <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                                            <span>₹0</span>
                                            <span>₹10,000+</span>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                                        <h3 className="font-bold text-sm text-gray-900 mb-4">Minimum Rating</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {[0, 3, 4, 4.5].map(r => (
                                                <button 
                                                    key={r} onClick={() => setMinRating(r)} 
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${minRating === r ? 'text-white border-transparent shadow-md transform scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-900'}`} 
                                                    style={minRating === r ? { background: 'var(--btn-gradient)' } : {}}
                                                >
                                                    {r === 0 ? 'Any Rating' : <><Star className={`w-3.5 h-3.5 ${minRating === r ? 'fill-white' : 'fill-yellow-400 text-yellow-500'}`} /> {r}+</>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900 leading-none">In Stock Only</h3>
                                                <p className="text-[11px] text-gray-500 mt-1">Hide sold out items</p>
                                            </div>
                                            <button 
                                                onClick={() => setInStockOnly(!inStockOnly)} 
                                                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shadow-inner ${inStockOnly ? 'bg-primary' : 'bg-gray-300'}`} 
                                                style={inStockOnly ? { background: 'rgb(var(--color-primary))' } : {}}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${inStockOnly ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                        
                                        <div className="h-px bg-gray-200 w-full" />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900 leading-none">Negotiable Only</h3>
                                                <p className="text-[11px] text-gray-500 mt-1">Chat to agree on price</p>
                                            </div>
                                            <button 
                                                onClick={() => setNegotiableOnly(!negotiableOnly)} 
                                                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shadow-inner ${negotiableOnly ? 'bg-emerald-500' : 'bg-gray-300'}`} 
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${negotiableOnly ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {activeAdvancedFiltersCount > 0 && (
                                    <div className="pt-2 pb-1 flex justify-end">
                                        <button onClick={clearAdvancedFilters} className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline px-4 py-2 flex items-center gap-1 transition-colors">
                                            <X className="w-3.5 h-3.5" /> Clear Advanced Filters
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* FULL WIDTH PRODUCT GRID */}
            <div className="px-4 py-8 md:px-6 lg:px-8 max-w-[1920px] mx-auto min-h-[50vh]">
                {isDataLoading ? (
                    <LoadingSpinner />
                ) : paginated.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto"
                    >
                        <div className="text-7xl mb-6">🔍</div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-900">No products found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                        <button 
                            onClick={() => { setCategory('All'); setFestival('All'); setSearch(''); clearAdvancedFilters(); }}
                            className="px-6 py-3 rounded-full font-bold text-white transition-transform hover:scale-105 shadow-lg shadow-primary/20"
                            style={{ background: 'var(--btn-gradient)' }}
                        >
                            Reset All Filters
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* New Responsive Grid Layout bridging the full width perfectly */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 perspective-container layout-transition">
                            {paginated.map((p, index) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                >
                                    <ProductCard 
                                        product={p}
                                        isWishlisted={isWishlisted(p.id)}
                                        onWishlist={toggleWishlist}
                                    />
                                </motion.div>
                            ))}
                        </div>
                        
                        {hasMore && (
                            <div className="text-center mt-12 pb-8">
                                <button 
                                    onClick={() => setPage(p => p + 1)} 
                                    className="group px-10 py-3.5 rounded-full font-bold text-white transition-all hover:scale-105 shadow-xl shadow-primary/20 relative overflow-hidden flex items-center mx-auto gap-2" 
                                    style={{ background: 'var(--btn-gradient)' }}
                                >
                                    <span className="relative z-10">Load More Products ({filtered.length - paginated.length} remaining)</span>
                                    <ChevronDown className="w-5 h-5 relative z-10 group-hover:translate-y-1 transition-transform" />
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
