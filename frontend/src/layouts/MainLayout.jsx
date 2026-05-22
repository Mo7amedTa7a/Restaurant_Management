import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  LogOut,
  User,
  LayoutGrid,
  Moon,
  Sun,
  Settings,
  ShoppingCart,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const MainLayout = ({ children, toggleTheme, isDarkMode, setIsCartOpen, isCartOpen, cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [birthdayCount, setBirthdayCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/customers/birthdays');
        setBirthdayCount(res.data.length);
      } catch (err) {
        console.error('Failed to fetch birthdays', err);
      }
    };
    fetchBirthdays();
    const interval = setInterval(fetchBirthdays, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen bg-white dark:bg-fomo-dark-bg text-zinc-900 dark:text-white font-sans flex flex-col overflow-hidden transition-colors duration-300" dir="rtl">

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-72 h-full bg-white dark:bg-fomo-dark-bg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Sidebar Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
              <img src="/src/assets/logo/logo.png" alt="FOMO" className="h-9 object-contain dark:brightness-110" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <X size={22} />
              </button>
            </div>

            {/* Sidebar Nav */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button
                onClick={() => navigate('/')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${location.pathname === '/' ? 'bg-fomo-orange text-white shadow-lg shadow-fomo-orange/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
              >
                <LayoutGrid size={20} /> كاشير
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${location.pathname === '/dashboard' ? 'bg-fomo-orange text-white shadow-lg shadow-fomo-orange/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
              >
                <Settings size={20} /> الداشبورد
              </button>

              <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />

              <button
                onClick={() => navigate('/dashboard?tab=customers')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all relative"
              >
                <Bell size={20} /> إشعارات أعياد الميلاد
                {birthdayCount > 0 && (
                  <span className="mr-auto w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold animate-pulse">
                    {birthdayCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=security')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <User size={20} /> الملف الشخصي
              </button>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                {isDarkMode ? 'الوضع المضيء' : 'الوضع الليلي'}
              </button>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 px-3 py-2 mb-3">
                <div className="w-10 h-10 bg-fomo-orange/10 rounded-full flex items-center justify-center text-fomo-orange">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-black text-sm">{user?.username || 'المستخدم'}</p>
                  <p className="text-[11px] text-zinc-500 font-bold">نشط الآن</p>
                </div>
              </div>
              <button
                onClick={() => { dispatch(logout()); navigate('/login'); }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-sm text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut size={18} /> تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 md:h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-3 md:px-6 bg-white/80 dark:bg-fomo-dark-bg/50 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-8 h-full">
          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-fomo-orange transition-colors">
            <Menu size={22} />
          </button>

          <div className="h-8 md:h-12 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/src/assets/logo/logo.png" alt="FOMO" className="h-full object-contain filter dark:brightness-110" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-zinc-500 dark:text-zinc-400 h-full">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 h-full px-2 transition-colors ${location.pathname === '/' ? 'text-fomo-orange border-b-2 border-fomo-orange' : 'hover:text-fomo-orange'}`}
            >
              <LayoutGrid size={18} />
              <span>كاشير</span>
            </button>
            <button
              onClick={() => navigate('/dashboard?tab=orders')}
              className={`flex items-center gap-2 h-full px-2 transition-colors ${location.pathname === '/dashboard' ? 'text-fomo-orange border-b-2 border-fomo-orange' : 'hover:text-fomo-orange'}`}
            >
              <Settings size={18} />
              <span>الداشبورد</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-1 md:gap-4">
          {/* Theme toggle - desktop only */}
          <button
            onClick={toggleTheme}
            className="hidden md:block p-2 text-zinc-500 dark:text-zinc-400 hover:text-fomo-orange transition-colors"
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          {/* Cart toggle - always visible on POS page */}
          {location.pathname === '/' && (
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-fomo-orange transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-fomo-orange text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Birthday & Profile - desktop only */}
          <button
            onClick={() => navigate('/dashboard?tab=customers')}
            className="hidden md:block relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-fomo-orange transition-colors"
          >
            <Bell size={22} />
            {birthdayCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold animate-pulse">
                {birthdayCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/dashboard?tab=security')}
            className={`hidden md:block p-2 transition-colors ${location.search.includes('tab=security') ? 'text-fomo-orange' : 'text-zinc-500 dark:text-zinc-400 hover:text-fomo-orange'}`}
          >
            <User size={22} />
          </button>
          <button onClick={() => { dispatch(logout()); navigate('/login'); }} className="hidden md:block p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {children}
      </main>

      {/* Footer - hidden on mobile */}
      <footer className="hidden md:flex h-12 bg-white dark:bg-fomo-dark-bg border-t border-zinc-200 dark:border-zinc-800 px-4 md:px-8 items-center justify-between text-[10px] text-zinc-500 shrink-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-6">
          <span className="cursor-pointer hover:text-fomo-orange transition-colors">سياسة الخصوصية</span>
          <span className="cursor-pointer hover:text-fomo-orange transition-colors">الشروط والأحكام</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-black text-zinc-900 dark:text-white text-xs">FOMO</span>
          <span>© 2026 FOMO Fast Food</span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
