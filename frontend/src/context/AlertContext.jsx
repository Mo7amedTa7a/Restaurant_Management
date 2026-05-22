import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'success', // 'success', 'error', 'info', 'confirm'
    onConfirm: null
  });

  const showAlert = (message, type = 'success', onConfirm = null) => {
    setAlert({ isOpen: true, message, type, onConfirm });
  };

  const closeAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAlert}></div>
          <div className="bg-white dark:bg-fomo-dark-bg w-full max-w-sm rounded-[32px] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden relative z-10 animate-in zoom-in-95 duration-300" dir="rtl">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                {alert.type === 'success' && (
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full text-green-600 dark:text-green-400">
                    <CheckCircle2 size={48} />
                  </div>
                )}
                {alert.type === 'error' && (
                  <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full text-red-600 dark:text-red-400">
                    <AlertCircle size={48} />
                  </div>
                )}
                {alert.type === 'confirm' && (
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full text-fomo-orange">
                    <Info size={48} />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">
                {alert.type === 'success' ? 'نجاح العملية' : alert.type === 'error' ? 'خطأ!' : 'تأكيد'}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-8">{alert.message}</p>
              
              <div className="flex gap-3">
                {alert.type === 'confirm' ? (
                  <>
                    <button 
                      onClick={closeAlert}
                      className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-3 rounded-2xl font-black transition-all active:scale-95"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={() => { alert.onConfirm(); closeAlert(); }}
                      className="flex-1 bg-fomo-orange hover:bg-orange-600 text-white py-3 rounded-2xl font-black shadow-lg shadow-fomo-orange/20 transition-all active:scale-95"
                    >
                      تأكيد
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={closeAlert}
                    className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl"
                  >
                    موافق
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
