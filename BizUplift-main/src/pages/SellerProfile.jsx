import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Package, Check, BadgeCheck, MessageCircle, Heart, Share2, Grid, Layers, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ProductCard from '../components/UI/ProductCard';

const SellerProfile = () => {
    const { id } = useParams();
    const { sellers, products, posts, isWishlisted, toggleWishlist, toggleLike } = useData();
    const { currentUser } = useAuth();
    const { showToast } = useNotifications();
    const [activeTab, setActiveTab] = useState('products');

    const seller = sellers.find(s => s.id === id);
    const sellerProducts = products.filter(p => p.sellerId === id);
    // Assuming posts have authorId. We filter posts made by this seller.
    const sellerPosts = posts.filter(p => p.authorId === id || p.authorName === seller?.business);

    if (!seller) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-body">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <div className="text-7xl mb-6">🏜️</div>
                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">Artisan Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">It looks like this creator's shop has moved or doesn't exist.</p>
                <Link to="/marketplace" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-white shadow-lg transition-transform hover:scale-105" style={{ background: 'var(--btn-gradient)' }}>
                    Return to Marketplace
                </Link>
            </motion.div>
        </div>
    );

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr);
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(diff / 86400000);
        if (d > 0) return `${d}d ago`;
        if (h > 0) return `${h}h ago`;
        return 'Just now';
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 font-body">
            {/* CINEMATIC HERO HEADER */}
            <div className="relative h-[280px] md:h-[340px] w-full overflow-hidden">
                {/* Dynamic Animated Gradient Background */}
                <motion.div 
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 z-0 bg-gradient-to-r"
                    style={{ 
                        backgroundSize: '200% 200%',
                        backgroundImage: 'linear-gradient(120deg, var(--color-primary) 0%, #fbd786 50%, #f7797d 100%)',
                        opacity: 0.8
                    }}
                />
                <div className="absolute inset-0 bg-black/20 z-10 backdrop-blur-[2px]" />
                
                {/* Floating Metrics (Top Right) */}
                <div className="absolute top-6 right-6 z-20 flex gap-3 hidden md:flex">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-white flex items-center gap-2 shadow-lg">
                        <Package className="w-4 h-4" />
                        <span className="font-bold">{sellerProducts.length} <span className="font-normal opacity-80">Creations</span></span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-white flex items-center gap-2 shadow-lg">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{seller.rating} <span className="font-normal opacity-80">({seller.totalOrders} Orders)</span></span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-30">
                {/* PROFILE INFO CARD */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/10 border border-gray-100 -mt-24 md:-mt-32 relative flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-10"
                >
                    <div className="relative flex-shrink-0 mx-auto md:mx-0 -mt-16 md:-mt-20">
                        <motion.img 
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            src={seller.avatar} 
                            alt={seller.name} 
                            className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white object-cover shadow-xl bg-white" 
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2 leading-tight flex items-center justify-center md:justify-start gap-2">
                            {seller.business}
                            {seller.verified && (
                                <BadgeCheck className="w-7 h-7 fill-blue-500 text-white" aria-label="Verified" />
                            )}
                        </h1>
                        <p className="text-lg text-gray-500 font-medium mb-4">{seller.name}</p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-600 mb-6">
                            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl font-semibold"><MapPin className="w-4 h-4 text-primary" /> {seller.city}, {seller.state}</span>
                            
                            {/* Mobile specific metrics shown inline since top-right is hidden on mobile */}
                            <span className="md:hidden flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl font-semibold"><Star className="w-4 h-4 fill-yellow-400 text-yellow-500" /> {seller.rating}</span>
                            <span className="md:hidden flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl font-semibold"><Package className="w-4 h-4 text-primary" /> {sellerProducts.length}</span>
                        </div>
                        
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 relative">
                            <span className="text-4xl text-primary/20 font-serif absolute top-2 left-3">"</span>
                            <p className="text-gray-700 leading-relaxed italic relative z-10 px-4">
                                {seller.story}
                            </p>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col gap-3 flex-shrink-0">
                        <button className="w-full md:w-48 py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2" style={{ background: 'var(--btn-gradient)' }}>
                            <ExternalLink className="w-4 h-4" /> Message Seller
                        </button>
                        <button className="w-full md:w-48 py-3.5 rounded-xl font-bold bg-white text-gray-700 border-2 border-gray-100 transition-colors hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-2 shadow-sm">
                            <Share2 className="w-4 h-4 text-primary" /> Share Profile
                        </button>
                    </div>
                </motion.div>

                {/* INTERACTIVE TAB NAVIGATION */}
                <div className="flex items-center justify-center md:justify-start gap-8 border-b border-gray-200 mb-8 px-4">
                    {['products', 'posts'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-lg font-bold transition-colors capitalize flex items-center gap-2 ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab === 'products' ? <Grid className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                            {tab === 'products' ? 'Showcase' : 'Community Posts'}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="sellerProfileTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full z-10"
                                    style={{ background: 'var(--btn-gradient)' }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT (ANIMATED PRESENCE) */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-[50vh]"
                    >
                        {activeTab === 'products' ? (
                            /* SHOWCASE LAYOUT */
                            sellerProducts.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                                    <div className="text-5xl mb-4">🛍️</div>
                                    <h3 className="text-xl font-bold mb-2">No active products</h3>
                                    <p className="text-gray-500">Check back later for new creations from {seller.business}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 perspective-container">
                                    {sellerProducts.map((p, i) => (
                                        <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                            <ProductCard 
                                                product={p}
                                                isWishlisted={isWishlisted(p.id)}
                                                onWishlist={toggleWishlist}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )
                        ) : (
                            /* COMMUNITY POSTS LAYOUT */
                            <div className="max-w-3xl mx-auto space-y-6 pb-20">
                                {sellerPosts.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="text-5xl mb-4">📢</div>
                                        <h3 className="text-xl font-bold mb-2">No updates yet</h3>
                                        <p className="text-gray-500">{seller.business} hasn't posted any community updates.</p>
                                    </div>
                                ) : (
                                    sellerPosts.map((post, i) => {
                                        const isLiked = currentUser && post.likes?.includes(currentUser.id);
                                        return (
                                            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm">
                                                            <img src={post.authorAvatar || seller.avatar} alt="Author" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{post.authorName || seller.business}</h3>
                                                            <div className="text-xs text-gray-400 font-semibold uppercase">{timeAgo(post.createdAt)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                                        {post.festival} Update
                                                    </div>
                                                </div>

                                                <p className="text-gray-700 leading-relaxed mb-6 font-body text-[15px] whitespace-pre-wrap">{post.content}</p>

                                                {post.image && (
                                                    <div className="rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100 max-h-96">
                                                        <img src={post.image} alt="Post attachment" className="w-full h-full object-cover" />
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                                                    <button onClick={() => toggleLike(post.id, currentUser?.id)} className={`flex items-center gap-2 text-sm font-bold transition-all ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''} ${isLiked ? 'animate-bounce' : ''}`} />
                                                        {post.likes?.length || 0}
                                                    </button>
                                                    <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors">
                                                        <MessageCircle className="w-5 h-5" />
                                                        {post.comments?.length || 0}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SellerProfile;
