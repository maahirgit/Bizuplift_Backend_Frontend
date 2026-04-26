import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, BASE_URL } from '../utils/api';
import { useAuth } from './AuthContext';
const BACKEND_URL = BASE_URL.replace('/api', '');

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { currentUser, isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [wishlists, setWishlists] = useState({ current: [] });
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataError, setDataError] = useState(null);

    // ─── Wishlist Auto-fetch ────────────────────────────────────────────────
    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setWishlists({ current: [] });
        }
    }, [isAuthenticated]);

    // ─── Normalize MongoDB document IDs ──────────────────────────────────────
    // MongoDB uses `_id` but the frontend often uses `.id`.
    // Map _id → id for seamless compatibility.
    const normalize = (docs) =>
        docs.map(d => {
            const id = d._id || d.id;
            // If sellerId is populated (object), keep its _id as the primary reference for links/filters
            const sellerId = typeof d.sellerId === 'object' && d.sellerId !== null ? (d.sellerId._id || d.sellerId.id) : d.sellerId;
            const customerId = typeof d.customerId === 'object' && d.customerId !== null ? (d.customerId._id || d.customerId.id) : d.customerId;
            
            // Normalize image URLs (prepend backend URL if path is relative)
            const images = d.images?.map(img => 
                (img && !img.startsWith('http')) ? `${BACKEND_URL}${img}` : img
            );

            // Also normalize single image field if it exists (e.g. in posts or orders)
            const image = (d.image && !d.image.startsWith('http')) ? `${BACKEND_URL}${d.image}` : d.image;

            return { ...d, id: id?.toString(), sellerId: sellerId?.toString(), customerId: customerId?.toString(), images, image };
        });

    // ─── Initial Data Fetch from Backend ─────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            setIsDataLoading(true);
            setDataError(null);
            try {
                const [productsRes, sellersRes, postsRes] = await Promise.all([
                    api.get('/products?limit=100'),
                    api.get('/sellers'),
                    api.get('/posts'),
                ]);
                setProducts(normalize(Array.isArray(productsRes) ? productsRes : productsRes.products || []));
                setSellers(normalize(Array.isArray(sellersRes) ? sellersRes : sellersRes.sellers || []));
                setPosts(normalize(Array.isArray(postsRes) ? postsRes : postsRes.posts || []));
            } catch (err) {
                console.error('[DataContext] Failed to fetch initial data:', err);
                setDataError('Failed to load data. Please check your internet connection and try again.');
            } finally {
                setIsDataLoading(false);
            }
        };
        fetchAll();
    }, []);

    // ─── Authenticated Data Fetch (Orders & Users) ──────────────────────────
    useEffect(() => {
        if (isAuthenticated) {
            const fetchAuthData = async () => {
                try {
                    const promises = [api.get('/orders')];
                    if (currentUser?.role === 'admin') promises.push(api.get('/users'));
                    
                    const [ordersRes, usersRes] = await Promise.all(promises);
                    setOrders(normalize(Array.isArray(ordersRes) ? ordersRes : ordersRes.orders || []));
                    if (usersRes) setUsers(normalize(Array.isArray(usersRes) ? usersRes : usersRes.users || []));
                } catch (err) {
                    console.warn('[DataContext] Failed to fetch authenticated data:', err);
                }
            };
            fetchAuthData();
        }
    }, [isAuthenticated, currentUser]);

    // ─── Products ─────────────────────────────────────────────────────────────
    const addProduct = async (product) => {
        const res = await api.post('/products', product);
        const newProduct = res.product || res;
        setProducts(prev => [{ ...newProduct, id: newProduct._id }, ...prev]);
        return newProduct;
    };

    const updateProduct = async (id, updates) => {
        const updated = await api.put(`/products/${id}`, updates);
        setProducts(prev => prev.map(p => (p.id === id || p._id === id) ? { ...updated, id: updated._id } : p));
    };

    const deleteProduct = async (id) => {
        await api.delete(`/products/${id}`);
        setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
    };

    // ─── Orders ───────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        const data = await api.get('/orders');
        const normalized = normalize(Array.isArray(data) ? data : data.orders || []);
        setOrders(normalized);
        return normalized;
    }, []);

    const addOrder = async (order) => {
        const res = await api.post('/orders', order);
        const newOrder = res.order || res; // Handle if backend returns { success: true, order: {...} }
        setOrders(prev => [...prev, { ...newOrder, id: newOrder._id }]);
        return newOrder;
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            setOrders(prev => prev.map(o => (o.id === id || o._id === id) ? { ...o, status } : o));
        } catch (err) {
            console.error('[DataContext] Failed to update order status:', err);
            throw err;
        }
    };

    // ─── Posts ────────────────────────────────────────────────────────────────
    const addPost = async (post) => {
        const res = await api.post('/posts', post);
        const newPost = res.post || res;
        setPosts(prev => [{ ...newPost, id: newPost._id }, ...prev]);
        return newPost;
    };

    const toggleLike = async (postId, userId) => {
        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p.id !== postId && p._id !== postId) return p;
            const likedBy = p.likedBy || [];
            const liked = likedBy.includes(userId);
            return { ...p, likes: liked ? p.likes - 1 : p.likes + 1, likedBy: liked ? likedBy.filter(id => id !== userId) : [...likedBy, userId] };
        }));
        try {
            await api.put(`/posts/${postId}/like`, { userId });
        } catch {
            // Revert on failure
            setPosts(prev => prev.map(p => {
                if (p.id !== postId && p._id !== postId) return p;
                const likedBy = p.likedBy || [];
                const liked = likedBy.includes(userId);
                return { ...p, likes: liked ? p.likes - 1 : p.likes + 1, likedBy: liked ? likedBy.filter(id => id !== userId) : [...likedBy, userId] };
            }));
        }
    };

    // ─── Wishlist ─────────────────────────────────────────────────────────────
    const fetchWishlist = useCallback(async () => {
        try {
            const data = await api.get('/wishlist');
            const products = data.products || data || [];
            const ids = products.map(p => p._id || p.id || p);
            setWishlists(prev => ({ ...prev, current: ids }));
            return ids;
        } catch { return []; }
    }, []);

    const toggleWishlist = async (productId) => {
        try {
            const data = await api.post('/wishlist/toggle', { productId });
            if (data.success) {
                setWishlists(prev => ({ ...prev, current: data.productIds }));
                return data.wishlisted;
            }
        } catch (err) {
            console.error('[Wishlist] Toggle failed:', err);
            throw err;
        }
    };

    const isWishlisted = (productId) => (wishlists.current || []).includes(productId);

    // ─── Reviews ──────────────────────────────────────────────────────────────
    const addReview = async (review) => {
        const res = await api.post('/reviews', review);
        const newReview = res.review || res;
        setReviews(prev => [...prev, { ...newReview, id: newReview._id }]);
        return newReview;
    };

    const getProductReviews = (productId) =>
        reviews.filter(r => r.productId === productId || r.productId?._id === productId);

    const fetchProductReviews = useCallback(async (productId) => {
        const data = await api.get(`/reviews/product/${productId}`);
        const normalized = normalize(Array.isArray(data) ? data : data.reviews || []);
        setReviews(prev => {
            const filtered = prev.filter(r => r.productId !== productId && r.productId?._id !== productId);
            return [...filtered, ...normalized];
        });
        return normalized;
    }, []);

    // ─── Credits ──────────────────────────────────────────────────────────────
    const addCredits = async (userId, points, action) => {
        if (!userId) return;
        try {
            await api.post('/credits/add', { userId, points, action });
        } catch (err) {
            console.warn('[Credits] Failed to save credits to backend:', err);
        }
    };

    const getUserCredits = useCallback(async (userId) => {
        try {
            const data = await api.get(`/credits/me`);
            return data;
        } catch { return { balance: 0, transactions: [] }; }
    }, []);

    const redeemCredits = async (points) => {
        if (!points || points <= 0) return;
        try {
            await api.post('/credits/redeem', { points });
        } catch (err) {
            console.warn('[Credits] Failed to redeem credits:', err);
        }
    };

    // ─── Sellers ─────────────────────────────────────────────────────────────
    const createSellerProfile = async (profile) => {
        const res = await api.post('/sellers', profile);
        const newSeller = res.seller || res;
        setSellers(prev => [...prev, { ...newSeller, id: newSeller._id }]);
        return newSeller._id || newSeller.id;
    };

    // ─── Negotiations ─────────────────────────────────────────────────────────
    const saveNegotiation = async (negotiation) => {
        try {
            await api.post('/negotiations', negotiation);
        } catch (err) {
            console.warn('[Negotiations] Failed to save negotiation:', err);
        }
    };

    return (
        <DataContext.Provider value={{
            // Data
            products, sellers, posts, orders, reviews, wishlists, users,
            isDataLoading, dataError,

            // Products
            addProduct, updateProduct, deleteProduct,

            // Orders
            fetchOrders, addOrder, updateOrderStatus,

            // Posts / Community
            addPost, toggleLike,

            // Wishlist
            fetchWishlist, toggleWishlist, isWishlisted,

            // Reviews
            addReview, getProductReviews, fetchProductReviews,

            // Credits
            addCredits, getUserCredits, redeemCredits,

            // Sellers
            createSellerProfile,

            // Negotiations
            saveNegotiation,

            // Users — legacy compat stubs (now handled by AuthContext)
            registerUser: () => { console.warn('Use AuthContext.register() instead'); },
            updateUser: () => { console.warn('Use AuthContext.updateCurrentUser() instead'); },
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
