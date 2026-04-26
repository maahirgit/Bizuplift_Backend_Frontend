import { useState } from 'react';
import { Heart, MessageCircle, Plus, X, Send } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const POST_TYPES = ['All', 'review', 'tip', 'seller_story'];

const Community = () => {
    const { posts, addPost, toggleLike } = useData();
    const { currentUser } = useAuth();
    const { showToast } = useNotifications();
    const [activeType, setActiveType] = useState('All');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPost, setNewPost] = useState({ type: 'review', content: '' });

    const filtered = posts.filter(p => {
        if (activeType !== 'All' && p.type !== activeType) return false;
        return true;
    });

    const handleLike = (postId) => {
        if (!currentUser) { showToast('Sign in to like posts', 'info'); return; }
        toggleLike(postId, currentUser.id);
    };

    const handleCreatePost = async () => {
        if (!currentUser) { showToast('Sign in to post', 'info'); return; }
        if (!newPost.content.trim()) { showToast('Write something!', 'error'); return; }
        try {
            await addPost({ ...newPost, authorId: currentUser.id, authorName: currentUser.name, authorAvatar: currentUser.avatar, image: null });
            setNewPost({ type: 'review', content: '' });
            setShowCreatePost(false);
            showToast('Post shared! You earned 25 credit points 🌟');
        } catch (err) {
            console.error('Failed to create post:', err);
            showToast('Failed to share post. Please try again.', 'error');
        }
    };

    const typeLabels = { review: 'Review', tip: 'Tip', seller_story: 'Seller Story' };

    return (
        <div className="min-h-screen bg-[#F4F4F2] pt-12 pb-24">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header section mimicking the screenshot */}
                <div className="text-center mb-14">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Community love</h1>
                    <p className="text-gray-700 text-lg mb-8 font-medium">See what the community is saying about BizUplift. Share the love!</p>
                    <button onClick={() => setShowCreatePost(true)} className="px-8 py-3.5 rounded-full font-bold text-white text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" style={{ background: 'var(--btn-gradient)' }}>
                        <Plus className="w-4 h-4 inline-block mr-2 relative -top-0.5" /> Share your experience
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-12">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden w-full md:w-auto px-4 md:px-0">
                        {POST_TYPES.map(type => (
                            <button key={type} onClick={() => setActiveType(type)} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${activeType === type ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} style={activeType === type ? { background: 'rgb(var(--color-primary))' } : {}}>
                                {type === 'All' ? 'All Posts' : typeLabels[type]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create Post Modal */}
                {showCreatePost && (
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4 backdrop-blur-sm">
                        <div className="w-full md:max-w-lg bg-white md:rounded-3xl p-6 shadow-2xl animate-fade-in-up">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-xl">Create Post</h3>
                                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="flex gap-2 mb-4">
                                {['review', 'tip', 'seller_story'].map(type => (
                                    <button key={type} onClick={() => setNewPost(p => ({ ...p, type }))} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${newPost.type === type ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={newPost.type === type ? { background: 'rgb(var(--color-primary))' } : {}}>
                                        {typeLabels[type]}
                                    </button>
                                ))}
                            </div>
                            <textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} placeholder="Share your experience, tip, or story..." rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none mb-5 focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreatePost(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors">Cancel</button>
                                <button onClick={handleCreatePost} className="flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" style={{ background: 'var(--btn-gradient)' }}>
                                    <Send className="w-4 h-4" /> Share Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Feed - Masonry Layout */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {filtered.map(post => (
                        <div key={post.id} className="break-inside-avoid bg-white rounded-3xl p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100/50">
                            <p className="text-gray-800 leading-relaxed mb-8 text-[15px] font-medium whitespace-pre-wrap">{post.content}</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-sm text-gray-900 leading-tight">@{post.authorName?.replace(/\s+/g, '').toLowerCase() || 'anonymous'}</p>
                                    <p className="text-[12px] text-gray-500 mt-1">{typeLabels[post.type]}</p>
                                    <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-3">
                                        <span className="flex items-center gap-1.5">
                                            <span className="font-mono text-sm leading-none">𝕏</span> 
                                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 transition-colors ${currentUser && post.likedBy?.includes(currentUser.id) ? 'text-red-500' : 'hover:text-red-400'}`}>
                                            <Heart className={`w-3.5 h-3.5 ${currentUser && post.likedBy?.includes(currentUser.id) ? 'fill-current' : ''}`} /> {post.likes}
                                        </button>
                                    </div>
                                </div>
                                <img src={post.authorAvatar} alt="" className="w-[42px] h-[42px] rounded-full object-cover bg-gray-100" loading="lazy" />
                            </div>
                        </div>
                    ))}
                </div>
                
                {filtered.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium text-lg">No posts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
