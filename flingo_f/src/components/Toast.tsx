import { useEffect } from 'react';
import { CONFIG } from '../config';
import './Toast.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  show: boolean;
  onHide: () => void;
}

export default function Toast({ message, type, show, onHide }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, CONFIG.TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div className={`toast ${type} ${show ? 'show' : ''}`}>
      <i className="fas fa-check-circle"></i>
      <span>{message}</span>
    </div>
  );
}


