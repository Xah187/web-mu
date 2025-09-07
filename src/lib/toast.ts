type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// Global toast state
let toasts: ToastItem[] = [];
let listeners: Set<(toasts: ToastItem[]) => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

export const toast = {
  success: (message: string) => {
    const id = Date.now();
    toasts.push({ id, message, type: 'success' });
    notifyListeners();
    
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }, 3000);
  },
  
  error: (message: string) => {
    const id = Date.now();
    toasts.push({ id, message, type: 'error' });
    notifyListeners();
    
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }, 4000);
  },
  
  warning: (message: string) => {
    const id = Date.now();
    toasts.push({ id, message, type: 'warning' });
    notifyListeners();
    
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }, 3000);
  },
  
  info: (message: string) => {
    const id = Date.now();
    toasts.push({ id, message, type: 'info' });
    notifyListeners();
    
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }, 3000);
  },
  
  remove: (id: number) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  },
  
  subscribe: (listener: (toasts: ToastItem[]) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  
  getToasts: () => [...toasts]
};

export type { ToastType, ToastItem };
