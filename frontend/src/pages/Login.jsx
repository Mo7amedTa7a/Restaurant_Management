import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import { User, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fomo-bg px-4 font-sans" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-orange-50">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 bg-fomo-orange/5 rounded-3xl flex items-center justify-center p-4">
              <img src="/src/assets/logo/logo.png" alt="FOMO Logo" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-fomo-orange">FOMO POS</h1>
          <p className="text-gray-500 font-bold mt-2 text-lg">مرحباً بك، سجل دخولك للبدء</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-center font-bold text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-fomo-orange" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pr-12 pl-4 py-3 bg-fomo-bg border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-fomo-orange outline-none transition-all shadow-sm"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-fomo-orange" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-12 pl-4 py-3 bg-fomo-bg border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-fomo-orange outline-none transition-all shadow-sm"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 bg-fomo-orange hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-fomo-orange/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
