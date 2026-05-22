import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  LayoutGrid,
  Utensils,
  Beer,
  IceCream,
  Trash2,
  Printer,
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import MainLayout from '../layouts/MainLayout';
import { useAlert } from '../context/AlertContext';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    birthday: ''
  });
  const [lastOrder, setLastOrder] = useState(null);
  const [isOrderSaved, setIsOrderSaved] = useState(false);
  const [isWaitingForPrintConfirmation, setIsWaitingForPrintConfirmation] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [printContent, setPrintContent] = useState(null);
  const [isBreadModalOpen, setIsBreadModalOpen] = useState(false);
  const [selectedProductForBread, setSelectedProductForBread] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const cart = useSelector(state => state.cart);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    const handleAfterPrint = () => {
      // Automatic cleanup AFTER the browser finishes with the print job
      if (isOrderSaved) {
        startNewOrder();
      }
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [isOrderSaved]); // Added isOrderSaved to dependencies for the listener

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

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryIcon = (name) => {
    if (name.includes('برجر')) return <Utensils size={18} />;
    if (name.includes('مشروبات')) return <Beer size={18} />;
    if (name.includes('حلويات')) return <IceCream size={18} />;
    return <LayoutGrid size={18} />;
  };

  const fatayerOfferCatId = categories.find(c => c.name === 'عروض فطائر')?.id;
  const sandwichOfferCatId = categories.find(c => c.name === 'عروض سندوتشات')?.id;

  const mainCategories = categories.filter(c => c.name !== 'عروض فطائر' && c.name !== 'عروض سندوتشات');

  const filteredProducts = products.filter(p => {
    let matchesCategory = true;
    if (selectedCategory === 'offers_virtual') {
      matchesCategory = p.category_id === fatayerOfferCatId || p.category_id === sandwichOfferCatId;
    } else if (selectedCategory) {
      matchesCategory = p.category_id === selectedCategory;
    }
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProductCard = (product) => (
    <div
      key={product.id}
      onClick={() => handleProductClick(product)}
      className="bg-white dark:bg-fomo-card-bg rounded-2xl md:rounded-[32px] overflow-hidden border border-zinc-200 dark:border-zinc-800/50 hover:border-fomo-orange/50 transition-all duration-300 group flex flex-col h-full shadow-sm hover:shadow-xl cursor-pointer active:scale-[0.98]"
    >
      <div className="p-4 md:p-8 flex-1 flex flex-col justify-center items-center text-center">
        <div className="bg-fomo-orange/10 dark:bg-fomo-orange/20 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-fomo-orange/20 mb-2 md:mb-4">
          <span className="text-fomo-orange font-black text-sm md:text-lg">{product.price} ج.م</span>
        </div>
        <h3 className="text-sm md:text-2xl font-black text-zinc-800 dark:text-white group-hover:text-fomo-orange transition-colors leading-tight">
          {product.name}
        </h3>
      </div>
    </div>
  );

  const isSandwich = (product) => {
    const sandwichCategory = categories.find(c => c.name === 'سندوتشات');
    return product.category_id === sandwichCategory?.id;
  };

  const handleProductClick = (product) => {
    if (isSandwich(product)) {
      setSelectedProductForBread(product);
      setIsBreadModalOpen(true);
    } else {
      dispatch(addToCart(product));
    }
  };

  const addSandwichWithBread = (breadType) => {
    dispatch(addToCart({ ...selectedProductForBread, breadType }));
    setIsBreadModalOpen(false);
    setSelectedProductForBread(null);
  };

  const handleCheckout = async () => {
    if (!user) {
      showAlert('يرجى تسجيل الدخول أولاً', 'error');
      return;
    }

    if (cart.items.length === 0) {
      showAlert('السلة فارغة', 'error');
      return;
    }

    setIsCustomerModalOpen(true);
  };

  const startNewOrder = () => {
    dispatch(clearCart());
    setIsCustomerModalOpen(false);
    setIsOrderSaved(false);
    setLastOrder(null);
    setCustomerData({ name: '', phone: '', birthday: '' });
    fetchProducts();
  };

  const printReceipt = async (orderToPrint = pendingOrderData) => {
    if (!orderToPrint) return false;

    try {
      setIsPrinting(true);

      // Prepare data for Python bridge
      const printData = {
        id: orderToPrint.id,
        date: new Date().toLocaleString('ar-EG'),
        cashier: user?.username || 'admin',
        customer_name: orderToPrint.customer_name || '',
        customer_phone: orderToPrint.customer_phone || '',
        total_amount: orderToPrint.total_amount,
        items: (orderToPrint.items || []).map(item => {

          const p = products.find(prod => prod.id === item.product_id);
          return {
            name: (p?.name || 'منتج') + (item.bread_type ? ` (${item.bread_type})` : ''),
            quantity: item.quantity,
            price: item.price
          };
        })
      };

      await axios.post('http://localhost:5000/api/orders/print', printData);
      showAlert('تم إرسال الطلب للطابعة', 'success');
      setIsPrinting(false);
      return true;
    } catch (err) {
      console.error('Backend Print Error:', err);
      showAlert('فشل في الطباعة: ' + (err.response?.data?.details || err.message), 'error');
      setIsPrinting(false);
      return false;
    }
  };


  const confirmCheckout = async () => {
    try {
      setIsPrinting(true);

      if (isOrderSaved && lastOrder) {
        await printReceipt(lastOrder);
        setIsPrinting(false);
        return;
      }

      // 1. Prepare Order Data
      const orderData = {
        user_id: user.id,
        items: cart.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          bread_type: item.breadType || null
        })),
        total_amount: cart.total,
        payment_method: 'cash',
        customer_name: customerData.name || null,
        customer_phone: customerData.phone || null,
        customer_birthday: customerData.birthday || null,
        created_at: new Date().toISOString()
      };

      // 2. Fetch Next Order ID
      let nextId = "T-" + Date.now().toString().slice(-6);
      try {
        const idRes = await axios.get('http://localhost:5000/api/orders/next-id');
        nextId = idRes.data.nextId;
      } catch (e) {
        console.warn('Backend ID fetch failed');
      }

      const orderWithId = { ...orderData, id: nextId };
      setPendingOrderData(orderWithId);

      // 3. Automated Print and Save
      const printSuccess = await printReceipt(orderWithId);

      if (printSuccess) {
        // Save to DB automatically if print command sent successfully
        await saveOrderToDB(orderWithId);
      } else {
        // If print fails, show the retry confirmation modal
        setIsWaitingForPrintConfirmation(true);
      }

    } catch (err) {
      setIsPrinting(false);
      console.error('Checkout Error:', err);
      showAlert('فشل في تجهيز الطلب: ' + (err.response?.data?.error || err.message), 'error');
    }
  };


  const saveOrderToDB = async (orderToSave = pendingOrderData) => {
    try {
      setIsPrinting(true);
      const res = await axios.post('http://localhost:5000/api/orders', orderToSave);

      const finalOrderId = res.data.id;

      setLastOrder({ ...pendingOrderData, id: finalOrderId });
      setIsOrderSaved(true);
      setIsWaitingForPrintConfirmation(false);
      setIsPrinting(false);

      showAlert('تم حفظ الطلب بنجاح', 'success');

      // Automatic cleanup
      setTimeout(startNewOrder, 2000);
    } catch (err) {
      setIsPrinting(false);
      console.error('Save Order Error:', err);
      showAlert('فشل في حفظ الطلب في قاعدة البيانات: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  return (
    <MainLayout
      toggleTheme={toggleTheme}
      isDarkMode={isDarkMode}
      setIsCartOpen={setIsCartOpen}
      isCartOpen={isCartOpen}
      cartCount={cart.items.reduce((sum, i) => sum + i.quantity, 0)}
    >
      {/* Products Column */}
      <div className="flex-1 flex flex-col p-3 md:p-6 overflow-hidden min-h-0">
        {/* Categories - flex-wrap on mobile, no horizontal scroll */}
        <div className="shrink-0 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl p-3 md:p-4 mb-4 md:mb-6 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-full font-black text-xs md:text-sm transition-all border whitespace-nowrap ${!selectedCategory ? 'bg-fomo-orange border-fomo-orange text-white shadow-lg shadow-fomo-orange/20' : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-fomo-orange'}`}
            >
              <LayoutGrid size={16} />
              <span>الكل</span>
            </button>
            <button
              onClick={() => setSelectedCategory('offers_virtual')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-full font-black text-xs md:text-sm transition-all border whitespace-nowrap ${selectedCategory === 'offers_virtual' ? 'bg-fomo-orange border-fomo-orange text-white shadow-lg shadow-fomo-orange/20' : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-fomo-orange'}`}
            >
              <Tag size={16} />
              <span>العروض</span>
            </button>
            {mainCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-full font-black text-xs md:text-sm transition-all border whitespace-nowrap ${selectedCategory === cat.id ? 'bg-fomo-orange border-fomo-orange text-white shadow-lg shadow-fomo-orange/20' : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-fomo-orange'}`}
              >
                {getCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center mb-4 md:mb-6 shrink-0">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن وجبتك المفضلة..."
              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full py-2.5 md:py-3 pr-10 md:pr-12 pl-4 md:pl-6 focus:outline-none focus:border-fomo-orange focus:ring-1 focus:ring-fomo-orange transition-all text-sm text-zinc-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Products Grid - scrollable */}
        {selectedCategory === 'offers_virtual' ? (
          <div className="flex-1 overflow-y-auto pr-1 pb-10 space-y-6 md:space-y-8">
            {filteredProducts.filter(p => p.category_id === sandwichOfferCatId).length > 0 && (
              <div>
                <h2 className="text-base md:text-xl font-black text-zinc-800 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                  <Utensils size={18} className="text-fomo-orange" /> عروض السندوتشات
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {filteredProducts.filter(p => p.category_id === sandwichOfferCatId).map(product => renderProductCard(product))}
                </div>
              </div>
            )}
            {filteredProducts.filter(p => p.category_id === fatayerOfferCatId).length > 0 && (
              <div>
                <h2 className="text-base md:text-xl font-black text-zinc-800 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                  <LayoutGrid size={18} className="text-fomo-orange" /> عروض الفطائر
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {filteredProducts.filter(p => p.category_id === fatayerOfferCatId).map(product => renderProductCard(product))}
                </div>
              </div>
            )}
            {filteredProducts.length === 0 && (
              <div className="text-center py-10 text-zinc-400 font-bold">لا يوجد نتائج للبحث</div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 pb-10">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map(product => renderProductCard(product))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-10 text-zinc-400 font-bold">لا يوجد نتائج للبحث</div>
            )}
          </div>
        )}
      </div>

      {/* Cart: mobile=fixed overlay, desktop=sidebar */}
      {isCartOpen && <div className="fixed inset-0 bg-black/50 z-[55] lg:hidden" onClick={() => setIsCartOpen(false)} />}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-[60] lg:z-10
          transition-all duration-300 ease-in-out
          border-r lg:border-r-0 lg:border-l border-zinc-200 dark:border-zinc-800
          bg-white dark:bg-fomo-dark-bg lg:bg-zinc-50 lg:dark:bg-zinc-900/20
          h-full flex flex-col shrink-0 shadow-2xl lg:shadow-none
          ${isCartOpen ? 'w-[85vw] sm:w-80 lg:w-96 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'}
        `}
      >
        {/* Cart Header */}
        <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-fomo-orange" size={22} />
            <h2 className="text-lg md:text-xl font-black text-zinc-800 dark:text-white">الطلب الحالي</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(clearCart())} className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors font-bold">
              مسح الكل
            </button>
            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg">
              <Trash2 size={20} className="rotate-45" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <ShoppingCart size={48} className="opacity-10 mb-4" />
              <p className="font-bold text-sm">السلة فارغة حالياً</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 md:gap-4 group">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs md:text-sm truncate text-zinc-800 dark:text-white">
                    {item.name}
                    {item.breadType && <span className="text-zinc-400 text-xs mr-1">({item.breadType})</span>}
                  </h4>
                  <p className="text-fomo-orange font-black text-xs">{item.price} ج.م</p>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <button onClick={(e) => { e.stopPropagation(); dispatch(updateQuantity({ cartId: item.cartId, quantity: item.quantity - 1 })); }} className="p-1.5 text-zinc-400 hover:text-fomo-orange transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-xs text-zinc-700 dark:text-white px-2 min-w-[24px] text-center">{item.quantity}</span>
                    <button onClick={(e) => { e.stopPropagation(); dispatch(updateQuantity({ cartId: item.cartId, quantity: item.quantity + 1 })); }} className="p-1.5 text-zinc-400 hover:text-fomo-orange transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); dispatch(removeFromCart(item.cartId)); }} className="p-1.5 md:p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 md:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/40 shrink-0">
          <div className="flex justify-between text-zinc-500 font-bold text-sm mb-3 md:mb-4">
            <span>الإجمالي</span>
            <span className="text-fomo-orange text-xl md:text-2xl font-black">{cart.total.toFixed(2)} ج.م</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.items.length === 0}
            className="w-full bg-fomo-orange hover:bg-orange-600 text-white py-3 md:py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale text-sm md:text-base"
          >
            تأكيد الطلب
          </button>
        </div>
      </aside>

      {/* Customer Data Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-md rounded-2xl md:rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-fomo-dark-bg z-10">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">بيانات العميل</h2>
                <p className="text-zinc-500 text-xs font-bold mt-1">(اختياري)</p>
              </div>
              <button onClick={() => setIsCustomerModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Trash2 size={22} className="rotate-45" />
              </button>
            </div>

            <div className="p-4 md:p-8 space-y-5 md:space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">اسم العميل</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 outline-none focus:border-fomo-orange transition-all text-zinc-800 dark:text-white"
                      placeholder="أدخل اسم العميل..."
                      value={customerData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomerData({ ...customerData, name: val });
                        if (val.length > 0) {
                          const filtered = customers.filter(c =>
                            c.customer_name?.toLowerCase().includes(val.toLowerCase()) ||
                            c.customer_phone?.includes(val)
                          );
                          setFilteredCustomers(filtered);
                          setShowCustomerDropdown(true);
                        } else {
                          setShowCustomerDropdown(false);
                        }
                      }}
                      onFocus={() => {
                        if (customerData.name.length > 0) setShowCustomerDropdown(true);
                      }}
                    />
                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-[110] max-h-48 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {filteredCustomers.map((c, i) => (
                          <div
                            key={i}
                            className="p-3 hover:bg-fomo-orange/10 cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors"
                            onClick={() => {
                              setCustomerData({
                                name: c.customer_name || '',
                                phone: c.customer_phone || '',
                                birthday: c.customer_birthday || ''
                              });
                              setShowCustomerDropdown(false);
                            }}
                          >
                            <p className="font-bold text-sm text-zinc-800 dark:text-white">{c.customer_name}</p>
                            <p className="text-xs text-zinc-500">{c.customer_phone}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 outline-none focus:border-fomo-orange transition-all text-zinc-800 dark:text-white"
                    placeholder="01xxxxxxxxx"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">تاريخ الميلاد</label>
                  <input
                    type="date"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-4 outline-none focus:border-fomo-orange transition-all text-zinc-800 dark:text-white"
                    value={customerData.birthday}
                    onChange={(e) => setCustomerData({ ...customerData, birthday: e.target.value })}
                  />
                </div>
              </div>

              {isWaitingForPrintConfirmation ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-800 text-center">
                    <p className="text-orange-800 dark:text-orange-200 font-bold">هل تمت عملية الطباعة بنجاح؟</p>
                    <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">لن يتم حفظ الطلب إلا بعد تأكيد خروج الإيصال</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsWaitingForPrintConfirmation(false);
                        setIsCustomerModalOpen(false);
                      }}
                      className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-4 rounded-2xl font-black transition-all active:scale-95"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={saveOrderToDB}
                      disabled={isPrinting}
                      className="flex-[2] bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-green-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isPrinting ? 'جاري الحفظ...' : 'نعم، إتمام وحفظ الطلب'}
                    </button>
                  </div>
                  <button
                    onClick={() => printReceipt(pendingOrderData)}
                    className="w-full text-zinc-500 dark:text-zinc-400 text-sm font-bold hover:underline"
                  >
                    إعادة محاولة الطباعة
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (isOrderSaved) {
                        startNewOrder();
                      } else {
                        setIsCustomerModalOpen(false);
                      }
                    }}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-4 rounded-2xl font-black transition-all active:scale-95"
                  >
                    {isOrderSaved ? 'إغلاق' : 'إلغاء'}
                  </button>
                  <button
                    onClick={confirmCheckout}
                    disabled={isPrinting}
                    className={`flex-[2] py-4 rounded-2xl font-black shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isOrderSaved ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-zinc-900/20' : 'bg-fomo-orange hover:bg-orange-600 text-white shadow-fomo-orange/20'}`}
                  >
                    {isPrinting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        جاري التجهيز...
                      </>
                    ) : isOrderSaved ? (
                      <>
                        <Printer size={20} /> إعادة طباعة
                      </>
                    ) : 'تأكيد وإتمام الطلب'}
                  </button>
                </div>
              )}
              {isOrderSaved && (
                <button
                  onClick={startNewOrder}
                  className="w-full mt-4 bg-fomo-orange hover:bg-orange-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-fomo-orange/20 animate-in slide-in-from-top-2 duration-300"
                >
                  بدء طلب جديد
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Bread Selection Modal */}
      {isBreadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-3 md:p-4" dir="rtl">
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-sm rounded-2xl md:rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
            <div className="p-5 md:p-8 text-center">
              <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mb-2">{selectedProductForBread?.name}</h2>
              <p className="text-zinc-500 font-bold mb-5 md:mb-8 text-sm md:text-base">اختر نوع الخبز</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => addSandwichWithBread('فينو')}
                  className="bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent hover:border-fomo-orange p-6 rounded-[24px] transition-all group flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 bg-fomo-orange/10 rounded-full flex items-center justify-center text-fomo-orange group-hover:scale-110 transition-transform">
                    <Utensils size={24} />
                  </div>
                  <span className="font-black text-zinc-800 dark:text-white">فينو</span>
                </button>
                <button
                  onClick={() => addSandwichWithBread('شامي')}
                  className="bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent hover:border-fomo-orange p-6 rounded-[24px] transition-all group flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 bg-fomo-orange/10 rounded-full flex items-center justify-center text-fomo-orange group-hover:scale-110 transition-transform">
                    <Utensils size={24} />
                  </div>
                  <span className="font-black text-zinc-800 dark:text-white">شامي</span>
                </button>
                <button
                  onClick={() => addSandwichWithBread('سوري')}
                  className="bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent hover:border-fomo-orange p-6 rounded-[24px] transition-all group flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 bg-fomo-orange/10 rounded-full flex items-center justify-center text-fomo-orange group-hover:scale-110 transition-transform">
                    <Utensils size={24} />
                  </div>
                  <span className="font-black text-zinc-800 dark:text-white">سوري</span>
                </button>
              </div>

              <button
                onClick={() => setIsBreadModalOpen(false)}
                className="mt-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isWaitingForPrintConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Printer className="text-orange-600 dark:text-orange-400" size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">
                تأكيد طباعة الإيصال
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                يرجى الضغط على الزر لطباعة الإيصال أولاً، ثم التأكد من خروج الورقة بنجاح قبل الحفظ.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => printReceipt()}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  <Printer size={24} />
                  طباعة الإيصال الآن
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={saveOrderToDB}
                    disabled={isPrinting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isPrinting ? 'جاري الحفظ...' : 'نعم، إتمام وحفظ'}
                  </button>
                  <button
                    onClick={() => setIsWaitingForPrintConfirmation(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl transition-all active:scale-95"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

export default POS;
