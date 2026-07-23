import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 2500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-[#E5E5EA] p-3.5 flex items-center justify-between space-x-3 text-xs sm:text-sm text-[#1D1D1F] animate-slide-up transition-all ${
              toast.type === 'error'
                ? 'border-l-4 border-l-[#D9552C]'
                : toast.type === 'info'
                ? 'border-l-4 border-l-[#2B6E7A]'
                : 'border-l-4 border-l-[#136C3F]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-[#D9552C] shrink-0" strokeWidth={1.5} />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-[#2B6E7A] shrink-0" strokeWidth={1.5} />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#136C3F] shrink-0" strokeWidth={1.5} />
              )}
              <span className="font-medium text-[#1D1D1F] leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8E8E93] hover:text-[#1D1D1F] p-1 rounded-full hover:bg-[#F2F2F7] transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
