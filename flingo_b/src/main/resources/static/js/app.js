// ========================================
// FLINGO - Main JavaScript Application
// Production-Ready: Handles all backend errors gracefully
// Works on localhost, ngrok, and all environments
// ========================================

// ===== CONFIGURATION =====
const CONFIG = {
    API_BASE_URL: '', // Empty = same domain (works everywhere!)
    TOAST_DURATION: 3000,
    MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
};

// ===== STATE MANAGEMENT =====
let currentReceivedContent = null;
let selectedFile = null;

// ===== DOM ELEMENTS =====
const elements = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Send Tab
    textInput: document.getElementById('textInput'),
    charCount: document.getElementById('charCount'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    selectedFile: document.getElementById('selectedFile'),
    fileName: document.getElementById('fileName'),
    removeFile: document.getElementById('removeFile'),
    submitBtn: document.getElementById('submitBtn'),
    resultSection: document.getElementById('resultSection'),
    shareCode: document.getElementById('shareCode'),
    copyBtn: document.getElementById('copyBtn'),
    qrCode: document.getElementById('qrCode'),
    newShareBtn: document.getElementById('newShareBtn'),
    
    // Receive Tab
    receiveCode: document.getElementById('receiveCode'),
    receiveBtn: document.getElementById('receiveBtn'),
    contentDisplay: document.getElementById('contentDisplay'),
    contentBox: document.getElementById('contentBox'),
    fileBox: document.getElementById('fileBox'),
    receivedFileName: document.getElementById('receivedFileName'),
    receivedFileSize: document.getElementById('receivedFileSize'),
    downloadBtn: document.getElementById('downloadBtn'),
    contentTimestamp: document.getElementById('contentTimestamp'),
    copyContentBtn: document.getElementById('copyContentBtn'),
    shareContentBtn: document.getElementById('shareContentBtn'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ===== INITIALIZATION =====
function init() {
    setupEventListeners();
    checkForCodeInURL();
    console.log('FLINGO initialized successfully!');
}

// ===== CHECK FOR CODE IN URL =====
function checkForCodeInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        switchTab('receive');
        elements.receiveCode.value = code.toUpperCase();
        setTimeout(() => handleReceive(), 500);
    }
}

// ===== EVENT LISTENERS =====
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
    elements.removeFile.addEventListener('click', clearFileSelection);
    
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

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    elements.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

// ===== CHARACTER COUNTER =====
function updateCharCount() {
    const count = elements.textInput.value.length;
    elements.charCount.textContent = count;
}

// ===== FILE HANDLING =====
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) validateAndDisplayFile(file);
}

function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) validateAndDisplayFile(file);
}

function validateAndDisplayFile(file) {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast('File size exceeds 10MB limit', 'error');
        return;
    }
    
    selectedFile = file;
    elements.fileName.textContent = file.name;
    elements.selectedFile.style.display = 'flex';
    elements.uploadArea.style.display = 'none';
    elements.textInput.disabled = true;
}

function clearFileSelection() {
    selectedFile = null;
    elements.fileInput.value = '';
    elements.selectedFile.style.display = 'none';
    elements.uploadArea.style.display = 'block';
    elements.textInput.disabled = false;
}

