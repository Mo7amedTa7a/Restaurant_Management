import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package,
  Grid,
  Plus,
  Edit2,
  Trash2,
  History,
  X,
  DollarSign,
  Users,
  Cake,
  Phone,
  Search,
  TrendingUp,
  Printer,
  Save,
  Settings,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Calendar,
  Wallet,
  Play,
  Square,
  Activity
} from 'lucide-react';



import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import { useAlert } from '../context/AlertContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState(queryParams.get('tab') || 'orders');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customersCount, setCustomersCount] = useState(0);

  // PIN Security State
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const checkPinSession = () => {
      const pinSession = localStorage.getItem('fomo_pin_session');
      if (pinSession) {
        const { timestamp } = JSON.parse(pinSession);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        if (now - timestamp < oneHour) {
          setIsPinVerified(true);
        } else {
          localStorage.removeItem('fomo_pin_session');
          setShowPinModal(true);
        }
      } else {
        setShowPinModal(true);
      }
    };
    checkPinSession();
  }, [location.pathname]);

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category_id: ''
  });

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    fetchData();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const fetchData = async () => {
    try {
      const [prodRes, catRes, birthRes, custRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/customers/birthdays'),
        axios.get('http://localhost:5000/api/customers')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setBirthdays(birthRes.data);
      setCustomersCount(custRes.data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, productForm);
        showAlert('تم تعديل المنتج بنجاح', 'success');
      } else {
        await axios.post('http://localhost:5000/api/products', productForm);
        showAlert('تم إضافة المنتج بنجاح', 'success');
      }
      setIsProductModalOpen(false);
      setProductForm({ name: '', price: '', category_id: '' });
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      showAlert('فشل في حفظ المنتج', 'error');
    }
  };

  const deleteProduct = async (id) => {
    showAlert('هل أنت متأكد من حذف هذا المنتج؟', 'confirm', async () => {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        showAlert('تم حذف المنتج بنجاح', 'success');
        fetchData();
      } catch (err) {
        showAlert('فشل في الحذف', 'error');
      }
    });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode}>
      {!isPinVerified && showPinModal && (
        <PinCodeModal
          userId={user?.id}
          onSuccess={() => setIsPinVerified(true)}
        />
      )}

      <div className={`flex-1 overflow-y-auto bg-white dark:bg-fomo-dark-bg transition-colors duration-300 ${!isPinVerified ? 'blur-xl grayscale pointer-events-none' : ''}`}>
        <div className="p-3 md:p-8 max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white mb-1 md:mb-2">لوحة التحكم</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs md:text-base">إدارة السجلات، المنتجات، والإعدادات</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative group flex-1 sm:flex-none">
                <Search className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fomo-orange transition-colors" size={18} />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'orders' ? 'ابحث باسم العميل...' :
                      activeTab === 'products' ? 'ابحث باسم المنتج...' :
                        'ابحث بالاسم أو الرقم...'
                  }
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl md:rounded-2xl py-2.5 md:py-4 pr-10 md:pr-12 pl-4 md:pl-6 outline-none focus:border-fomo-orange transition-all w-full sm:w-72 md:w-80 font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {activeTab === 'products' && (
                <button
                  onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                  className="bg-fomo-orange hover:bg-orange-600 text-white px-5 md:px-8 py-2.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 font-black shadow-lg shadow-fomo-orange/30 transition-all active:scale-95 text-sm md:text-base"
                >
                  <Plus size={20} /> <span className="whitespace-nowrap">إضافة منتج</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 md:p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-fomo-orange text-white shadow-md' : 'text-zinc-500 hover:bg-white dark:hover:bg-zinc-800'}`}
            >
              <History size={18} /> الطلبات
            </button>
            <button
              onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-fomo-orange text-white shadow-md' : 'text-zinc-500 hover:bg-white dark:hover:bg-zinc-800'}`}
            >
              <Grid size={18} /> المنتجات
            </button>
            <button
              onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'customers' ? 'bg-fomo-orange text-white shadow-md' : 'text-zinc-500 hover:bg-white dark:hover:bg-zinc-800'}`}
            >
              <Users size={18} /> العملاء
              <span className="bg-zinc-200/50 dark:bg-zinc-700/50 text-xs px-2 py-0.5 rounded-full">{customersCount}</span>
            </button>
            <button
              onClick={() => { setActiveTab('bills'); setSearchTerm(''); }}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'bills' ? 'bg-fomo-orange text-white shadow-md' : 'text-zinc-500 hover:bg-white dark:hover:bg-zinc-800'}`}
            >
              <Users size={18} /> المناديب
            </button>
            <button
              onClick={() => { setActiveTab('security'); setSearchTerm(''); }}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-fomo-orange text-white shadow-md' : 'text-zinc-500 hover:bg-white dark:hover:bg-zinc-800'}`}
            >
              <UserIcon size={18} /> الملف
            </button>
            <button
              onClick={() => { setActiveTab('hassala'); setSearchTerm(''); }}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'hassala' ? 'bg-fomo-orange text-white shadow-md' : 'text-zinc-500 hover:bg-white dark:hover:bg-zinc-800'}`}
            >
              <Wallet size={18} /> حصالة المحل
            </button>
            <button
              onClick={() => { setActiveTab('personal-hassala'); setSearchTerm(''); }}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'personal-hassala' ? 'bg-green-500 text-white shadow-md' : 'text-zinc-500 hover:bg-white dark:hover:bg-zinc-800'}`}
            >
              <Wallet size={18} /> حصالة التوفير
            </button>
          </div>

          {/* Birthday Notification Banner */}
          {birthdays.length > 0 && searchTerm === '' && (
            <div className="mb-6 md:mb-8 bg-fomo-orange/10 border border-fomo-orange/20 p-4 md:p-6 rounded-2xl md:rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="bg-fomo-orange text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg shadow-fomo-orange/30 shrink-0">
                  <Cake size={24} />
                </div>
                <div>
                  <h3 className="text-base md:text-xl font-black text-zinc-900 dark:text-white">عيد ميلاد اليوم</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs md:text-base">هناك {birthdays.length} من عملائنا يحتفلون بعيد ميلادهم اليوم.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {birthdays.slice(0, 3).map((b, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-zinc-100 dark:border-zinc-800 font-black text-xs md:text-sm text-fomo-orange">
                    {b.customer_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'orders' && <OrdersContent searchTerm={searchTerm} user={user} />}
            {activeTab === 'bills' && <RepresentativesContent searchTerm={searchTerm} />}
            {activeTab === 'products' && (
              <div className="bg-white dark:bg-zinc-900/20 rounded-2xl md:rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full text-right min-w-[500px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-fomo-orange text-xs md:text-sm font-black uppercase">
                    <tr>
                      <th className="px-4 md:px-8 py-3 md:py-5">المنتج</th>
                      <th className="px-4 md:px-8 py-3 md:py-5">القسم</th>
                      <th className="px-4 md:px-8 py-3 md:py-5">السعر</th>
                      <th className="px-4 md:px-8 py-3 md:py-5 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-fomo-orange/5 dark:hover:bg-fomo-orange/10 transition-all group">
                        <td className="px-4 md:px-8 py-3 md:py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 md:w-12 md:h-12 bg-fomo-orange/10 rounded-lg md:rounded-xl flex items-center justify-center text-fomo-orange font-black text-base md:text-xl shrink-0">
                              {p.name ? p.name[0] : '?'}
                            </div>
                            <span className="font-black text-zinc-900 dark:text-white text-sm md:text-base">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-8 py-3 md:py-5 text-zinc-600 dark:text-zinc-400 font-bold text-xs md:text-sm">{p.category_name}</td>
                        <td className="px-4 md:px-8 py-3 md:py-5 font-black text-fomo-orange text-sm md:text-lg">
                          {typeof p.price === 'number' ? p.price.toFixed(2) : p.price} ج.م
                        </td>
                        <td className="px-4 md:px-8 py-3 md:py-5 text-left">
                          <button onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductModalOpen(true); }} className="p-1.5 md:p-2 text-zinc-400 hover:text-blue-600 transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-1.5 md:p-2 text-zinc-400 hover:text-red-600 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-12 text-center text-zinc-400 font-bold text-sm">لا يوجد نتائج للبحث</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'customers' && <CustomersContent birthdays={birthdays} searchTerm={searchTerm} />}
            {activeTab === 'representatives' && <RepresentativesContent searchTerm={searchTerm} />}
            {activeTab === 'security' && <SecurityContent user={user} />}
            {activeTab === 'hassala' && <HassalaContent />}
            {activeTab === 'personal-hassala' && <PersonalHassalaContent />}
          </div>
        </div>
      </div>


      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-lg rounded-2xl md:rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-fomo-dark-bg z-10">
              <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-4 md:p-8 space-y-5 md:space-y-6">
              <div className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 md:mb-2">اسم المنتج</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 outline-none focus:border-fomo-orange transition-all text-sm"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 md:mb-2">السعر (ج.م)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 outline-none focus:border-fomo-orange transition-all text-sm"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 md:mb-2">القسم</label>
                  <select
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 outline-none focus:border-fomo-orange transition-all appearance-none text-sm"
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  >
                    <option value="">اختر القسم</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-fomo-orange hover:bg-orange-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-fomo-orange/20 transition-all active:scale-[0.98]"
              >
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج الآن'}
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

const OrdersContent = ({ searchTerm, user }) => {
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Printing & Deleting State
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Working Shift State
  const [workingShift, setWorkingShift] = useState('');
  const [workingShiftStatus, setWorkingShiftStatus] = useState('active');
  const [workingShiftStartTime, setWorkingShiftStartTime] = useState('');
  const [workingShiftEndTime, setWorkingShiftEndTime] = useState('');
  const [isConfirmEndShiftModalOpen, setIsConfirmEndShiftModalOpen] = useState(false);
  const [isEndShiftModalOpen, setIsEndShiftModalOpen] = useState(false);
  const [shiftSummary, setShiftSummary] = useState(null);
  const [isEndingShift, setIsEndingShift] = useState(false);
  const [isStartingShift, setIsStartingShift] = useState(false);

  // Timezone-aware date/time formatting helpers to resolve the Egypt local timezone offset (+3 hours)
  const formatOrderTime = (dateStr) => {
    if (!dateStr) return '';
    const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
    return new Date(isoStr).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatOrderDateTime = (dateStr) => {
    if (!dateStr) return '';
    const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
    return new Date(isoStr).toLocaleString('ar-EG');
  };

  const fetchOrders = async () => {
    try {
      const [orderRes, prodRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders'),
        axios.get('http://localhost:5000/api/products')
      ]);
      setOrders(orderRes.data);
      setProducts(prodRes.data);

      // Fetch shift status separately so any shift error doesn't prevent orders from loading
      try {
        const workingShiftRes = await axios.get('http://localhost:5000/api/orders/working-shift');
        setWorkingShift(workingShiftRes.data.workingShift);
        setWorkingShiftStatus(workingShiftRes.data.status);
        setWorkingShiftStartTime(workingShiftRes.data.startTime || '');
        setWorkingShiftEndTime(workingShiftRes.data.endTime || '');
      } catch (shiftErr) {
        console.warn('Failed to fetch working shift status:', shiftErr);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
    setLoading(false);
  };

  const handleStartShift = async () => {
    setIsStartingShift(true);
    try {
      const res = await axios.post('http://localhost:5000/api/orders/start-shift');
      setWorkingShift(res.data.workingShift);
      setWorkingShiftStatus(res.data.status);
      setWorkingShiftStartTime(res.data.startTime || '');
      setWorkingShiftEndTime(res.data.endTime || '');
      showAlert('تم بدء شفت عمل جديد بنجاح', 'success');
      fetchOrders();
    } catch (err) {
      console.error(err);
      showAlert('فشل في بدء شفت جديد', 'error');
    } finally {
      setIsStartingShift(false);
    }
  };

  const handleEndShift = async () => {
    setIsEndingShift(true);
    setIsConfirmEndShiftModalOpen(false);
    try {
      const res = await axios.post('http://localhost:5000/api/orders/end-shift');
      setWorkingShift(res.data.workingShift);
      setWorkingShiftStatus(res.data.status);
      setWorkingShiftStartTime(res.data.startTime || '');
      setWorkingShiftEndTime(res.data.endTime || '');
      setShiftSummary(res.data.summary);
      setIsEndShiftModalOpen(true);
      showAlert('تم إنهاء شفت العمل بنجاح', 'success');
      fetchOrders();
    } catch (err) {
      console.error(err);
      showAlert('فشل في إنهاء شفت العمل', 'error');
    } finally {
      setIsEndingShift(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReprint = async (order) => {
    if (!order || isPrinting) return;
    setIsPrinting(true);
    try {
      const printData = {
        id: order.id,
        date: formatOrderDateTime(order.created_at),
        cashier: order.cashier_name || 'admin',
        customer_name: order.customer_name || '',
        customer_phone: order.customer_phone || '',
        total_amount: order.total_amount,
        items: (order.items || []).map(item => {
          // Try to find product name from products list if product_name is missing
          const p = products.find(prod => prod.id === item.product_id);
          return {
            name: (item.product_name || p?.name || 'منتج') + (item.bread_type ? ` (${item.bread_type})` : ''),
            quantity: item.quantity,
            price: item.price
          };
        })
      };
      await axios.post('http://localhost:5000/api/orders/print', printData);
      showAlert('تم إعادة إرسال الطلب للطابعة', 'success');
    } catch (err) {
      console.error('Print Error:', err);
      showAlert('فشل في الطباعة', 'error');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleStartEdit = (order) => {
    setEditForm({ ...order });
    setIsEditing(true);
  };

  const updateItemQty = (index, newQty) => {
    const updatedItems = [...editForm.items];
    if (newQty <= 0) {
      updatedItems.splice(index, 1);
    } else {
      updatedItems[index].quantity = newQty;
    }

    // Recalculate Total
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setEditForm({ ...editForm, items: updatedItems, total_amount: newTotal });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${editForm.id}`, {
        items: editForm.items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price,
          bread_type: i.bread_type || null
        })),
        total_amount: editForm.total_amount,
        customer_name: editForm.customer_name,
        customer_phone: editForm.customer_phone,
        customer_birthday: editForm.customer_birthday
      });
      showAlert('تم تحديث الطلب بنجاح', 'success');
      setIsEditing(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      showAlert('فشل في تحديث الطلب: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowPinModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderToDelete.id}`);
      showAlert('تم حذف الطلب بنجاح', 'success');
      setShowPinModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      showAlert('فشل في حذف الطلب', 'error');
    }
  };


  const filteredOrders = orders.filter(o =>
    (o.customer_name || 'عميل عام').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(o.id).includes(searchTerm)
  );

  // Calculate Most Sold Product
  const productStats = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (productStats[item.product_name]) {
        productStats[item.product_name] += item.quantity;
      } else {
        productStats[item.product_name] = item.quantity;
      }
    });
  });

  const sortedProducts = Object.entries(productStats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, qty]) => ({ name, qty }));

  const maxQty = sortedProducts.length > 0 ? sortedProducts[0].qty : 1;

  // Group Orders by Working Shift
  const groupedOrders = filteredOrders.reduce((acc, order) => {
    let wsKey = order.working_shift;
    let dateObj = new Date(order.created_at);
    
    // If no working_shift (older historical orders), fallback to original calendar date in YYYY-MM-DD format
    if (!wsKey) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      wsKey = `${year}-${month}-${day}`;
    }

    let displayDate = wsKey;
    let timestamp = dateObj.getTime();

    // Check if wsKey is an ISO timestamp of a unique shift session
    if (wsKey.includes('T') || wsKey.includes('Z')) {
      const shiftDate = new Date(wsKey);
      const dateStr = shiftDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = shiftDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      displayDate = `شفت يوم ${dateStr} (بدأ الساعة ${timeStr})`;
      timestamp = shiftDate.getTime();
    } else {
      // Check if fallback date format YYYY-MM-DD
      const parts = wsKey.split('-');
      if (parts.length === 3) {
        const localDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        displayDate = localDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        timestamp = localDate.getTime();
      } else {
        displayDate = new Date(order.created_at).toLocaleDateString('ar-EG');
      }
    }

    if (!acc[wsKey]) {
      acc[wsKey] = {
        dateStr: displayDate,
        workingShift: wsKey,
        timestamp: timestamp, // for sorting
        totalAmount: 0,
        orders: []
      };
    }

    acc[wsKey].orders.push(order);
    acc[wsKey].totalAmount += order.total_amount;

    return acc;
  }, {});

  // Convert to array and sort by date descending
  const sortedDays = Object.values(groupedOrders).sort((a, b) => b.timestamp - a.timestamp);

  if (loading) return <div className="py-20 text-center text-zinc-400 font-bold">جاري تحميل السجلات...</div>;

  return (
    <div className="space-y-10">
      {/* Working Shift Control Card */}
      <div className="bg-white dark:bg-zinc-900/20 rounded-[32px] p-6 md:p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm" dir="rtl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${workingShiftStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} transition-colors`}>
              <Activity size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">إدارة شفتات العمل</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${workingShiftStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                  {workingShiftStatus === 'active' ? 'شفت نشط حالياً' : 'الشفت مغلق'}
                </span>
              </div>
              {workingShiftStatus === 'active' ? (
                <p className="text-zinc-500 font-bold text-xs md:text-sm mt-1">
                  تاريخ وبدء الشفت الحالي: <span className="text-emerald-500 font-black">
                    {workingShiftStartTime ? new Date(workingShiftStartTime).toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                  </span>
                </p>
              ) : (
                <p className="text-zinc-500 font-bold text-xs md:text-sm mt-1">
                  تاريخ ونهاية آخر شفت: <span className="text-rose-500 font-black">
                    {workingShiftEndTime ? new Date(workingShiftEndTime).toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons for Starting and Ending Shifts */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={handleStartShift}
              disabled={workingShiftStatus === 'active' || isStartingShift}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black transition-all active:scale-[0.98] text-sm ${
                workingShiftStatus === 'active'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700/50'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              <Play size={18} />
              {isStartingShift ? 'جاري البدء...' : 'بدء شفت جديد'}
            </button>

            <button
              onClick={() => setIsConfirmEndShiftModalOpen(true)}
              disabled={workingShiftStatus === 'closed' || isEndingShift}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black transition-all active:scale-[0.98] text-sm ${
                workingShiftStatus === 'closed'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700/50'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20'
              }`}
            >
              <Square size={18} />
              {isEndingShift ? 'جاري الإنهاء...' : 'إنهاء الشفت الحالي'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-5">
          <div className="bg-fomo-orange/10 p-4 rounded-2xl text-fomo-orange"><Package size={32} /></div>
          <div><p className="text-sm font-bold text-zinc-400 mb-1">إجمالي الطلبات</p><p className="text-2xl font-black text-fomo-orange">{filteredOrders.length} طلب</p></div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-5">
          <div className="bg-fomo-orange/10 p-4 rounded-2xl text-fomo-orange"><DollarSign size={32} /></div>
          <div><p className="text-sm font-bold text-zinc-400 mb-1">إجمالي المبيعات</p><p className="text-2xl font-black text-fomo-orange">{filteredOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} ج.م</p></div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-5">
          <div className="bg-fomo-orange/10 p-4 rounded-2xl text-fomo-orange"><TrendingUp size={32} /></div>
          <div><p className="text-sm font-bold text-zinc-400 mb-1">المنتج الأكثر طلباً</p><p className="text-2xl font-black text-fomo-orange">{sortedProducts[0] ? `${sortedProducts[0].name} (${sortedProducts[0].qty})` : '---'}</p></div>
        </div>
      </div>

      {/* Top Products Ranking */}
      <div className="bg-white dark:bg-zinc-900/20 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-fomo-orange text-white p-3 rounded-2xl shadow-lg shadow-fomo-orange/30"><TrendingUp size={24} /></div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white">ترتيب المنتجات حسب الطلب</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.slice(0, 6).map((item, idx) => (
            <div key={idx} className="bg-zinc-50/50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-100/50 dark:border-zinc-800/50 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="font-black text-zinc-900 dark:text-white">{item.name}</span>
                <span className="text-fomo-orange font-black">{item.qty} طلب</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden relative z-10">
                <div
                  className="bg-fomo-orange h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(item.qty / maxQty) * 100}%` }}
                ></div>
              </div>
              <div className="absolute -left-2 -bottom-2 text-6xl font-black text-zinc-900/5 dark:text-white/5 italic group-hover:scale-110 transition-transform">
                #{idx + 1}
              </div>
            </div>
          ))}
          {sortedProducts.length === 0 && (
            <div className="col-span-full py-10 text-center text-zinc-400 font-bold italic">لا توجد بيانات مبيعات حتى الآن</div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {sortedDays.map((day, dayIdx) => (
          <div key={dayIdx} className="bg-white dark:bg-zinc-900/20 rounded-[32px] shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            {/* Day Header */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="bg-fomo-orange text-white p-3 rounded-2xl shadow-lg shadow-fomo-orange/30">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">{day.dateStr}</h3>
                  <p className="text-zinc-500 font-bold text-sm">{day.orders.length} طلبات</p>
                </div>
              </div>
              <div className="bg-fomo-orange/10 px-6 py-3 rounded-2xl border border-fomo-orange/20 text-center">
                <p className="text-xs font-bold text-fomo-orange mb-1">إجمالي مبيعات اليوم</p>
                <p className="text-xl font-black text-fomo-orange">{day.totalAmount.toFixed(2)} ج.م</p>
              </div>
            </div>

            {/* Day Orders Table */}
            <table className="w-full text-right">
              <thead className="bg-white/50 dark:bg-zinc-800/30 text-zinc-400 text-sm font-black uppercase">
                <tr>
                  <th className="px-8 py-5">رقم الطلب</th>
                  <th className="px-8 py-5">العميل</th>
                  <th className="px-8 py-5">الوقت</th>
                  <th className="px-8 py-5">الكاشير</th>
                  <th className="px-8 py-5">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {day.orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => { setSelectedOrder(order); setIsEditing(false); }}
                    className="hover:bg-fomo-orange/5 dark:hover:bg-fomo-orange/10 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-4 font-black text-zinc-900 dark:text-white">#ORD-{order.id}</td>
                    <td className="px-8 py-4 text-zinc-600 dark:text-zinc-400 font-bold">
                      {order.customer_name || <span className="text-zinc-300 dark:text-zinc-600">عميل عام</span>}
                    </td>
                    <td className="px-8 py-4 text-zinc-600 dark:text-zinc-400 font-bold">{formatOrderTime(order.created_at)}</td>
                    <td className="px-8 py-4 text-zinc-600 dark:text-zinc-400 font-bold">{order.cashier_name}</td>
                    <td className="px-8 py-4 font-black text-zinc-900 dark:text-white text-lg">{order.total_amount.toFixed(2)} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {sortedDays.length === 0 && (
          <div className="bg-white dark:bg-zinc-900/20 rounded-[32px] shadow-sm border border-zinc-100 dark:border-zinc-800 p-20 text-center">
            <p className="text-zinc-400 font-bold text-lg">لا يوجد نتائج للبحث</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                  {isEditing ? 'تعديل الطلب' : `تفاصيل الطلب #ORD-${selectedOrder.id}`}
                </h2>
                <p className="text-zinc-500 font-bold text-sm">{formatOrderDateTime(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Customer Info */}
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">اسم العميل</label>
                    <input
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-fomo-orange"
                      value={editForm.customer_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">رقم الهاتف</label>
                    <input
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-fomo-orange"
                      value={editForm.customer_phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-400 mb-1">اسم العميل</p>
                    <p className="font-black text-zinc-800 dark:text-white">{selectedOrder.customer_name || 'غير متوفر'}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-400 mb-1">رقم الهاتف</p>
                    <p className="font-black text-zinc-800 dark:text-white">{selectedOrder.customer_phone || 'غير متوفر'}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-400 mb-1">تاريخ الميلاد</p>
                    <p className="font-black text-zinc-800 dark:text-white">{selectedOrder.customer_birthday || 'غير متوفر'}</p>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="space-y-4">
                <h3 className="font-black text-fomo-orange flex items-center gap-2">
                  <Package size={18} />
                  المنتجات المطلوبة
                </h3>
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs font-black">
                      <tr>
                        <th className="px-6 py-3">المنتج</th>
                        <th className="px-6 py-3 text-center">الكمية</th>
                        <th className="px-6 py-3">السعر</th>
                        <th className="px-6 py-3">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {(isEditing ? editForm.items : selectedOrder.items).map((item, idx) => (
                        <tr key={idx} className="text-sm">
                          <td className="px-6 py-4 font-bold text-zinc-800 dark:text-white">
                            {item.product_name}
                            {item.bread_type && <span className="text-zinc-400 text-xs mr-1">({item.bread_type})</span>}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => updateItemQty(idx, item.quantity - 1)} className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-red-500">-</button>
                                <span className="font-black w-6">{item.quantity}</span>
                                <button onClick={() => updateItemQty(idx, item.quantity + 1)} className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-green-500">+</button>
                              </div>
                            ) : (
                              <span className="font-black text-fomo-orange">x{item.quantity}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-zinc-500">{item.price.toFixed(2)} ج.م</td>
                          <td className="px-6 py-4 font-black text-zinc-800 dark:text-white">{(item.price * item.quantity).toFixed(2)} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary & Actions */}
              <div className="flex flex-col gap-4">
                <div className="bg-fomo-orange/5 dark:bg-fomo-orange/10 p-6 rounded-3xl border border-fomo-orange/10 flex justify-between items-center">
                  <span className="font-black text-zinc-500">إجمالي الحساب</span>
                  <span className="text-3xl font-black text-fomo-orange">
                    {(isEditing ? editForm.total_amount : selectedOrder.total_amount).toFixed(2)} ج.م
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-4 rounded-2xl font-black col-span-1"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-none col-span-2"
                      >
                        <Save size={20} /> حفظ التغييرات
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(selectedOrder)}
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                      >
                        <Edit2 size={20} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteClick(selectedOrder)}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:bg-red-100 dark:hover:bg-red-900/40"
                      >
                        <Trash2 size={20} /> حذف
                      </button>
                      <button
                        onClick={() => handleReprint(selectedOrder)}
                        disabled={isPrinting}
                        className={`${isPrinting ? 'bg-zinc-400' : 'bg-fomo-orange hover:bg-orange-600'} text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-fomo-orange/20 transition-all`}
                      >
                        <Printer size={20} /> {isPrinting ? 'جاري الطباعة...' : 'طباعة'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <PinCodeModal
          userId={user?.id}
          onSuccess={handleDeleteConfirm}
        />
      )}

      {/* Confirm End Shift Modal */}
      {isConfirmEndShiftModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                <Square size={36} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">تأكيد إنهاء شفت العمل</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm">
                  هل أنت متأكد من رغبتك في إغلاق وإنهاء شفت العمل الحالي؟
                </p>
                <p className="text-red-500 font-bold text-xs">
                  * سيتم إغلاق الشفت الحالي، وسيتم تسجيل أي طلبات قادمة ضمن شفت جديد تلقائياً عند أول طلب.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsConfirmEndShiftModalOpen(false)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-4 rounded-2xl font-black transition-all active:scale-95 text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleEndShift}
                  disabled={isEndingShift}
                  className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-rose-600/20 transition-all active:scale-[0.98] text-sm"
                >
                  {isEndingShift ? 'جاري الإغلاق...' : 'نعم، إغلاق الشفت'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Shift Summary Modal */}
      {isEndShiftModalOpen && shiftSummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">ملخص شفت العمل المنتهي</h2>
              <button onClick={() => setIsEndShiftModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl text-right space-y-2">
                <p className="text-green-600 dark:text-green-400 font-black text-center text-base">تم إغلاق شفت العمل بنجاح</p>
                <div className="text-sm font-bold text-zinc-600 dark:text-zinc-400 space-y-1">
                  <p>🗓️ تاريخ الشفت: <span className="text-zinc-900 dark:text-white font-black">
                    {workingShift ? (
                      (workingShift.includes('T') || workingShift.includes('Z'))
                        ? new Date(workingShift).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                        : (() => {
                            const parts = workingShift.split('-');
                            if (parts.length === 3) {
                              return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
                            }
                            return new Date(workingShift).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
                          })()
                    ) : '---'}
                  </span></p>
                  <p>🟢 وقت البدء: <span className="text-emerald-600 dark:text-emerald-400 font-black">{workingShiftStartTime ? new Date(workingShiftStartTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '---'}</span></p>
                  <p>🔴 وقت الإغلاق: <span className="text-rose-600 dark:text-rose-400 font-black">{workingShiftEndTime ? new Date(workingShiftEndTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '---'}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
                  <p className="text-zinc-400 font-bold text-xs mb-1">إجمالي عدد الطلبات</p>
                  <p className="text-xl md:text-2xl font-black text-fomo-orange">{shiftSummary.totalOrders} طلب</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
                  <p className="text-zinc-400 font-bold text-xs mb-1">إجمالي مبيعات الشفت</p>
                  <p className="text-xl md:text-2xl font-black text-fomo-orange">{shiftSummary.totalSales.toFixed(2)} ج.م</p>
                </div>
              </div>

              <button
                onClick={() => setIsEndShiftModalOpen(false)}
                className="w-full bg-fomo-orange hover:bg-orange-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-fomo-orange/20 transition-all active:scale-95 text-sm md:text-base"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const CustomersContent = ({ birthdays, searchTerm }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/customers');
        setCustomers(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredCustomers = customers.filter(c =>
    (c.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.customer_phone || '').includes(searchTerm)
  );

  if (loading) return <div className="py-20 text-center text-zinc-400 font-bold">جاري تحميل البيانات...</div>;

  return (
    <div className="space-y-8">
      {/* Birthdays Section if any */}
      {birthdays.length > 0 && searchTerm === '' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {birthdays.map((b, idx) => {
            const age = calculateAge(b.customer_birthday);
            return (
              <div key={idx} className="bg-gradient-to-br from-fomo-orange to-orange-600 p-6 rounded-[32px] text-white shadow-xl shadow-fomo-orange/30 flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Cake size={120} /></div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md"><Cake size={32} /></div>
                <div className="relative z-10 flex-1">
                  <p className="text-xs font-bold opacity-80 mb-1">عيد ميلاد اليوم!</p>
                  <h4 className="text-xl font-black">{b.customer_name}</h4>
                  <div className="flex flex-col gap-1 mt-2">
                    <a
                      href={`https://wa.me/${b.customer_phone?.replace(/\D/g, '').startsWith('01') ? '2' + b.customer_phone.replace(/\D/g, '') : b.customer_phone?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold flex items-center gap-2 hover:underline cursor-pointer"
                    >
                      <Phone size={14} /> {b.customer_phone}
                    </a>
                    {age && (
                      <div className="mt-3 bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/10">
                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">العرض المقترح</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Gift size={16} className="text-white" />
                          <span className="font-black text-lg">خصم {age}%</span>
                          <span className="text-xs font-bold opacity-70">(أتم {age} عاماً)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Customer List */}
      <div className="bg-white dark:bg-zinc-900/20 rounded-[32px] shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 flex items-center gap-4">
          <div className="bg-fomo-orange/10 p-3 rounded-xl text-fomo-orange"><Users size={24} /></div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white">قائمة العملاء</h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 text-sm font-black uppercase">
            <tr>
              <th className="px-8 py-5">الاسم</th>
              <th className="px-8 py-5">رقم الهاتف</th>
              <th className="px-6 py-5">تاريخ الميلاد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredCustomers.map((c, idx) => (
              <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-black">
                      {c.customer_name ? c.customer_name[0] : '?'}
                    </div>
                    <span className="font-black text-zinc-900 dark:text-white">{c.customer_name || 'عميل غير مسجل'}</span>
                  </div>
                </td>
                <td className="px-8 py-5 font-bold text-zinc-600 dark:text-zinc-400">
                  {c.customer_phone ? (
                    <a
                      href={`https://wa.me/${c.customer_phone.replace(/\D/g, '').startsWith('01') ? '2' + c.customer_phone.replace(/\D/g, '') : c.customer_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-fomo-orange transition-colors flex items-center gap-2"
                    >
                      <Phone size={14} /> {c.customer_phone}
                    </a>
                  ) : '---'}
                </td>
                <td className="px-8 py-5 font-bold text-zinc-600 dark:text-zinc-400">{c.customer_birthday || '---'}</td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="3" className="px-8 py-20 text-center text-zinc-400 font-bold">لا يوجد نتائج للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SecurityContent = ({ user }) => {
  const { showAlert } = useAlert();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [newPin, setNewPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showAlert('كلمات المرور غير متطابقة', 'error');
    if (newPassword.length < 6) return showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');

    setIsLoading(true);
    try {
      await axios.put('http://localhost:5000/api/auth/change-password', { userId: user.id, newPassword });
      showAlert('تم تغيير كلمة المرور بنجاح', 'success');
      setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      showAlert('فشل في تغيير كلمة المرور: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    if (newPin.length !== 4) return showAlert('كود الحماية يجب أن يتكون من 4 أرقام', 'error');

    setIsLoading(true);
    try {
      await axios.put('http://localhost:5000/api/auth/change-pin', { userId: user.id, newPin });
      showAlert('تم تغيير كود الحماية بنجاح', 'success');
      setNewPin('');
    } catch (err) {
      showAlert('فشل في تغيير كود الحماية', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Password Change Card */}
      <div className="bg-white dark:bg-zinc-900/20 p-10 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-6 mb-10">
          <div className="bg-fomo-orange text-white p-5 rounded-3xl shadow-xl shadow-fomo-orange/30">
            <Lock size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">تغيير الباسورد</h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold">تغيير كلمة مرور الدخول للنظام</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold text-zinc-400 mb-2">اسم المستخدم</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <UserIcon size={18} className="text-fomo-orange" />
                {user?.username}
              </p>
            </div>
            <input
              type="password"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 px-6 font-bold"
              placeholder="الباسورد الجديد"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 px-6 font-bold"
              placeholder="تأكيد الباسورد"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-fomo-orange text-white py-4 rounded-2xl font-black shadow-lg shadow-fomo-orange/20 transition-all active:scale-95">
            حفظ الباسورد
          </button>
        </form>
      </div>

      {/* PIN Change Card */}
      <div className="bg-white dark:bg-zinc-900/20 p-10 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-6 mb-10">
          <div className="bg-fomo-orange text-white p-5 rounded-3xl shadow-xl shadow-fomo-orange/30">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">كود حماية الداشبورد</h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold">الكود المطلوب للدخول لهذه الصفحة (4 أرقام)</p>
          </div>
        </div>

        <form onSubmit={handlePinChange} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-zinc-400">كود PIN جديد</label>
            <input
              type="text"
              maxLength="4"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-5 text-center text-4xl font-black tracking-[1em] text-fomo-orange"
              placeholder="0000"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-zinc-900 dark:bg-fomo-orange text-white py-4 rounded-2xl font-black transition-all active:scale-95">
            تحديث كود الـ PIN
          </button>
        </form>
      </div>
    </div>
  );
};

const PinCodeModal = ({ userId, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (p = pin) => {
    if (p.length !== 4) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/verify-pin', { userId, pin: p });
      localStorage.setItem('fomo_pin_session', JSON.stringify({ timestamp: Date.now() }));
      onSuccess();
    } catch (err) {
      setError('كود الحماية غير صحيح');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyClick = (val) => {
    if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin.length === 4) handleSubmit(newPin);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-md rounded-[40px] p-10 text-center border border-zinc-100 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-fomo-orange/10 text-fomo-orange rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">منطقة محمية</h2>
        <p className="text-zinc-500 font-bold mb-8">يرجى إدخال كود الحماية المكون من 4 أرقام للدخول</p>

        <div className="flex justify-center gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-6 h-6 rounded-full border-4 transition-all duration-300 ${pin.length >= i ? 'bg-fomo-orange border-fomo-orange scale-110' : 'border-zinc-200 dark:border-zinc-700'}`}></div>
          ))}
        </div>

        {error && <p className="text-red-500 font-bold mb-6 animate-bounce">{error}</p>}

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => handleKeyClick(n)} className="h-20 bg-zinc-50 dark:bg-zinc-800 hover:bg-fomo-orange hover:text-white rounded-2xl text-2xl font-black transition-all active:scale-90">{n}</button>
          ))}
          <button className="h-20"></button>
          <button onClick={() => handleKeyClick(0)} className="h-20 bg-zinc-50 dark:bg-zinc-800 hover:bg-fomo-orange hover:text-white rounded-2xl text-2xl font-black transition-all active:scale-90">0</button>
          <button onClick={() => setPin('')} className="h-20 text-red-500 font-black hover:bg-red-50 rounded-2xl transition-colors">مسح</button>
        </div>
      </div>
    </div>
  );
};



const RepresentativesContent = ({ searchTerm }) => {
  const { showAlert } = useAlert();
  const [reps, setReps] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedRep, setSelectedRep] = useState(null);
  const [repBills, setRepBills] = useState([]);
  const [newRep, setNewRep] = useState({ name: '', phone: '' });

  // Bill Creation State
  const [billItems, setBillItems] = useState([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [billNotes, setBillNotes] = useState('');
  const [editingBillId, setEditingBillId] = useState(null);

  useEffect(() => {
    fetchReps();
  }, []);

  const fetchReps = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/representatives');
      setReps(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRepBills = async (repId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/representatives/${repId}/bills`);
      setRepBills(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddRep = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/representatives', newRep);
      showAlert('تم إضافة المندوب بنجاح', 'success');
      setNewRep({ name: '', phone: '' });
      setIsModalOpen(false);
      fetchReps();
    } catch (err) { showAlert('فشل في الإضافة', 'error'); }
  };

  const handleCreateBill = async () => {
    if (billItems.length === 0) return showAlert('السلة فارغة', 'error');
    const total = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    try {
      if (editingBillId) {
        await axios.put(`http://localhost:5000/api/representatives/bills/${editingBillId}`, {
          items: billItems,
          total_amount: total,
          notes: billNotes
        });
        showAlert('تم تعديل الفاتورة بنجاح', 'success');
      } else {
        await axios.post('http://localhost:5000/api/representatives/bills', {
          representative_id: selectedRep.id,
          items: billItems,
          total_amount: total,
          notes: billNotes
        });
        showAlert('تم حفظ فاتورة المندوب', 'success');
      }
      setBillItems([]);
      setBillNotes('');
      setEditingBillId(null);
      setIsBillModalOpen(false);
      fetchRepBills(selectedRep.id);
    } catch (err) { showAlert(editingBillId ? 'فشل في تعديل الفاتورة' : 'فشل في حفظ الفاتورة', 'error'); }
  };

  const addItemToBill = () => {
    if (!productName.trim() || quantity <= 0 || price <= 0) return showAlert('يرجى ملء جميع بيانات المنتج بشكل صحيح', 'error');
    setBillItems([...billItems, { product_name: productName, quantity: parseFloat(quantity), price: parseFloat(price) }]);
    setProductName('');
    setQuantity(1);
    setPrice(0);
  };

  const updateBillItemQty = (index, newQty) => {
    const updated = [...billItems];
    if (newQty <= 0) updated.splice(index, 1);
    else updated[index].quantity = newQty;
    setBillItems(updated);
  };

  const handleEditBill = (bill) => {
    setEditingBillId(bill.id);
    setBillItems(bill.items.map(i => ({ ...i, price: parseFloat(i.price), quantity: parseFloat(i.quantity) })));
    setBillNotes(bill.notes || '');
    setIsBillModalOpen(true);
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة بالكامل؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/representatives/bills/${billId}`);
      showAlert('تم حذف الفاتورة', 'success');
      fetchRepBills(selectedRep.id);
    } catch (err) { showAlert('فشل في حذف الفاتورة', 'error'); }
  };

  const markAsPaid = async (billId) => {
    try {
      await axios.put(`http://localhost:5000/api/representatives/bills/${billId}/status`, { status: 'paid' });
      showAlert('تم تحديث حالة الفاتورة', 'success');
      fetchRepBills(selectedRep.id);
    } catch (err) { showAlert('فشل في التحديث', 'error'); }
  };

  const handleDeleteRep = async (e, repId) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من حذف المندوب وجميع فواتيره بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/representatives/${repId}`);
      showAlert('تم حذف المندوب', 'success');
      if (selectedRep?.id === repId) setSelectedRep(null);
      fetchReps();
    } catch (err) { showAlert('فشل في حذف المندوب', 'error'); }
  };

  if (loading) return <div className="py-20 text-center text-zinc-400 font-bold">جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">إدارة المناديب</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-fomo-orange hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg transition-all"
        >
          إضافة مندوب جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reps.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map(rep => (
          <div
            key={rep.id}
            className="bg-white dark:bg-zinc-900/40 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 hover:border-fomo-orange/50 transition-all cursor-pointer group relative"
            onClick={() => { setSelectedRep(rep); fetchRepBills(rep.id); }}
          >
            <div className="absolute top-6 left-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleDeleteRep(e, rep.id)}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                title="حذف المندوب"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-fomo-orange/10 rounded-2xl flex items-center justify-center text-fomo-orange text-2xl font-black">
                {rep.name[0]}
              </div>
              <div>
                <h4 className="text-xl font-black text-zinc-800 dark:text-white">{rep.name}</h4>
                <p className="text-zinc-500 font-bold">{rep.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Representative Details Modal */}
      {selectedRep && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">فواتير المندوب: {selectedRep.name}</h2>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setEditingBillId(null);
                    setBillItems([]);
                    setBillNotes('');
                    setIsBillModalOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg transition-all"
                >
                  عمل عهدة/فاتورة جديدة
                </button>
                <button onClick={() => setSelectedRep(null)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                {repBills.map(bill => (
                  <div key={bill.id} className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-full">
                        <p className="text-xs font-bold text-zinc-400 mb-1">تاريخ الفاتورة</p>
                        <p className="font-black text-zinc-800 dark:text-white">{new Date(bill.created_at).toLocaleString('ar-EG')}</p>
                        {bill.notes && (
                          <div className="mt-4 bg-fomo-orange/5 border border-fomo-orange/20 p-4 rounded-2xl">
                            <p className="text-xs font-black text-fomo-orange mb-1">📝 ملاحظات الفاتورة:</p>
                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{bill.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-left flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditBill(bill)} className="p-2 text-zinc-400 hover:text-blue-500 bg-white dark:bg-zinc-800 rounded-xl transition-all shadow-sm">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteBill(bill.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-white dark:bg-zinc-800 rounded-xl transition-all shadow-sm">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-2xl font-black text-fomo-orange">{bill.total_amount.toFixed(2)} ج.م</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${bill.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {bill.status === 'paid' ? 'تم التحصيل' : 'لم يتم التحصيل'}
                        </span>
                        {bill.status !== 'paid' && (
                          <button
                            onClick={() => markAsPaid(bill.id)}
                            className="text-xs font-black text-blue-600 hover:underline"
                          >
                            تأكيد التحصيل
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden mt-4">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400">
                          <tr>
                            <th className="px-4 py-2 font-bold">الصنف</th>
                            <th className="px-4 py-2 font-bold text-center">الكمية</th>
                            <th className="px-4 py-2 font-bold text-center">سعر الوحدة</th>
                            <th className="px-4 py-2 font-bold text-left">الإجمالي</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {bill.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                              <td className="px-4 py-3 font-bold text-zinc-800 dark:text-white">{item.product_name}</td>
                              <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{item.quantity}</td>
                              <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{item.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-left font-black text-zinc-800 dark:text-white">{(item.price * item.quantity).toFixed(2)} ج.م</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                {repBills.length === 0 && <p className="text-center py-10 text-zinc-400 font-bold">لا يوجد فواتير مسجلة لهذا المندوب</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Rep Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">إضافة مندوب جديد</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddRep} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">اسم المندوب</label>
                <input
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 outline-none focus:border-fomo-orange"
                  value={newRep.name}
                  onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">رقم الهاتف</label>
                <input
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 outline-none focus:border-fomo-orange"
                  value={newRep.phone}
                  onChange={(e) => setNewRep({ ...newRep, phone: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full bg-fomo-orange text-white py-4 rounded-2xl font-black">إضافة المندوب</button>
            </form>
          </div>
        </div>
      )}

      {/* Create Bill Modal */}
      {isBillModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160] flex items-center justify-center p-3 md:p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-2xl rounded-2xl md:rounded-[32px] shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <h2 className="text-lg md:text-2xl font-black text-zinc-900 dark:text-white">
                {editingBillId ? 'تعديل الفاتورة' : `عمل عهدة للمندوب: ${selectedRep?.name}`}
              </h2>
              <button onClick={() => setIsBillModalOpen(false)} className="p-2 text-zinc-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 md:p-8 space-y-5 md:space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-end">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-400 mb-1.5 md:mb-2">المنتج (اسم المادة)</label>
                  <input
                    type="text"
                    placeholder="مثال: دقيق، طماطم..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 outline-none focus:border-fomo-orange text-sm"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-400 mb-1.5 md:mb-2">الكمية / الوزن</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 outline-none focus:border-fomo-orange text-sm"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-400 mb-1.5 md:mb-2">السعر للوحدة</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 outline-none focus:border-fomo-orange text-sm"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <button
                  onClick={addItemToBill}
                  className="bg-fomo-orange text-white py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black shadow-lg text-sm"
                >
                  إضافة للفاتورة
                </button>
              </div>

              <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl md:rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-right text-xs md:text-sm min-w-[400px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400">
                    <tr>
                      <th className="px-3 md:px-6 py-2.5 md:py-3">الصنف</th>
                      <th className="px-3 md:px-6 py-2.5 md:py-3 text-center">الكمية</th>
                      <th className="px-3 md:px-6 py-2.5 md:py-3">السعر</th>
                      <th className="px-3 md:px-6 py-2.5 md:py-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {billItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 md:px-6 py-2.5 md:py-3 font-bold text-zinc-800 dark:text-white">{item.product_name}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => updateBillItemQty(idx, item.quantity - 1)} className="text-red-500">-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateBillItemQty(idx, item.quantity + 1)} className="text-green-500">+</button>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-2.5 md:py-3 text-zinc-500">{item.price.toFixed(2)}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-3 font-black">{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-fomo-orange/10 p-4 md:p-6 rounded-xl md:rounded-2xl">
                <span className="font-black text-zinc-600 text-sm md:text-base">إجمالي العهدة</span>
                <span className="text-xl md:text-2xl font-black text-fomo-orange">
                  {billItems.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)} ج.م
                </span>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-zinc-400 mb-1.5 md:mb-2">ملاحظات على الفاتورة (اختياري)</label>
                <textarea
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 outline-none focus:border-fomo-orange resize-none text-sm"
                  rows="2"
                  placeholder="أضف أي ملاحظات هنا..."
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                ></textarea>
              </div>

              <button
                onClick={handleCreateBill}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-xl transition-all text-sm md:text-base"
              >
                {editingBillId ? 'حفظ التعديلات' : 'تأكيد وحفظ عهدة المندوب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HassalaContent = () => {
  const { showAlert } = useAlert();
  const [history, setHistory] = useState([]);

  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [todayRecord, setTodayRecord] = useState({
    date: getLocalDateString(),
    amount_in: 0,
    amount_out: 0,
    notes: '',
    items_out: []
  });
  const [newItemOut, setNewItemOut] = useState({ item_name: '', amount: '' });
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
    fetchRecordForDate(todayRecord.date);
  }, []);

  // Auto-fetch when date changes
  useEffect(() => {
    fetchRecordForDate(todayRecord.date);
  }, [todayRecord.date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, balRes] = await Promise.all([
        axios.get('http://localhost:5000/api/hassala'),
        axios.get('http://localhost:5000/api/hassala/balance')
      ]);
      setHistory(histRes.data);
      setTotalBalance(balRes.data.balance);
      // We don't fetch todayRecord automatically anymore to keep the form empty
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchRecordForDate = async (date) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/hassala/today?date=${date}`);
      setTodayRecord(res.data);
    } catch (err) {
      console.error(err);
      setTodayRecord({ date, amount_in: 0, amount_out: 0, notes: '', items_out: [] });
    }
  };

  const handleDateChange = (newDate) => {
    setTodayRecord({ ...todayRecord, date: newDate });
  };

  const addItemOut = () => {
    if (!newItemOut.item_name.trim() || !newItemOut.amount) {
      return showAlert('يرجى إدخال اسم الحاجه والمبلغ', 'error');
    }
    const amount = parseFloat(newItemOut.amount);
    const updatedItems = [...(todayRecord.items_out || []), { item_name: newItemOut.item_name, amount }];
    const totalOut = updatedItems.reduce((sum, i) => sum + i.amount, 0);
    setTodayRecord({ ...todayRecord, items_out: updatedItems, amount_out: totalOut });
    setNewItemOut({ item_name: '', amount: '' });
  };

  const removeItemOut = (index) => {
    const updatedItems = [...todayRecord.items_out];
    updatedItems.splice(index, 1);
    const totalOut = updatedItems.reduce((sum, i) => sum + i.amount, 0);
    setTodayRecord({ ...todayRecord, items_out: updatedItems, amount_out: totalOut });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post('http://localhost:5000/api/hassala', todayRecord);
      showAlert('تم حفظ سجل الحصالة بنجاح', 'success');
      fetchData();
    } catch (err) {
      showAlert('فشل في حفظ السجل', 'error');
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    if (!window.confirm('هل تريد مسح كافة البيانات من النموذج الحالي؟')) return;
    setTodayRecord({
      date: getLocalDateString(),
      amount_in: 0,
      amount_out: 0,
      notes: '',
      items_out: []
    });
  };

  const handleDelete = async (date) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/hassala?date=${date}`);
      showAlert('تم حذف السجل بنجاح', 'success');
      fetchData();
    } catch (err) {
      showAlert('فشل في حذف السجل', 'error');
    }
  };

  const editRecord = (row) => {
    setTodayRecord(row);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showAlert('تم تحميل بيانات السجل للتعديل', 'info');
  };

  if (loading) return <div className="py-20 text-center text-zinc-400 font-bold">جاري تحميل بيانات الحصالة...</div>;

  return (
    <div className="space-y-10">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-fomo-orange to-orange-600 p-8 rounded-[32px] text-white shadow-xl shadow-fomo-orange/30 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
            <Wallet size={160} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold opacity-80 mb-2">إجمالي رصيد الحصالة</p>
            <h2 className="text-4xl md:text-5xl font-black">{totalBalance.toFixed(2)} ج.م</h2>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
              <TrendingUp size={18} />
              <span className="font-bold">صافي رصيد الحصالة</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-zinc-500 font-bold text-sm mb-1">صافي حركة التاريخ المختار</p>
            <h3 className="text-3xl font-black text-green-500">
              {todayRecord.amount_in.toFixed(2)} ج.م
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">إجمالي الوارد (المبيعات)</p>
              <p className="text-lg font-black text-green-500">+{(todayRecord.amount_in + todayRecord.amount_out).toFixed(2)}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">منصرف الحصالة</p>
              <p className="text-lg font-black text-red-500">-{todayRecord.amount_out.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Input Form */}
      <div className="bg-white dark:bg-zinc-900/20 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-fomo-orange/10 p-3 rounded-xl text-fomo-orange">
              <Edit2 size={24} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">تسجيل حركة الحصالة</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <Calendar className="text-fomo-orange" size={20} />
            <span className="font-bold text-zinc-500 text-sm">التاريخ:</span>
            <input
              type="date"
              className="bg-transparent font-black text-fomo-orange outline-none cursor-pointer"
              value={todayRecord.date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
            <button
              onClick={() => fetchRecordForDate(todayRecord.date)}
              className="p-2 bg-fomo-orange/10 text-fomo-orange rounded-xl hover:bg-fomo-orange hover:text-white transition-all flex items-center gap-2 text-xs font-black"
              title="عرض بيانات هذا التاريخ"
            >
              <Search size={16} /> عرض
            </button>
          </div>
        </div>
        <div className="p-8 space-y-8">
          {/* Amount In */}
          <div className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-3xl border border-green-100 dark:border-green-900/20">
            <label className="block text-sm font-black text-green-600 dark:text-green-400 mb-3">إجمالي المبلغ الذي دخل الحصالة (الوارد)</label>
            <input
              type="number"
              step="0.01"
              className="w-full bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-900/40 rounded-2xl py-4 px-6 font-black text-2xl text-green-600 outline-none focus:border-green-500 transition-all shadow-sm"
              placeholder="0.00"
              value={todayRecord.amount_in || ''}
              onChange={(e) => setTodayRecord({ ...todayRecord, amount_in: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Detailed Money Out */}
          <div className="bg-red-50/50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/20 space-y-4">
            <label className="block text-sm font-black text-red-600 dark:text-red-400">الفلوس اللى طلعت من الحصالة (المصروفات)</label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <input
                  type="text"
                  placeholder="اسم الحاجه (مثلاً: فاتورة كهرباء، مشتريات...)"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 outline-none focus:border-red-400 transition-all font-bold text-sm"
                  value={newItemOut.item_name}
                  onChange={(e) => setNewItemOut({ ...newItemOut, item_name: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addItemOut()}
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="number"
                  placeholder="المبلغ"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 outline-none focus:border-red-400 transition-all font-black text-red-600"
                  value={newItemOut.amount}
                  onChange={(e) => setNewItemOut({ ...newItemOut, amount: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addItemOut()}
                />
              </div>
              <button
                onClick={addItemOut}
                className="sm:col-span-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2 py-3 sm:py-0"
              >
                <Plus size={18} /> إضافة
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2 mt-4">
              {(todayRecord.items_out || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-right-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500 text-xs font-black">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.item_name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-red-500">{item.amount.toFixed(2)} ج.م</span>
                    <button onClick={() => removeItemOut(idx)} className="text-zinc-300 hover:text-red-500 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {(todayRecord.items_out || []).length > 0 && (
                <div className="flex justify-between items-center px-4 py-3 bg-red-500 text-white rounded-xl font-black shadow-lg">
                  <span>إجمالي المنصرف اليوم</span>
                  <span>{todayRecord.amount_out.toFixed(2)} ج.م</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">ملاحظات إضافية (اختياري)</label>
            <textarea
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 px-6 font-bold outline-none focus:border-fomo-orange transition-all resize-none"
              rows="2"
              placeholder="اكتب أى تفاصيل هنا..."
              value={todayRecord.notes || ''}
              onChange={(e) => setTodayRecord({ ...todayRecord, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-fomo-orange hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-fomo-orange/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Save size={24} />
              {isSaving ? 'جاري الحفظ...' : 'حفظ بيانات اليوم'}
            </button>
            <button
              onClick={handleReset}
              className="px-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl font-bold transition-all flex items-center justify-center"
              title="إعادة ضبط الحقول"
            >
              إعادة ضبط
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-zinc-900/20 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 flex items-center gap-4">
          <div className="bg-fomo-orange/10 p-3 rounded-xl text-fomo-orange">
            <History size={24} />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white">سجل الحصالة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[800px]">
            <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 text-sm font-black uppercase">
              <tr>
                <th className="px-8 py-5">التاريخ</th>
                <th className="px-8 py-5">صافي اليوم (الوارد)</th>
                <th className="px-8 py-5">منصرف الحصالة (-)</th>
                <th className="px-8 py-5">تفاصيل المنصرف</th>
                <th className="px-8 py-5">صافي الحركة</th>
                <th className="px-8 py-5">ملاحظات</th>
                <th className="px-8 py-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {history.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all">
                  <td className="px-8 py-5 font-black text-zinc-900 dark:text-white">
                    {(() => {
                      const [y, m, d] = row.date.split('-');
                      return new Date(y, m - 1, d).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    })()}
                  </td>
                  <td className="px-8 py-5 font-black text-green-500">+{(row.amount_in + row.amount_out).toFixed(2)}</td>
                  <td className="px-8 py-5 font-black text-red-500">-{row.amount_out.toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {(row.items_out || []).map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/30">
                          {item.item_name}: {item.amount}
                        </span>
                      ))}
                      {(row.items_out || []).length === 0 && <span className="text-zinc-300">---</span>}
                    </div>
                  </td>
                  <td className={`px-8 py-5 font-black ${row.amount_in >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.amount_in.toFixed(2)} ج.م
                  </td>
                  <td className="px-8 py-5 text-zinc-500 font-bold text-sm">{row.notes || '---'}</td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => editRecord(row)}
                        className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                        title="تعديل"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.date)}
                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-zinc-400 font-bold">لا توجد سجلات سابقة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PersonalHassalaContent = () => {
  const { showAlert } = useAlert();
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [todayRecord, setTodayRecord] = useState({
    date: getLocalDateString(),
    amount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchRecordForDate(todayRecord.date);
  }, [todayRecord.date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, balRes, sumRes] = await Promise.all([
        axios.get('http://localhost:5000/api/personal-hassala'),
        axios.get('http://localhost:5000/api/personal-hassala/balance'),
        axios.get('http://localhost:5000/api/personal-hassala/summary')
      ]);
      setHistory(histRes.data);
      setTotalBalance(balRes.data.balance);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchRecordForDate = async (date) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/personal-hassala/today?date=${date}`);
      setTodayRecord(res.data);
    } catch (err) {
      console.error(err);
      setTodayRecord({ date, amount: 0, notes: '' });
    }
  };

  const handleDateChange = (newDate) => {
    setTodayRecord({ ...todayRecord, date: newDate });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post('http://localhost:5000/api/personal-hassala', todayRecord);
      showAlert('تم حفظ مدخرات اليوم بنجاح', 'success');
      fetchData();
    } catch (err) {
      showAlert('فشل في الحفظ', 'error');
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    if (!window.confirm('هل تريد مسح كافة البيانات من النموذج الحالي؟')) return;
    setTodayRecord({
      date: getLocalDateString(),
      amount: 0,
      notes: ''
    });
  };

  const handleDelete = async (date) => {
    if (!window.confirm('هل أنت متأكد من حذف السجل لهذا اليوم؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/personal-hassala?date=${date}`);
      showAlert('تم الحذف بنجاح', 'success');
      fetchData();
    } catch (err) {
      showAlert('فشل في الحذف', 'error');
    }
  };

  const editRecord = (row) => {
    setTodayRecord(row);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showAlert('تم تحميل البيانات للتعديل', 'info');
  };

  // Convert YYYY-MM to readable Arabic month
  const formatMonth = (ym) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  };

  if (loading && history.length === 0) return <div className="py-20 text-center text-zinc-400 font-bold">جاري تحميل بيانات حصالة التوفير...</div>;

  return (
    <div className="space-y-10">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-[32px] text-white shadow-xl shadow-green-500/30 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
            <Wallet size={160} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold opacity-80 mb-2">إجمالي مدخرات حصالة التوفير</p>
            <h2 className="text-4xl md:text-5xl font-black">{totalBalance.toFixed(2)} ج.م</h2>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
              <TrendingUp size={18} />
              <span className="font-bold">رصيد تراكمي</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-zinc-500 font-bold text-sm mb-1">توفير التاريخ المختار</p>
            <h3 className="text-3xl font-black text-green-500">
              {todayRecord.amount.toFixed(2)} ج.م
            </h3>
          </div>
          <div className="mt-6">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">ملاحظات اليوم</p>
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{todayRecord.notes || 'لا يوجد ملاحظات'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-zinc-900/20 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-xl text-green-500">
              <Edit2 size={24} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">إضافة توفير</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <Calendar className="text-green-500" size={20} />
            <span className="font-bold text-zinc-500 text-sm">التاريخ:</span>
            <input
              type="date"
              className="bg-transparent font-black text-green-500 outline-none cursor-pointer"
              value={todayRecord.date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-3xl border border-green-100 dark:border-green-900/20">
            <label className="block text-sm font-black text-green-600 dark:text-green-400 mb-3">المبلغ الذي تم توفيره اليوم</label>
            <input
              type="number"
              step="0.01"
              className="w-full bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-900/40 rounded-2xl py-4 px-6 font-black text-2xl text-green-600 outline-none focus:border-green-500 transition-all shadow-sm"
              placeholder="0.00"
              value={todayRecord.amount || ''}
              onChange={(e) => setTodayRecord({ ...todayRecord, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">ملاحظات إضافية (اختياري)</label>
            <textarea
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 px-6 font-bold outline-none focus:border-green-500 transition-all resize-none"
              rows="2"
              placeholder="مثال: من مبيعات كذا، توفير إضافي..."
              value={todayRecord.notes || ''}
              onChange={(e) => setTodayRecord({ ...todayRecord, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Save size={24} />
              {isSaving ? 'جاري الحفظ...' : 'حفظ التوفير'}
            </button>
            <button
              onClick={handleReset}
              className="px-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl font-bold transition-all flex items-center justify-center"
            >
              إعادة ضبط
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Summary */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900/20 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm self-start sticky top-6">
          <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50">
            <Calendar size={20} className="text-zinc-400" />
            <h3 className="text-xl font-black text-zinc-900 dark:text-white">ملخص الشهور</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {summary.map((sum, idx) => (
              <div key={idx} className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center group hover:border-green-500/30 transition-all">
                <span className="font-bold text-zinc-600 dark:text-zinc-300">{formatMonth(sum.month)}</span>
                <span className="font-black text-green-500 text-lg">{sum.total.toFixed(2)} ج.م</span>
              </div>
            ))}
            {summary.length === 0 && <p className="text-center text-zinc-400 font-bold py-10">لا يوجد مدخرات سابقة</p>}
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/20 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 flex items-center gap-3">
            <History size={20} className="text-zinc-400" />
            <h3 className="text-xl font-black text-zinc-900 dark:text-white">سجل التوفير اليومي</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[500px]">
              <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 text-xs font-black uppercase">
                <tr>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">ملاحظات</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {history.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                      {(() => {
                        const [y, m, d] = row.date.split('-');
                        return new Date(y, m - 1, d).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                      })()}
                    </td>
                    <td className="px-6 py-4 font-black text-green-500">+{row.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-zinc-500 font-bold text-sm">{row.notes || '---'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editRecord(row)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(row.date)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-zinc-400 font-bold">لا يوجد سجلات للتوفير</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

