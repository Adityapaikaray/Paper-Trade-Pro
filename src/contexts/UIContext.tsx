import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
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
  | 'transaction-details'
  | 'reset-portfolio';

interface UIContextType {
  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
  
  // Modals & Panels
  activeModal: ModalType;
  modalData: any;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;

  // AI Copilot
  isCopilotOpen: boolean;
  setIsCopilotOpen: React.Dispatch<React.SetStateAction<boolean>>;
  copilotPrompt: string | null;
  setCopilotPrompt: React.Dispatch<React.SetStateAction<string | null>>;
  openCopilotWithPrompt: (prompt: string) => void;

  // Mobile Menu
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileMenu: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [modalData, setModalData] = useState<any>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openCopilotWithPrompt = useCallback((prompt: string) => {
    setCopilotPrompt(prompt);
    setIsCopilotOpen(true);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    
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
      activeModal, modalData, openModal, closeModal,
      isCopilotOpen, setIsCopilotOpen,
      copilotPrompt, setCopilotPrompt, openCopilotWithPrompt,
      isMobileMenuOpen, setIsMobileMenuOpen, toggleMobileMenu
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
