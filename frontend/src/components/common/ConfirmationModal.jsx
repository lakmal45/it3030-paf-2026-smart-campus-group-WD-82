import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger" 
}) => {
  if (!isOpen) return null;

  const getButtonClass = () => {
    switch (type) {
      case "danger": return "bg-rose-600 hover:bg-rose-700 shadow-rose-200";
      case "warning": return "bg-amber-500 hover:bg-amber-600 shadow-amber-200";
      default: return "bg-blue-600 hover:bg-blue-700 shadow-blue-200";
    }
  };

  const getIconClass = () => {
    switch (type) {
      case "danger": return "text-rose-600 bg-rose-50";
      case "warning": return "text-amber-600 bg-amber-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`p-3 rounded-xl mr-4 flex-shrink-0 ${getIconClass()}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 sm:gap-0 sm:justify-start">
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95 sm:ml-3 ${getButtonClass()}`}
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 font-bold hover:bg-slate-50 transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
