import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const ProductCard = ({ product, isWishlisted, onWishlist }) => {
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const { showToast } = useNotifications();
    const [added, setAdded] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();
        addToCart(product);
        setAdded(true);
        showToast(`${product.name.slice(0, 30)}... added to cart!`);
        setTimeout(() => setAdded(false), 1500);
    };

    const savings = product.mrp - product.price;
    const savingsPct = Math.round((savings / product.mrp) * 100);

    return (
        <motion.div 
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border border-gray-100 flex flex-col"
        >
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
                <motion.img 
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                />
                
                {/* Gradient Overlay for bottom text readability and depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Top Badges Area */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    <motion.span 
                        initial={{ opacity: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        className="text-xs font-black px-3 py-1 rounded-full text-white shadow-md backdrop-blur-md" 
                        style={{ background: 'var(--btn-gradient)' }}
                    >
                        {product.festival}
                    </motion.span>
                    {savingsPct > 0 && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm w-max uppercase tracking-wider">
                            {savingsPct}% OFF
                        </span>
                    )}
                </div>

                {/* Right Top Area (Negotiable / Wishlist) */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                    {currentUser?.role === 'customer' && (
                        <motion.button 
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.preventDefault(); onWishlist(product.id); }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-colors ${isWishlisted ? 'bg-red-50 border border-red-100' : 'bg-white/90 border border-white hover:bg-white'}`}
                        >
                            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                        </motion.button>
                    )}

                    {product.negotiable && (
                        <span className="bg-emerald-50/90 text-emerald-600 border border-emerald-200 rounded-full px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md">
                            <span className="text-sm leading-none">🤝</span> Negotiable
                        </span>
                    )}
                </div>

                {/* Bottom Badges Area */}
                <AnimatePresence>
                    {product.stock < 10 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-3 left-3 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider backdrop-blur-sm z-10"
                        >
                            Only {product.stock} left!
                        </motion.div>
                    )}
                </AnimatePresence>
            </Link>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-grow">
                <Link to={`/seller/${typeof product.sellerId === 'object' ? (product.sellerId._id || product.sellerId.id) : product.sellerId}`} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-primary transition-colors line-clamp-1 mb-1">
                    {product.sellerName}
                </Link>
                <Link to={`/product/${product.id}`} className="block group/title mb-3">
                    <h3 className="font-bold text-[15px] leading-snug line-clamp-2 text-gray-800 group-hover/title:text-primary transition-colors font-body">
                        {product.name}
                    </h3>
                </Link>
                
                <div className="mt-auto">
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1.5 mb-3 bg-gray-50 border border-gray-100 w-max px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
                        <span className="text-xs font-bold text-gray-700">{product.rating}</span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-wide">({product.reviews} reviews)</span>
                    </div>
                    
                    {/* Price and Action Row */}
                    <div className="flex items-end justify-between pt-1">
                        <div className="flex flex-col">
                            {product.mrp > product.price && (
                                <span className="text-xs text-gray-400 line-through font-medium mb-0.5">₹{product.mrp.toLocaleString()}</span>
                            )}
                            <span className="font-black text-lg bg-clip-text text-transparent" style={{ backgroundImage: 'var(--btn-gradient)' }}>
                                ₹{product.price.toLocaleString()}
                            </span>
                        </div>

                        {currentUser?.role === 'customer' && (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAdd}
                                className={`relative overflow-hidden group/btn flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md ${added ? 'bg-emerald-500 shadow-emerald-500/20' : 'shadow-primary/20'}`}
                                style={added ? {} : { background: 'var(--btn-gradient)' }}
                            >
                                {added ? (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                                        ✓ Added
                                    </motion.span>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" /> 
                                        <span>Add</span>
                                    </>
                                )}
                                
                                {/* Shimmer effect on hover */}
                                {!added && (
                                    <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
