import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

type ModalType = 
  | 'none'
  | 'upgrade'
  | 'settings'
  | 'add-position'
  | 'modify-allocation'
  | 'asset-details'
  | 'notifications'
  | 'user-profile'
  | 'transaction-details';

interface UIContextType {
  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  
  // Modals & Panels
  activeModal: ModalType;
  modalData: any;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [modalData, setModalData] = useState<any>(null);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openModal = useCallback((type: ModalType, data?: any) => {
    setActiveModal(type);
    if (data) setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal('none');
    setTimeout(() => setModalData(null), 300); // clear after exit animation
  }, []);

  return (
    <UIContext.Provider value={{
      toasts, addToast, removeToast,
      activeModal, modalData, openModal, closeModal
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
