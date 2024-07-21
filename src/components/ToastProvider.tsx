'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import Toast from './Toast';

type ToastContextType = {
  showToast: (message: string, type?: 'info' | 'error', duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error'; duration: number } | null>(null);

  const showToast = (message: string, type: 'info' | 'error' = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
      throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};