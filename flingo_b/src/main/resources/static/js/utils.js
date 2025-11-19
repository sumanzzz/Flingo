// ========================================
// FLINGO - Utility Functions
// ========================================

import { CONFIG } from './config.js';
import { elements } from './dom.js';

// Format file size
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Show toast notification
export function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, CONFIG.TOAST_DURATION);
}

// Fallback copy method (works on HTTP)
export function fallbackCopy(text, buttonElement) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Copied to clipboard!', 'success');
            
            if (buttonElement) {
                buttonElement.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    buttonElement.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }
        } else {
            showToast('Copy failed. Please copy manually.', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showToast('Copy not supported. Please copy manually.', 'error');
    }
    
    document.body.removeChild(textArea);
}
