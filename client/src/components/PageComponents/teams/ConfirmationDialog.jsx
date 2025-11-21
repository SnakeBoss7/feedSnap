import React from 'react';
import { LucideAlertTriangle, LucideLoader2 } from 'lucide-react';

export const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-bg-secondary w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-500/10' : 'bg-primary2/10'}`}>
            <LucideAlertTriangle size={22} className={isDestructive ? 'text-red-500' : 'text-primary2'} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-6">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-dark-bg-hover rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isDestructive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-primary2 hover:bg-green-600'
              }`}
            >
              {isLoading && <LucideLoader2 size={16} className="animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
