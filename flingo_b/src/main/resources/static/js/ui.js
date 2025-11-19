// ========================================
// FLINGO - UI Functions
// ========================================

import { elements } from './dom.js';
import { showToast, fallbackCopy } from './utils.js';

// Switch tabs
export function switchTab(tabName) {
    elements.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

// Update character count
export function updateCharCount() {
    const count = elements.textInput.value.length;
    elements.charCount.textContent = count;
}

// Copy share code
export function copyShareCode() {
    const code = elements.shareCode.textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(() => {
            showToast('Code copied to clipboard!', 'success');
            elements.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                elements.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(() => {
            fallbackCopy(code, elements.copyBtn);
        });
    } else {
        fallbackCopy(code, elements.copyBtn);
    }
}
