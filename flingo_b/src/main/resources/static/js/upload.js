// ========================================
// FLINGO - Upload Functions
// ========================================

import { CONFIG } from './config.js';
import { elements } from './dom.js';
import { selectedFile, setSelectedFile, clearSelectedFile } from './state.js';
import { showToast } from './utils.js';

// Update character count
export function updateCharCount() {
    const count = elements.textInput.value.length;
    elements.charCount.textContent = count;
}

// Handle file selection
export function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) validateAndDisplayFile(file);
}

// Drag and drop handlers
export function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

export function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

export function handleFileDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) validateAndDisplayFile(file);
}

// Validate and display selected file
function validateAndDisplayFile(file) {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast('File size exceeds 10MB limit', 'error');
        return;
    }
    
    setSelectedFile(file);
    elements.fileName.textContent = file.name;
    elements.selectedFile.style.display = 'flex';
    elements.uploadArea.style.display = 'none';
    elements.textInput.disabled = true;
}

// Clear file selection
export function clearFileSelectionHandler() {
    clearSelectedFile();
    elements.fileInput.value = '';
    elements.selectedFile.style.display = 'none';
    elements.uploadArea.style.display = 'block';
    elements.textInput.disabled = false;
}

// Submit content
export async function handleSubmit() {
    const textContent = elements.textInput.value.trim();
    
    if (!textContent && !selectedFile) {
        showToast('Please enter text or select a file to share', 'error');
        return;
    }
    
    elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    elements.submitBtn.disabled = true;
    
    try {
        let data;
        
        if (selectedFile) {
            data = await uploadFile(selectedFile);
        } else {
            data = await uploadText(textContent);
        }
        
        if (data && data.code) {
            displayShareCode(data.code);
            showToast('Content shared successfully!', 'success');
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showToast('Failed to share content. Please try again.', 'error');
    } finally {
        elements.submitBtn.innerHTML = '<i class="fas fa-share-alt"></i> Generate Share Code';
        elements.submitBtn.disabled = false;
    }
}

// Upload text
async function uploadText(text) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/test-save?text=${encodeURIComponent(text)}`, {
            method: 'GET'
        });
        
        const data = await response.json();
        
        if (data && data.code) {
            return data;
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('Upload text error:', error);
        throw new Error('Failed to save text');
    }
}

// Upload file
async function uploadFile(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/share-file`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data && data.code) {
            return data;
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('Upload file error:', error);
        throw new Error('Failed to upload file');
    }
}

// Display share code
function displayShareCode(code) {
    elements.shareCode.textContent = code;
    elements.resultSection.style.display = 'block';
    
    elements.qrCode.innerHTML = '';
    const fullURL = `${window.location.origin}${window.location.pathname}?code=${code}`;
    
    new QRCode(elements.qrCode, {
        text: fullURL,
        width: 150,
        height: 150,
        colorDark: '#8b7bd8',
        colorLight: '#251f35'
    });
    
    elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Reset send form
export function resetSendForm() {
    elements.textInput.value = '';
    elements.textInput.disabled = false;
    updateCharCount();
    clearFileSelectionHandler();
    elements.resultSection.style.display = 'none';
    elements.textInput.focus();
}
