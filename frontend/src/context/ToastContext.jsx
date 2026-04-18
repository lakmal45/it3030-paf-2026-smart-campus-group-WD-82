import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col space-y-4 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "error": return <AlertCircle className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgClass = () => {
    switch (toast.type) {
      case "success": return "bg-white border-emerald-100 ring-emerald-50";
      case "error": return "bg-white border-rose-100 ring-rose-50";
      default: return "bg-white border-blue-100 ring-blue-50";
    }
  };

  return (
    <div className={`pointer-events-auto flex items-center p-4 rounded-2xl shadow-xl border min-w-[300px] animate-in slide-in-from-right-full duration-300 ring-4 ${getBgClass()}`}>
      <div className="mr-3">{getIcon()}</div>
      <div className="flex-1 mr-4">
        <p className="text-sm font-bold text-slate-800">{toast.message}</p>
      </div>
      <button 
        onClick={() => onRemove(toast.id)}
        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
