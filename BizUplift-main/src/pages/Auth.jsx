import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
};

const InputField = ({ icon: Icon, name, type = 'text', placeholder, value, onChange, error }) => {
    const { theme } = useTheme();
    const isDiwali = theme === 'diwali';
    const textColor = isDiwali ? '#FFF8E7' : '#1F2937';
    const mutedColor = isDiwali ? 'rgba(255,248,231,0.6)' : '#6B7280';
    
    return (
        <div>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: mutedColor }} />
                <input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors font-body"
                    style={{ background: isDiwali ? 'rgba(255,255,255,0.05)' : '#F9FAFB', borderColor: error ? '#EF4444' : isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB', color: textColor }}
                    onFocus={e => e.target.style.borderColor = 'rgb(var(--color-primary))'}
                    onBlur={e => e.target.style.borderColor = error ? '#EF4444' : isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

const Auth = ({ mode: initialMode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithGoogle, register, isAuthenticated } = useAuth();
    const { showToast } = useNotifications();
    const { theme } = useTheme();

    const from = location.state?.from?.pathname || '/';

    const [mode, setMode] = useState(initialMode === 'otp' ? 'login' : (initialMode || 'login')); // login | register
    const [role, setRole] = useState('customer');
    const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

    const isDiwali = theme === 'diwali';
    const bgColor = isDiwali ? '#0D0221' : '#F9FAFB';
    const cardBg = isDiwali ? '#1a0a3a' : 'white';
    const textColor = isDiwali ? '#FFF8E7' : '#1F2937';
    const mutedColor = isDiwali ? 'rgba(255,248,231,0.6)' : '#6B7280';

    const validate = () => {
        const errs = {};
        if (mode === 'register') {
            if (!form.name.trim()) errs.name = 'Name is required';
            if (!form.email.includes('@')) errs.email = 'Valid email required';
            if (form.mobile.length !== 10) errs.mobile = '10-digit mobile required';
            if (form.password.length < 6) errs.password = 'Min 6 characters';
            if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        } else if (mode === 'login') {
            if (!form.email.includes('@')) errs.email = 'Valid email required';
            if (!form.password) errs.password = 'Password required';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            // login is now async — it calls the backend
            const user = await login(form.email, form.password);
            showToast(`Welcome back, ${user.name.split(' ')[0]}! 🎉`);
            if (user.role === 'admin') navigate('/dashboard/admin', { replace: true });
            else if (user.role === 'seller') navigate('/dashboard/seller', { replace: true });
            else navigate(from, { replace: true });
        } catch (err) {
            setErrors({ general: err.message });
        }
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            // register is now async — calls POST /api/auth/register, backend checks for duplicate emails
            const newUser = await register(form.name, form.email, form.password, form.mobile, role);
            showToast(`Welcome to BizUplift, ${newUser.name.split(' ')[0]}! You got 100 welcome points 🌟`);
            navigate(role === 'seller' ? '/dashboard/seller' : from, { replace: true });
        } catch (err) {
            setErrors({ general: err.message });
        }
        setLoading(false);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            let decoded;
            if (credentialResponse.credential === 'mock_google_credential_for_development') {
                // Return a mock user object for development
                decoded = {
                    email: 'mockuser@example.com',
                    name: 'Mock Google User',
                    picture: 'https://i.pravatar.cc/150?u=mockuser'
                };
            } else {
                decoded = jwtDecode(credentialResponse.credential);
            }
            
            // loginWithGoogle is now async — calls the backend to create/find the user
            const user = await loginWithGoogle(decoded);
            showToast(`Welcome via Google, ${user.name.split(' ')[0]}! 🎉`);
            if (user.role === 'admin') navigate('/dashboard/admin', { replace: true });
            else if (user.role === 'seller') navigate('/dashboard/seller', { replace: true });
            else navigate(from, { replace: true });
        } catch (err) {
            setErrors({ general: 'Google authentication failed. Please try again.' });
        }
        setLoading(false);
    };

    const pwdStrength = passwordStrength(form.password);
    const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

    return (
        <div className="min-h-screen flex" style={{ background: bgColor }}>
            {/* Left Visual Pane (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center border-r" style={{ borderColor: isDiwali ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                {/* Background Image */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1605481711204-7a912bb6174d?q=80&w=2670&auto=format&fit=crop')` }} />
                {/* Gradient Overlay */}
                <div className="absolute inset-0" style={{ background: isDiwali ? 'linear-gradient(to right, rgba(13,2,33,0.6), rgba(13,2,33,1))' : 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(249, 250, 251, 1))' }} />
                
                {/* Animated Text Content */}
                <div className="relative z-10 p-12 max-w-xl text-left left-0 w-full" style={{ color: isDiwali ? 'white' : '#1F2937' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="text-6xl mb-6">🛍️</div>
                        <h1 className="text-5xl font-heading font-bold mb-6 leading-tight">Elevate Your Business with BizUplift.</h1>
                        <p className="text-xl font-body leading-relaxed opacity-80">
                            Join India's premier festival marketplace. Connect with authentic artisans, explore rich cultural crafts, and experience secure, seamless trading.
                        </p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }} className="mt-12 flex items-center gap-4">
                       <div className="flex -space-x-4">
                          {[1,2,3,4].map(i => <img key={i} className="w-12 h-12 rounded-full border-2" style={{ borderColor: isDiwali ? '#0D0221' : '#F9FAFB' }} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />)}
                       </div>
                       <p className="text-sm font-medium opacity-80">Join 10,000+ active users</p>
                    </motion.div>
                </div>
            </div>

            {/* Right Form Pane */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">
               {isDiwali && <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />}
               
               <div className="w-full max-w-md relative z-10">
                   {/* Logo for mobile only */}
                   <div className="lg:hidden text-center mb-10">
                       <div className="text-5xl mb-3">🛍️</div>
                       <h1 className="text-3xl font-heading font-bold" style={{ color: textColor }}>BizUplift</h1>
                   </div>

                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white/50 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl border" style={{ background: isDiwali ? 'rgba(26, 10, 58, 0.7)' : 'rgba(255, 255, 255, 0.8)', borderColor: isDiwali ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                        {/* Mode tabs */}
                        <div className="flex rounded-xl overflow-hidden border mb-8 p-1" style={{ borderColor: isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB', background: isDiwali ? 'rgba(0,0,0,0.2)' : '#F9FAFB' }}>
                            {[['login', 'Sign In'], ['register', 'Register']].map(([m, label]) => (
                                <button key={m} onClick={() => { setMode(m); setErrors({}); }} className="flex-1 py-2.5 text-sm font-semibold transition-all relative rounded-lg" style={{ color: mode === m ? 'white' : mutedColor }}>
                                    {mode === m && <motion.div layoutId="activeTab" className="absolute inset-0 rounded-lg shadow-sm" style={{ background: 'rgb(var(--color-primary))' }} />}
                                    <span className="relative z-10">{label}</span>
                                </button>
                            ))}
                        </div>

                        {errors.general && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{errors.general}</motion.div>}

                        <AnimatePresence mode="wait">
                            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                {/* Login Form */}
                                {mode === 'login' && (
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <InputField icon={Mail} name="email" type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} />
                                        <div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: mutedColor }} />
                                                <input type={showPwd ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                                    className="w-full pl-9 pr-10 py-3 rounded-xl border-2 text-sm outline-none font-body transition-colors"
                                                    style={{ background: isDiwali ? 'rgba(255,255,255,0.05)' : '#F9FAFB', borderColor: errors.password ? '#EF4444' : isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB', color: textColor }} 
                                                    onFocus={e => e.target.style.borderColor = 'rgb(var(--color-primary))'}
                                                    onBlur={e => e.target.style.borderColor = errors.password ? '#EF4444' : isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
                                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-primary" style={{ color: mutedColor }}>
                                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 shadow-lg shadow-primary/20" style={{ background: 'var(--btn-gradient)' }}>
                                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Sign In</>}
                                        </button>
                                        <div className="text-center text-xs mt-4" style={{ color: mutedColor }}>
                                            Demo: arjun@example.com / password123<br/>Admin: admin@bizuplift.com / admin123
                                        </div>
                                    </form>
                                )}

                                {/* Register Form */}
                                {mode === 'register' && (
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="flex gap-2 mb-2 p-1 rounded-xl" style={{ background: isDiwali ? 'rgba(0,0,0,0.2)' : '#F9FAFB', borderColor: isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB', borderWidth: 1 }}>
                                            {[['customer', '🛍️ Customer'], ['seller', '🏪 Seller']].map(([r, label]) => (
                                                <button key={r} type="button" onClick={() => setRole(r)} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all relative" style={{ color: role === r ? 'white' : mutedColor }}>
                                                    {role === r && <motion.div layoutId="roleTab" className="absolute inset-0 rounded-lg shadow-sm" style={{ background: 'rgb(var(--color-primary))' }} />}
                                                    <span className="relative z-10">{label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <InputField icon={User} name="name" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
                                        <InputField icon={Mail} name="email" type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} />
                                        <InputField icon={Phone} name="mobile" placeholder="Mobile number (10 digits)" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))} error={errors.mobile} />
                                        <div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: mutedColor }} />
                                                <input type={showPwd ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                                    className="w-full pl-9 pr-10 py-3 rounded-xl border-2 text-sm outline-none font-body transition-colors"
                                                    style={{ background: isDiwali ? 'rgba(255,255,255,0.05)' : '#F9FAFB', borderColor: isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB', color: textColor }} 
                                                    onFocus={e => e.target.style.borderColor = 'rgb(var(--color-primary))'}
                                                    onBlur={e => e.target.style.borderColor = isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} />
                                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-primary" style={{ color: mutedColor }}>
                                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {form.password && (
                                                <div className="mt-2">
                                                    <div className="flex gap-1 mb-1">
                                                        {[0, 1, 2, 3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < pwdStrength ? strengthColors[pwdStrength - 1] : 'bg-gray-200'}`} />)}
                                                    </div>
                                                    <p className="text-xs" style={{ color: mutedColor }}>{strengthLabels[pwdStrength - 1] || 'Too short'}</p>
                                                </div>
                                            )}
                                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                        </div>
                                        <InputField icon={Lock} name="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} error={errors.confirmPassword} />
                                        <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 shadow-lg shadow-primary/20" style={{ background: 'var(--btn-gradient)' }}>
                                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Create Account</>}
                                        </button>
                                    </form>
                                )}

                                {/* Universal Google Login Divider */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t" style={{ borderColor: isDiwali ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-3" style={{ background: isDiwali ? '#140828' : '#ffffff', color: mutedColor }}>Or continue with</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center flex-col items-center">
                                        <div className="w-full flex justify-center hover:scale-[1.02] transition-transform">
                                            {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID_HERE')) ? (
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        showToast('Running in Mock Google Mode 🛠️');
                                                        handleGoogleSuccess({
                                                            credential: 'mock_google_credential_for_development'
                                                        });
                                                    }}
                                                    className="w-full py-3 px-4 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                                >
                                                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
                                                    Mock Google Sign In
                                                </button>
                                            ) : (
                                                <GoogleLogin
                                                    onSuccess={handleGoogleSuccess}
                                                    onError={() => setErrors({ general: 'Google Login was unsuccessful' })}
                                                    useOneTap
                                                    theme={isDiwali ? 'filled_black' : 'outline'}
                                                    shape="pill"
                                                    size="large"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                            </motion.div>
                        </AnimatePresence>
                   </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
