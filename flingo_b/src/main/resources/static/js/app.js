// ========================================
// FLINGO - Main Application
// ========================================

import { elements } from './dom.js';
import { switchTab, copyShareCode } from './ui.js';
import { 
    updateCharCount, 
    handleFileSelect, 
    handleDragOver, 
    handleDragLeave, 
    handleFileDrop, 
    clearFileSelectionHandler, 
    handleSubmit, 
    resetSendForm 
} from './upload.js';
import { 
    handleReceive, 
    downloadReceivedFile, 
    copyReceivedContent, 
    shareReceivedContent 
} from './receive.js';

// Check for code in URL
function checkForCodeInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        switchTab('receive');
        elements.receiveCode.value = code.toUpperCase();
        setTimeout(() => handleReceive(), 500);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Character counter
    elements.textInput.addEventListener('input', updateCharCount);
    
    // File upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeFile.addEventListener('click', clearFileSelectionHandler);
    
    // Drag and drop
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleFileDrop);
    
    // Submit
    elements.submitBtn.addEventListener('click', handleSubmit);
    
    // Copy code
    elements.copyBtn.addEventListener('click', copyShareCode);
    
    // New share
    elements.newShareBtn.addEventListener('click', resetSendForm);
    
    // Receive
    elements.receiveBtn.addEventListener('click', handleReceive);
    elements.receiveCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleReceive();
    });
    
    // Auto-uppercase for receive code
    elements.receiveCode.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
    
    // Content actions
    elements.copyContentBtn.addEventListener('click', copyReceivedContent);
    elements.shareContentBtn.addEventListener('click', shareReceivedContent);
    elements.downloadBtn.addEventListener('click', downloadReceivedFile);
}

// Initialize application
function init() {
    setupEventListeners();
    checkForCodeInURL();
    console.log('FLINGO initialized successfully!');
}

// Start application
document.addEventListener('DOMContentLoaded', init);
