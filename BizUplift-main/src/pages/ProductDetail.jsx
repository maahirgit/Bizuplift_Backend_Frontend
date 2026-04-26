import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Share2, Truck, Shield, MessageCircle, X, Send, ChevronLeft, ChevronRight, Minus, Plus, MapPin, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const NegotiationChat = ({ product, seller, onClose, onDeal }) => {
    const { theme } = useTheme();
    const { showToast } = useNotifications();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [dealPrice, setDealPrice] = useState(null);
    const [roundCount, setRoundCount] = useState(0);
    const messagesEndRef = useRef(null);

    const isDiwali = theme === 'diwali';
    const FESTIVAL_EMOJIS = { diwali: '🪔', holi: '🎨', navratri: '💃', eid: '🌙', christmas: '🎄', rakhi: '🎀', onam: '🌸', lohri: '🔥', dussehra: '🏹', pongal: '🌾' };
    const festEmoji = FESTIVAL_EMOJIS[theme] || '🎊';

    const floorPrice = product.minPrice || Math.round(product.price * 0.75);
    const initialGreeting = `Namaste! ${festEmoji} Main hun ${seller?.business || 'BizUplift'} ki taraf se. Aapko "${product.name}" mein interest hai? Yeh ₹${product.price} mein listed hai — lekin festival season hai, toh baat karte hain! Aap kitna soch rahe hain?`;

    useEffect(() => {
        setMessages([{
            role: 'assistant',
            content: initialGreeting,
            timestamp: new Date()
        }]);
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const extractPrice = (text) => {
        const matches = text.match(/₹?\s*(\d{1,6})/g);
        if (matches) {
            const prices = matches.map(m => parseInt(m.replace(/[₹\s]/g, ''))).filter(p => p > 50 && p < 100000);
            return prices.length > 0 ? prices[0] : null;
        }
        return null;
    };

    const generateSellerResponse = (userText, round) => {
        const offeredPrice = extractPrice(userText);
        const currentFloor = floorPrice;
        const maxPrice = product.price;

        if (!offeredPrice) {
            const generalResponses = [
                `Arey, koi specific offer batao na! ${festEmoji} Yeh product ₹${maxPrice} ka hai, aap kitna soch rahe ho?`,
                `Haha, batao na kitna dena chahte ho! ${festEmoji} Main sunne ko ready hun.`,
                `Main samajh nahi paaya — kya price soch rahe ho aap? Ek number bolo! ${festEmoji}`,
            ];
            return { text: generalResponses[Math.floor(Math.random() * generalResponses.length)], deal: false };
        }

        if (offeredPrice >= maxPrice) {
            return {
                text: `Wah! ₹${maxPrice} se zyada? Aap toh bahut generous ho! ${festEmoji} Deal confirmed! ✅ Adding ₹${maxPrice} to your cart. Bohot shukriya!`,
                deal: true,
                price: maxPrice
            };
        }

        if (offeredPrice >= maxPrice * 0.95) {
            return {
                text: `Arre wah, bilkul sahi price! ${festEmoji} Deal confirmed! ✅ Adding ₹${offeredPrice} to your cart. Festival ki shubhkamnaayein!`,
                deal: true,
                price: offeredPrice
            };
        }

        if (offeredPrice >= currentFloor && round >= 2) {
            const finalPrice = Math.max(offeredPrice, currentFloor);
            return {
                text: `Theek hai bhai, aapke liye special! ${festEmoji} Deal confirmed! ✅ Adding ₹${finalPrice} to your cart. Itni achi baat-cheet ke baad mana kaise karun!`,
                deal: true,
                price: finalPrice
            };
        }

        if (offeredPrice >= currentFloor) {
            const counterPrice = Math.round((offeredPrice + maxPrice) * 0.5);
            const counterResponses = [
                `₹${offeredPrice}? Hmm, thoda kam hai... ${festEmoji} Yeh handmade product hai, bahut mehnat lagti hai! ₹${counterPrice} mein le lo, best price hai yeh!`,
                `Arre bhai, ₹${offeredPrice} mein toh material ka cost bhi nahi nikalta! 😅 Lekin festival hai, toh ₹${counterPrice} mein de sakta hun. Final offer!`,
                `Hmm, main samajhta hun budget tight hai. Lekin quality dekhiye! ${festEmoji} ₹${counterPrice} — is se kam mushkil hai. Deal karein?`,
            ];
            return { text: counterResponses[Math.floor(Math.random() * counterResponses.length)], deal: false };
        }

        if (offeredPrice < currentFloor * 0.7) {
            const tooLowResponses = [
                `Arre bhai, ₹${offeredPrice}?! 😱 Itne mein toh packaging bhi nahi aata! ${festEmoji} Seriously ₹${currentFloor + 50} se shuru karte hain. Yeh handmade hai, mass-produced nahi!`,
                `Haha, aap toh mazaak kar rahe ho! 😄 ₹${offeredPrice} mein toh kaam nahi chalega. ₹${currentFloor + 50} — yeh mera absolute minimum hai. ${festEmoji}`,
                `Nahi nahi, ₹${offeredPrice} bilkul possible nahi hai! ${festEmoji} Main ek free gift wrap add kar dunga ₹${currentFloor + 30} mein. Deal?`,
            ];
            return { text: tooLowResponses[Math.floor(Math.random() * tooLowResponses.length)], deal: false };
        }

        const lowResponses = [
            `₹${offeredPrice}... thoda aur badhao! ${festEmoji} ₹${Math.round((offeredPrice + maxPrice) * 0.45)} mein de sakta hun with free gift wrapping. Kya kehte ho?`,
            `Hmm, ₹${offeredPrice} mushkil hai lekin impossible nahi. ${festEmoji} ₹${currentFloor + Math.round((offeredPrice - currentFloor) * 0.3)} mein baat kar sakte hain agar aap 2 products lein!`,
            `Main chahta hun aapko de dun ₹${offeredPrice} mein, lekin seller bhi toh kamana chahta hai na! 😊 ₹${currentFloor + 20} — last price pakka. ${festEmoji}`,
        ];
        return { text: lowResponses[Math.floor(Math.random() * lowResponses.length)], deal: false };
    };

    const sendMessage = async (text) => {
        if (!text.trim() || loading || dealPrice) return;
        const userMsg = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const currentRound = roundCount + 1;
        setRoundCount(currentRound);

        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

        const response = generateSellerResponse(text, currentRound);
        const aiMsg = { role: 'assistant', content: response.text, timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);

        if (response.deal && response.price) {
            setDealPrice(response.price);
            showToast(`Deal at ₹${response.price}! Saved ₹${product.price - response.price}`, 'success');
        }

        setLoading(false);
    };

    const quickOffers = [
        Math.round(product.price * 0.95),
        Math.round(product.price * 0.90),
        Math.round(product.price * 0.85),
        Math.round(product.price * 0.80),
    ].filter(p => p >= floorPrice);

    const chatBg = isDiwali ? '#0D0221' : '#F5F7FB';
    const bubbleBg = isDiwali ? 'rgba(255,215,0,0.1)' : '#F3F4F6';
    const bubbleText = isDiwali ? '#FFF8E7' : '#1F2937';

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
            <div className="w-full md:max-w-md md:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '80vh', maxHeight: '600px', background: chatBg }}>
                <div className="flex items-center gap-3 p-4 border-b" style={{ background: 'var(--btn-gradient)', borderColor: 'transparent' }}>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">🤝</div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm">AI Seller Agent</h3>
                        <p className="text-white/70 text-xs truncate">{seller?.business || 'BizUplift Seller'} · {product.name.slice(0, 25)}...</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/30 text-green-200 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Online
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white ml-1 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: chatBg }}>
                    <div className="text-center">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: isDiwali ? 'rgba(255,215,0,0.1)' : 'rgba(0,0,0,0.05)', color: isDiwali ? '#FFD700' : '#9CA3AF' }}>
                            Listed Price: ₹{product.price} · Floor: Negotiable
                        </span>
                    </div>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'text-white rounded-2xl rounded-br-sm'
                                        : 'rounded-2xl rounded-bl-sm'
                                    }`}
                                style={
                                    msg.role === 'user'
                                        ? { background: 'var(--btn-gradient)' }
                                        : { background: bubbleBg, color: bubbleText }
                                }
                            >
                                {msg.content}
                                <div className="text-[10px] opacity-50 mt-1 text-right">
                                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: bubbleBg }}>
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'rgb(var(--color-primary))', animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {dealPrice && (
                    <div className="px-4 py-3" style={{ background: isDiwali ? 'rgba(16,185,129,0.15)' : '#F0FDF4', borderTop: isDiwali ? '1px solid rgba(16,185,129,0.3)' : '1px solid #BBF7D0' }}>
                        <button
                            onClick={() => { onDeal(dealPrice); onClose(); }}
                            className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                        >
                            🎉 Add to Cart at ₹{dealPrice}
                            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                Saved ₹{product.price - dealPrice}
                            </span>
                        </button>
                    </div>
                )}

                {!dealPrice && quickOffers.length > 0 && (
                    <div className="px-4 py-2" style={{ borderTop: isDiwali ? '1px solid rgba(255,215,0,0.15)' : '1px solid #E5E7EB' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: isDiwali ? 'rgba(255,248,231,0.4)' : '#9CA3AF' }}>Quick offers:</p>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {quickOffers.map(price => (
                                <button
                                    key={price}
                                    onClick={() => sendMessage(`I'd like to offer ₹${price} for this.`)}
                                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                    style={{
                                        border: '1.5px solid rgb(var(--color-primary))',
                                        color: isDiwali ? '#FFD700' : 'rgb(var(--color-primary))',
                                        background: isDiwali ? 'rgba(255,215,0,0.1)' : 'transparent',
                                    }}
                                >
                                    ₹{price}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!dealPrice && (
                    <div className="p-3 flex gap-2" style={{ borderTop: isDiwali ? '1px solid rgba(255,215,0,0.15)' : '1px solid #E5E7EB', background: isDiwali ? 'rgba(13,2,33,0.95)' : '#FFFFFF' }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                            placeholder="Type your offer or message..."
                            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none font-body"
                            style={{
                                border: isDiwali ? '1px solid rgba(255,215,0,0.3)' : '1px solid #E5E7EB',
                                background: isDiwali ? 'rgba(255,215,0,0.05)' : '#F9FAFB',
                                color: isDiwali ? '#FFF8E7' : '#1F2937',
                            }}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={loading || !input.trim()}
                            className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'var(--btn-gradient)' }}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, sellers, getProductReviews, fetchProductReviews, isWishlisted, toggleWishlist, addReview, isDataLoading } = useData();
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const { showToast } = useNotifications();
    const { theme } = useTheme();

    const isDiwali = theme === 'diwali';
    const [chatOpen, setChatOpen] = useState(false);
    const [negotiatedPrice, setNegotiatedPrice] = useState(null);
    const [pincode, setPincode] = useState('');
    const [delivery, setDelivery] = useState('');
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [imageHover, setImageHover] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const product = products.find(p => p.id === id);
    const seller = product ? sellers.find(s => s.id === (typeof product.sellerId === 'object' ? (product.sellerId?._id || product.sellerId?.id) : product.sellerId)) : null;
    const reviews = product ? getProductReviews(product.id) : [];
    const wishlisted = product ? isWishlisted(product.id) : false;

    useEffect(() => {
        if (product) {
            fetchProductReviews(product.id);
        }
    }, [product?.id, fetchProductReviews]);

    if (isDataLoading) return <LoadingSpinner fullPage />;

    if (!product) return (
        <div className="container py-20 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2">Product not found</h2>
            <Link to="/marketplace" className="text-primary hover:underline">Back to Marketplace</Link>
        </div>
    );

    const savings = product.mrp - product.price;
    const savingsPct = Math.round((savings / product.mrp) * 100);
    const displayPrice = negotiatedPrice || product.price;

    const handleAddToCart = () => {
        addToCart(product, quantity, negotiatedPrice);
        showToast(`Added ${quantity}x ${product.name.slice(0, 25)}... to cart!`);
    };

    const handleDeal = (price) => {
        setNegotiatedPrice(price);
        addToCart(product, quantity, price);
        showToast(`Deal! Added at ₹${price}. Saved ₹${product.price - price}!`);
    };

    const handlePincode = () => {
        if (pincode.length === 6) setDelivery(`Estimated delivery: ${new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!currentUser) { navigate('/auth'); return; }
        addReview({ ...reviewForm, productId: product.id, userId: currentUser.id, userName: currentUser.name });
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', body: '' });
        showToast('Review submitted! You earned 50 credit points');
    };

    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : product.rating;

    return (
        <div className="container py-6 pb-20 lg:pb-10 font-body">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 opacity-50" />
                <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                <ChevronRight className="w-3 h-3 opacity-50" />
                <span className="line-clamp-1" style={{ color: isDiwali ? '#FFF8E7' : '#1F2937' }}>{product.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
                {/* LEFT: Sticky Gallery */}
                <div className="w-full lg:w-5/12 lg:sticky lg:top-24">
                    <div
                        className="relative aspect-[4/5] md:aspect-square rounded-xl overflow-hidden mb-4 border border-gray-100 shadow-sm"
                        style={{ background: isDiwali ? 'rgba(20,5,50,0.5)' : '#fff' }}
                    >
                        <img
                            src={product.images[activeImage]}
                            alt={product.name}
                            className="w-full h-full object-contain p-2 md:p-6 transition-transform duration-500 hover:scale-105"
                        />
                        {negotiatedPrice && (
                            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-sm text-xs font-bold shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                                🤝 Negotiated
                            </div>
                        )}
                        {currentUser?.role === 'customer' && (
                            <button
                                onClick={() => currentUser ? toggleWishlist(product.id) : navigate('/auth')}
                                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 border ${wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-400'}`}
                            >
                                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
                            </button>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {product.images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all p-1 bg-white ${activeImage === i ? 'border-primary' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} alt="" className="w-full h-full object-contain" />
                            </button>
                        ))}
                    </div>

                    {currentUser?.role === 'customer' && (
                        <div className="hidden lg:flex gap-4 mt-6">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-sm font-bold bg-[#ff9f00] hover:bg-[#ff9000] text-white text-lg transition-colors shadow-sm"
                            >
                                <ShoppingBag className="w-5 h-5 fill-white" /> ADD TO CART
                            </button>
                            {product.negotiable && (
                                <button
                                    onClick={() => setChatOpen(true)}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-sm font-bold bg-[#fb641b] hover:bg-[#f35b12] text-white text-lg transition-colors shadow-sm"
                                >
                                    <MessageCircle className="w-5 h-5" /> NEGOTIATE
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: Scrollable Details */}
                <div className="flex-1 w-full pb-10">
                    {/* Title & Ratings */}
                    <div className="mb-4">
                        <Link to={`/seller/${product.sellerId}`} className="inline-flex items-center gap-1 mb-2 text-sm font-bold hover:underline transition-colors text-primary uppercase tracking-wide">
                            {product.sellerName}'s Store <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                        <h1 className="text-2xl md:text-[28px] font-normal mb-3 leading-snug" style={{ color: isDiwali ? '#FFF' : '#212121' }}>
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-sm text-xs">
                                {avgRating} <Star className="w-3 h-3 fill-white text-white" />
                            </div>
                            <span className="hover:text-primary cursor-pointer transition-colors">{reviews.length || product.reviews} Ratings & Reviews</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400 opacity-50" />
                            <span className="flex items-center gap-1 text-primary"><Shield className="w-3.5 h-3.5" /> Assured</span>
                        </div>
                    </div>

                    {/* Pricing Block */}
                    <div className="mb-6 pt-4 border-t border-gray-100">
                        {negotiatedPrice && <div className="text-sm font-bold text-green-600 mb-2 uppercase tracking-wide bg-green-50 w-fit px-3 py-1 rounded">🤝 Special Negotiated Deal Applied</div>}
                        <div className="flex items-end gap-3 mb-1">
                            <span className="text-[32px] leading-none font-bold text-gray-900" style={{ color: isDiwali ? '#fff' : '#212121' }}>₹{displayPrice}</span>
                            {product.mrp > product.price && <span className="text-base text-gray-500 line-through mb-1">₹{product.mrp}</span>}
                            {savingsPct > 0 && !negotiatedPrice && <span className="text-base font-bold text-green-600 mb-1">{savingsPct}% off</span>}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Inclusive of all taxes</p>
                    </div>

                    {/* Available Offers */}
                    <div className="mb-8 font-body">
                        <h3 className="font-bold text-base mb-3" style={{ color: isDiwali ? '#fff' : '#212121' }}>Available offers</h3>
                        <ul className="space-y-3 text-sm" style={{ color: isDiwali ? '#ddd' : '#212121' }}>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5"><img src="https://rukminim2.flixcart.com/www/36/36/promos/06/09/2016/c22c9fc4-0555-4460-8401-bf5c28d7ba29.png?q=90" alt="tag" className="w-4 h-4" /></span>
                                <span className="flex-1"><span className="font-bold">Bank Offer</span> 10% Instant Discount on SBI Credit Cards. <span className="text-primary cursor-pointer hover:underline font-bold">T&C</span></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5"><img src="https://rukminim2.flixcart.com/www/36/36/promos/06/09/2016/c22c9fc4-0555-4460-8401-bf5c28d7ba29.png?q=90" alt="tag" className="w-4 h-4" /></span>
                                <span className="flex-1"><span className="font-bold">Partner Offer</span> Sign up for BizUplift Pay Later and get ₹500 Edge Reward Points. <span className="text-primary cursor-pointer hover:underline font-bold">Know More</span></span>
                            </li>
                            {product.negotiable && !negotiatedPrice && (
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-blue-500"><MessageCircle className="w-4 h-4 fill-blue-500" /></span>
                                    <span className="flex-1"><span className="font-bold">Seller Offer</span> Price is negotiable for this festival season! <button onClick={() => setChatOpen(true)} className="text-primary font-bold hover:underline ml-1">Chat & Negotiate Now</button></span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Delivery & Pincode */}
                    <div className="flex flex-col md:flex-row md:items-start gap-1 mb-8 pt-6 border-t border-gray-100">
                        <div className="w-full md:w-32 text-sm font-bold text-gray-500 md:pt-1">Delivery</div>
                        <div className="flex-1 max-w-sm">
                            <div className="relative border-b-2 border-primary pb-1 mb-2 flex items-center">
                                <MapPin className="w-5 h-5 text-primary mr-2" />
                                <input
                                    value={pincode}
                                    onChange={e => setPincode(e.target.value.slice(0, 6))}
                                    placeholder="Enter Delivery Pincode"
                                    className="w-full bg-transparent outline-none py-1 font-bold text-sm transition-colors"
                                    style={{ color: isDiwali ? '#fff' : '#212121' }}
                                />
                                <button onClick={handlePincode} className="text-primary text-sm font-bold hover:underline">Check</button>
                            </div>
                            {delivery ? (
                                <div className="text-sm">
                                    <span className="font-bold text-gray-900" style={{ color: isDiwali ? '#fff' : '#212121' }}>{delivery}</span> <br/>
                                    <span className="text-gray-500 font-medium mt-1 inline-block">Free Delivery on orders above ₹999</span>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-500">Please enter a PIN code to check delivery time</span>
                            )}
                        </div>
                    </div>

                    {/* Stock & Quantity */}
                    <div className="flex flex-col md:flex-row md:items-center gap-1 mb-8">
                         <div className="w-full md:w-32 text-sm font-bold text-gray-500">Quantity</div>
                        <div className="flex items-center gap-6">
                            {product.stock > 0 && (
                                <div className="flex items-center border border-gray-300 rounded overflow-hidden shadow-sm">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 font-bold transition-colors"><Minus className="w-3 h-3 text-gray-600" /></button>
                                    <span className="px-5 py-1.5 font-bold text-sm bg-white" style={{color: '#000'}}>{quantity}</span>
                                    <button onClick={() => setQuantity(q => Math.min(20, product.stock, q + 1))} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 font-bold transition-colors"><Plus className="w-3 h-3 text-gray-600" /></button>
                                </div>
                            )}
                            <div>
                                {product.stock > 0 ? (
                                    <span className="text-sm font-bold text-green-600">In Stock</span>
                                ) : (
                                    <span className="text-sm font-bold text-red-600">Out of Stock</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Highlights & Description */}
                    <div className="border border-gray-200 rounded-lg mb-8 overflow-hidden bg-white shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-medium text-gray-900">Product Highlights</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-8">
                                <ul className="flex-1 space-y-3 text-sm text-gray-800">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400 flex-shrink-0" /> <span className="font-semibold text-gray-500 w-24">Material</span> Authentic local material</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400 flex-shrink-0" /> <span className="font-semibold text-gray-500 w-24">Category</span> {product.festival} Festival</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400 flex-shrink-0" /> <span className="font-semibold text-gray-500 w-24">Origin</span> {seller?.state || 'India'}</li>
                                </ul>
                                <ul className="flex-1 space-y-3 text-sm text-gray-800">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400 flex-shrink-0" /> <span className="font-semibold text-gray-500 w-24">Payment</span> Cash on Delivery Available</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400 flex-shrink-0" /> <span className="font-semibold text-gray-500 w-24">Returns</span> 7 Days Easy Returns</li>
                                </ul>
                            </div>
                            
                            <h3 className="font-bold text-gray-600 mb-2 uppercase tracking-wider text-xs">Description</h3>
                            <p className="text-sm text-gray-800 leading-relaxed mb-4">{product.description}</p>
                            
                            {product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                    {product.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-gray-50 rounded-full text-xs font-semibold text-gray-500 border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ratings & Reviews */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden mb-10 bg-white shadow-sm">
                         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-medium text-gray-900">Ratings & Reviews</h2>
                            <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Rate Product</button>
                        </div>
                        <div className="p-6">
                            {showReviewForm && (
                                <form onSubmit={handleReviewSubmit} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                                                <Star className={`w-8 h-8 transition-colors ${s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <input value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} placeholder="Review title (e.g., Excellent craftsmanship!)" required className="w-full px-4 py-3 border border-gray-300 rounded text-sm mb-4 outline-none focus:border-primary bg-white shadow-sm" />
                                    <textarea value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} placeholder="Share your experience..." required rows={4} className="w-full px-4 py-3 border border-gray-300 rounded text-sm mb-4 outline-none focus:border-primary resize-none bg-white shadow-sm" />
                                    <button type="submit" className="px-8 py-3 rounded text-white font-bold transition-colors hover:opacity-90 shadow-sm" style={{ background: 'var(--btn-gradient)' }}>SUBMIT REVIEW</button>
                                </form>
                            )}
                            
                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100"><Star className="w-6 h-6 text-gray-300" /></div>
                                        <p className="text-gray-500 font-medium">No reviews yet. Be the first to rate this product!</p>
                                    </div>
                                ) : reviews.map(review => (
                                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
                                            <div className="flex items-center gap-0.5 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold w-fit">
                                                {review.rating} <Star className="w-3 h-3 fill-white" />
                                            </div>
                                            <span className="font-bold text-gray-900">{review.title}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 leading-relaxed mb-4">{review.body}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <span className="font-bold">{review.userName}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-gray-400 bg-gray-100 rounded-full p-0.5" /> Certified Buyer</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span>{new Date(review.createdAt).toLocaleDateString('en-IN', {month: 'short', year: 'numeric'})}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {currentUser?.role === 'customer' && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-40 flex shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 py-3.5 mx-1 font-bold bg-[#ff9f00] text-white text-sm"
                        >
                            ADD TO CART
                        </button>
                        {product.negotiable && (
                            <button
                                onClick={() => setChatOpen(true)}
                                className="flex-1 py-3.5 mx-1 font-bold bg-[#fb641b] text-white text-sm"
                            >
                                NEGOTIATE
                            </button>
                        )}
                    </div>
                )}
            </div>

            {chatOpen && <NegotiationChat product={product} seller={seller} onClose={() => setChatOpen(false)} onDeal={handleDeal} />}
        </div>
    );
};

export default ProductDetail;
