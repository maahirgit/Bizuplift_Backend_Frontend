import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ParticleLayer from './components/UI/ParticleLayer';
import ThemeSwitcher from './components/UI/ThemeSwitcher';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ToastContainer from './components/UI/ToastContainer';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const HamperBuilder = lazy(() => import('./pages/HamperBuilder'));
const Community = lazy(() => import('./pages/Community'));
const Auth = lazy(() => import('./pages/Auth'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Credits = lazy(() => import('./pages/Credits'));
const Festivals = lazy(() => import('./pages/Festivals'));
const Collaborate = lazy(() => import('./pages/Collaborate'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const SellerAnalytics = lazy(() => import('./pages/SellerAnalytics'));
const SellerSubscription = lazy(() => import('./pages/SellerSubscription'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm text-gray-500 font-body">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <ParticleLayer />
                <div className="flex flex-col min-h-screen relative" style={{ zIndex: 1 }}>
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* ── Public routes ── */}
                        <Route path="/" element={<Home />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/login" element={<Auth />} />
                        <Route path="/register" element={<Auth mode="register" />} />

                        {/* ── Protected routes ── */}
                        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
                        <Route path="/seller/:id" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />
                        <Route path="/hamper" element={<ProtectedRoute><HamperBuilder /></ProtectedRoute>} />
                        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                        <Route path="/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
                        <Route path="/festivals" element={<ProtectedRoute><Festivals /></ProtectedRoute>} />
                        <Route path="/collaborate" element={<ProtectedRoute><Collaborate /></ProtectedRoute>} />
                        <Route path="/dashboard/customer" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
                        <Route path="/dashboard/seller" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
                        <Route path="/seller-analytics" element={<ProtectedRoute><SellerAnalytics /></ProtectedRoute>} />
                        <Route path="/seller-subscription" element={<ProtectedRoute><SellerSubscription /></ProtectedRoute>} />
                        <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                        <Route path="*" element={
                          <div className="container py-20 text-center">
                            <div className="text-6xl mb-4">🎪</div>
                            <h1 className="text-3xl font-heading font-bold mb-2">Page Not Found</h1>
                            <p className="text-gray-500">This page doesn't exist yet!</p>
                          </div>
                        } />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>

                <ToastContainer />
                <ThemeSwitcher />
              </Router>
            </CartProvider>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
