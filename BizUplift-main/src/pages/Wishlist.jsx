import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

const Wishlist = () => {
    const { products, wishlists, toggleWishlist } = useData();
    const { currentUser } = useAuth();
    const { addToCart } = useCart();
    const { showToast } = useNotifications();

    const wishlistIds = wishlists.current || [];
    const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

    if (!currentUser) return (
        <div className="container py-20 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold mb-2">Your Wishlist</h2>
            <p className="text-gray-500 mb-6">Sign in to save your favourite products</p>
            <Link to="/auth" className="px-6 py-3 rounded-full font-bold text-white" style={{ background: 'var(--btn-gradient)' }}>Sign In</Link>
        </div>
    );

    if (wishlistProducts.length === 0) return (
        <div className="container py-20 text-center pb-20 lg:pb-6">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save products you love by tapping the heart icon</p>
            <Link to="/marketplace" className="px-6 py-3 rounded-full font-bold text-white" style={{ background: 'var(--btn-gradient)' }}>Explore Products</Link>
        </div>
    );

    return (
        <div className="container py-6 pb-20 lg:pb-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-heading font-bold">My Wishlist ({wishlistProducts.length})</h1>
                <button onClick={() => { wishlistIds.forEach(id => toggleWishlist(id)); showToast('Wishlist cleared'); }} className="text-sm text-red-500 hover:underline">Clear All</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistProducts.map(product => (
                    <div key={product.id} className="festival-card rounded-2xl overflow-hidden group">
                        <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-2 left-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'rgb(var(--color-primary))' }}>{product.festival}</span>
                            </div>
                        </Link>
                        <div className="p-3">
                            <Link to={`/product/${product.id}`}>
                                <h3 className="font-semibold text-sm line-clamp-2 mb-1 hover:text-primary transition-colors">{product.name}</h3>
                            </Link>
                            <p className="text-xs text-gray-500 mb-2">{product.sellerName}</p>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm" style={{ color: 'rgb(var(--color-primary))' }}>₹{product.price}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => { addToCart(product); showToast(`${product.name.slice(0, 20)}... added to cart!`); }} className="p-1.5 rounded-lg text-white" style={{ background: 'var(--btn-gradient)' }}>
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => toggleWishlist(product.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