// ===== SUBMIT CONTENT =====
async function handleSubmit() {
    const textContent = elements.textInput.value.trim();
    
    // Validate input
    if (!textContent && !selectedFile) {
        showToast('Please enter text or select a file to share', 'error');
        return;
    }
    
    // Show loading
    elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    elements.submitBtn.disabled = true;
    
    try {
        let data;
        
        if (selectedFile) {
            // Upload file
            data = await uploadFile(selectedFile);
        } else {
            // Upload text
            data = await uploadText(textContent);
        }
        
        // Check if we got valid data with a code
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

async function uploadText(text) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/test-save?text=${encodeURIComponent(text)}`, {
            method: 'GET'
        });
        
        // Even if status is not ok, try to parse JSON
        const data = await response.json();
        
        // Check if we got a valid response with code
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

async function uploadFile(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/share-file`, {
            method: 'POST',
            body: formData
        });
        
        // Try to parse JSON response
        const data = await response.json();
        
        // Check if we got a valid response with code
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

// ===== DISPLAY SHARE CODE =====
function displayShareCode(code) {
    elements.shareCode.textContent = code;
    elements.resultSection.style.display = 'block';
    
    // Generate QR code with full URL
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

// ===== COPY SHARE CODE (JUST THE CODE, NOT URL) =====
function copyShareCode() {
    const code = elements.shareCode.textContent;
    
    // Copy just the code
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
        // Fallback for HTTP or older browsers
        fallbackCopy(code, elements.copyBtn);
    }
}

// ===== RESET SEND FORM =====
function resetSendForm() {
    elements.textInput.value = '';
    elements.textInput.disabled = false;
    updateCharCount();
    clearFileSelection();
    elements.resultSection.style.display = 'none';
    elements.textInput.focus();
}

// ===== RECEIVE CONTENT (HANDLES ALL BACKEND ERRORS) =====
async function handleReceive() {
    const code = elements.receiveCode.value.trim().toUpperCase();
    
    if (!code || code.length !== 6) {
        showToast('Please enter a valid 6-digit code', 'error');
        return;
    }
    
    elements.receiveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    elements.receiveBtn.disabled = true;
    
    let foundContent = false;
    
    try {
        // Try text first (handles 500 errors gracefully)
        try {
            const textResponse = await fetch(`${CONFIG.API_BASE_URL}/test-get?code=${code}`);
            
            // Only proceed if we got a 200 response
            if (textResponse.ok) {
                const textData = await textResponse.json();
                
                // Verify we have valid text data
                if (textData && textData.content) {
                    displayReceivedText(textData);
                    showToast('Content retrieved successfully!', 'success');
                    foundContent = true;
                }
            }
        } catch (textError) {
            // Silently ignore text errors and try file
            console.log('Text not found, trying file...');
        }
        
        // If text not found, try file (handles 500 errors gracefully)
        if (!foundContent) {
            try {
                const fileResponse = await fetch(`${CONFIG.API_BASE_URL}/file/${code}`);
                
                // Only proceed if we got a 200 response
                if (fileResponse.ok) {
                    const fileData = await fileResponse.json();
                    
                    // Verify we have valid file data
                    if (fileData && fileData.originalFilename) {
                        displayReceivedFile(fileData);
                        showToast('File retrieved successfully!', 'success');
                        foundContent = true;
                    }
                }
            } catch (fileError) {
                // Silently ignore file errors
                console.log('File not found either');
            }
        }
        
        // If nothing found, show error
        if (!foundContent) {
            showToast('Invalid code or content not found', 'error');
            elements.contentDisplay.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Receive error:', error);
        showToast('Invalid code or content not found', 'error');
        elements.contentDisplay.style.display = 'none';
    } finally {
        elements.receiveBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Get Content';
        elements.receiveBtn.disabled = false;
    }
}

// ===== DISPLAY RECEIVED TEXT =====
function displayReceivedText(data) {
    currentReceivedContent = data;
    elements.contentDisplay.style.display = 'block';
    elements.contentBox.style.display = 'block';
    elements.fileBox.style.display = 'none';
    
    elements.contentBox.textContent = data.content;
    const timestamp = new Date(data.createdAt);
    elements.contentTimestamp.textContent = `Shared on ${timestamp.toLocaleString()}`;
    
    elements.contentDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== DISPLAY RECEIVED FILE =====
function displayReceivedFile(data) {
    currentReceivedContent = data;
    elements.contentDisplay.style.display = 'block';
    elements.contentBox.style.display = 'none';
    elements.fileBox.style.display = 'block';
    
    elements.receivedFileName.textContent = data.originalFilename;
    elements.receivedFileSize.textContent = formatFileSize(data.size);
    
    const timestamp = new Date(data.createdAt);
    elements.contentTimestamp.textContent = `Shared on ${timestamp.toLocaleString()}`;
    
    elements.contentDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== DOWNLOAD FILE (PRODUCTION-READY) =====
function downloadReceivedFile() {
    if (currentReceivedContent && currentReceivedContent.code) {
        try {
            // Use the download endpoint
            const downloadUrl = `${CONFIG.API_BASE_URL}/download/${currentReceivedContent.code}`;
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = currentReceivedContent.originalFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('Download started!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showToast('Download failed. Please try again.', 'error');
        }
    }
}

// ===== COPY RECEIVED CONTENT (WITH HTTP FALLBACK) =====
function copyReceivedContent() {
    if (!currentReceivedContent) return;
    
    const textToCopy = currentReceivedContent.content || currentReceivedContent.originalFilename;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Content copied to clipboard!', 'success');
            elements.copyContentBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                elements.copyContentBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(() => {
            fallbackCopy(textToCopy, elements.copyContentBtn);
        });
    } else {
        fallbackCopy(textToCopy, elements.copyContentBtn);
    }
}

// ===== FALLBACK COPY METHOD (WORKS ON HTTP) =====
function fallbackCopy(text, buttonElement) {
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

// ===== SHARE RECEIVED CONTENT =====
function shareReceivedContent() {
    if (currentReceivedContent) {
        switchTab('send');
        if (currentReceivedContent.content) {
            elements.textInput.value = currentReceivedContent.content;
            updateCharCount();
        }
        elements.textInput.focus();
        showToast('Content loaded! Click "Generate Share Code" to share', 'success');
    }
}

// ===== UTILITY FUNCTIONS =====
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, CONFIG.TOAST_DURATION);
}

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', init);
