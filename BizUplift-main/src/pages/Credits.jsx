import { Link } from 'react-router-dom';
import { Star, Gift, TrendingUp, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const HOW_TO_EARN = [
    { emoji: '🛒', action: 'Make a Purchase', points: '₹1 = 1 point', desc: 'Earn points on every order' },
    { emoji: '⭐', action: 'Write a Review', points: '50 points', desc: 'Share your experience' },
    { emoji: '📝', action: 'Community Post', points: '25 points', desc: 'Post tips, stories & reviews' },
    { emoji: '👥', action: 'Refer a Friend', points: '200 points', desc: 'When they make first purchase' },
    { emoji: '🎂', action: 'Birthday Bonus', points: '100 points', desc: 'On your birthday month' },
    { emoji: '🆕', action: 'Welcome Bonus', points: '100 points', desc: 'Just for signing up' },
];

const HOW_TO_REDEEM = [
    { emoji: '💰', action: 'Cart Discount', desc: 'Use up to 10% of order value as discount', min: 100 },
    { emoji: '🚚', action: 'Free Delivery', desc: 'Redeem 50 points for free delivery', min: 50 },
    { emoji: '🎁', action: 'Exclusive Products', desc: 'Unlock special credit-only products', min: 500 },
];

const Credits = () => {
    const { currentUser } = useAuth();
    const { getUserCredits } = useData();
    const [userCredits, setUserCredits] = useState({ balance: 0, transactions: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            getUserCredits(currentUser.id).then(data => {
                if (data) {
                    setUserCredits({ 
                        balance: data.balance || 0, 
                        transactions: data.transactions || [] 
                    });
                }
                setLoading(false);
            }).catch(() => {
                setUserCredits({ balance: 0, transactions: [] });
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [currentUser, getUserCredits]);

    return (
        <div className="container py-8 pb-20 lg:pb-12 max-w-4xl animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-heading font-black mb-2 flex items-center justify-center md:justify-start gap-3">
                        <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
                        BizUplift Rewards
                    </h1>
                    <p className="text-gray-500 font-medium">Turn your shopping into savings and exclusive benefits.</p>
                </div>
                {currentUser && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" /> Verified Member
                    </div>
                )}
            </div>

            {/* Main Balance Card */}
            {currentUser ? (
                <div className="relative overflow-hidden rounded-[2.5rem] p-10 text-white shadow-[0_30px_60px_-15px_rgba(232,93,4,0.3)] mb-12" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #E85D04 100%)' }}>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Available Points</span>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <span className="text-7xl font-black tracking-tighter leading-none">{userCredits.balance}</span>
                                    <div className="text-left">
                                        <p className="text-xl font-bold leading-tight">Points</p>
                                        <p className="text-white/70 text-sm font-medium">≈ ₹{userCredits.balance} value</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                <Link to="/marketplace" className="px-8 py-4 bg-white text-orange-600 rounded-2xl font-black text-center shadow-xl hover:scale-105 transition-transform">
                                    Shop & Earn More
                                </Link>
                                <Link to="/cart" className="px-8 py-4 bg-black/20 text-white rounded-2xl font-bold text-center border border-white/20 hover:bg-black/30 transition-colors">
                                    Redeem in Cart
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/20">
                            <div className="text-center">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                                <p className="text-lg font-bold flex items-center justify-center gap-1"><Award className="w-4 h-4" /> Gold</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Lifetime</p>
                                <p className="text-lg font-bold">{userCredits.balance + 100}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Expired</p>
                                <p className="text-lg font-bold">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="festival-card rounded-[2.5rem] p-12 text-center mb-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 group-hover:rotate-12 transition-transform">⭐</div>
                        <h3 className="text-3xl font-black mb-3">Join Our Rewards Program</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg font-medium">Start earning points on every purchase and unlock exclusive festival rewards.</p>
                        <Link to="/auth" className="inline-block px-10 py-4 rounded-2xl font-black text-white text-lg shadow-lg hover:shadow-primary/30 transition-all" style={{ background: 'var(--btn-gradient)' }}>
                            Sign Up Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Two Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* How to Earn */}
                <div className="festival-card rounded-[2rem] p-8 shadow-xl">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-primary" />
                        Ways to Earn
                    </h2>
                    <div className="grid gap-3">
                        {HOW_TO_EARN.map(item => (
                            <div key={item.action} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-gray-100">
                                <div className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{item.action}</p>
                                    <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-primary" style={{ color: 'rgb(var(--color-primary))' }}>{item.points.split('=')[1] || item.points}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How to Redeem */}
                <div className="festival-card rounded-[2rem] p-8 shadow-xl border-2 border-primary/5">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <Gift className="w-6 h-6 text-primary" />
                        Ways to Redeem
                    </h2>
                    <div className="space-y-4">
                        {HOW_TO_REDEEM.map(item => (
                            <div key={item.action} className="relative p-6 rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className="text-4xl">{item.emoji}</div>
                                    <div className="flex-1">
                                        <p className="font-black text-lg text-gray-800">{item.action}</p>
                                        <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Requirement</span>
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black">Min {item.min} Points</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Transaction History */}
            {currentUser && (
                <div className="festival-card rounded-[2rem] p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            All Transactions
                        </h2>
                        <span className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                            Showing {userCredits.transactions?.length || 0} items
                        </span>
                    </div>
                    
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">Loading history...</p>
                        </div>
                    ) : userCredits.transactions?.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="text-6xl mb-4 opacity-20">📜</div>
                            <h3 className="text-xl font-bold text-gray-400">No Transactions Found</h3>
                            <p className="text-gray-400 max-w-xs mx-auto mt-2">Start shopping or complete activities to earn your first reward points!</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {userCredits.transactions.map((tx, idx) => (
                                <div key={tx.id || idx} className="group flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${tx.type === 'earn' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {tx.type === 'earn' ? '✨' : '💸'}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-800 group-hover:text-primary transition-colors">{tx.action}</p>
                                            <p className="text-sm font-medium text-gray-400">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-black ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.type === 'earn' ? '+' : '-'}{tx.points}
                                        </span>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Points</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Credits;
