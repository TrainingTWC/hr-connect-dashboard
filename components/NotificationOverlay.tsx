import React from 'react';

interface NotificationOverlayProps {
  isVisible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ 
  isVisible, 
  message,
  type = 'success',
  onClose 
}) => {
  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`${getTypeStyles()} rounded-xl px-8 py-6 shadow-2xl max-w-sm w-full mx-4 pointer-events-auto transform animate-bounce`}>
        <div className="flex items-center justify-center space-x-3">
          {getIcon()}
          <span className="text-lg font-semibold">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationOverlay;