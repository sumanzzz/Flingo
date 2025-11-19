// ========================================
// FLINGO - Main JavaScript Application
// Updated: Smart QR codes with auto-fetch
// ========================================

// ===== CONFIGURATION =====
const CONFIG = {
    API_BASE_URL: '',  // Empty = same domain (works with ngrok!)
    TOAST_DURATION: 3000
};

// ===== STATE MANAGEMENT =====
let currentReceivedContent = null;

// ===== DOM ELEMENTS =====
const elements = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Send Tab
    textInput: document.getElementById('textInput'),
    charCount: document.getElementById('charCount'),
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
    checkForCodeInURL();  // Check if code is in URL (from QR scan)
    console.log('FLINGO initialized successfully!');
}

// ===== CHECK FOR CODE IN URL =====
function checkForCodeInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // Switch to receive tab
        switchTab('receive');
        // Fill in the code
        elements.receiveCode.value = code.toUpperCase();
        // Auto-fetch after a short delay
        setTimeout(() => {
            handleReceive();
        }, 500);
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
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    // Update button states
    elements.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update content visibility
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

// ===== CHARACTER COUNTER =====
function updateCharCount() {
    const count = elements.textInput.value.length;
    elements.charCount.textContent = count;
}

// ===== SUBMIT CONTENT =====
async function handleSubmit() {
    const textContent = elements.textInput.value.trim();
    
    // Validate input
    if (!textContent) {
        showToast('Please enter some text to share', 'error');
        return;
    }
    
    // Show loading
    elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    elements.submitBtn.disabled = true;
    
    try {
        // Call Spring Boot API
        const response = await fetch(`${CONFIG.API_BASE_URL}/test-save?text=${encodeURIComponent(textContent)}`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error('Failed to save text');
        }
        
        const data = await response.json();
        
        // Display result
        displayShareCode(data.code);
        
        showToast('Content shared successfully!', 'success');
        
    } catch (error) {
        console.error('Submit error:', error);
        showToast('Failed to share content. Please try again.', 'error');
    } finally {
        // Reset button
        elements.submitBtn.innerHTML = '<i class="fas fa-share"></i> Generate Share Code';
        elements.submitBtn.disabled = false;
    }
}

// ===== DISPLAY SHARE CODE =====
function displayShareCode(code) {
    elements.shareCode.textContent = code;
    elements.resultSection.style.display = 'block';
    
    // Generate QR code with FULL URL (not just the code!)
    elements.qrCode.innerHTML = ''; // Clear previous QR code
    
    // Create the full URL with code parameter
    const fullURL = `${window.location.origin}${window.location.pathname}?code=${code}`;
    
    new QRCode(elements.qrCode, {
        text: fullURL,  // QR contains full URL now!
        width: 150,
        height: 150,
        colorDark: '#8b7bd8',
        colorLight: '#251f35'
    });
    
    // Scroll to result
    elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== COPY SHARE CODE =====
function copyShareCode() {
    const code = elements.shareCode.textContent;
    // Copy the full URL, not just the code
    const fullURL = `${window.location.origin}${window.location.pathname}?code=${code}`;
    
    navigator.clipboard.writeText(fullURL).then(() => {
        showToast('Share link copied to clipboard!', 'success');
        elements.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            elements.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    }).catch(() => {
        showToast('Failed to copy link', 'error');
    });
}

// ===== RESET SEND FORM =====
function resetSendForm() {
    elements.textInput.value = '';
    updateCharCount();
    elements.resultSection.style.display = 'none';
    elements.textInput.focus();
}

// ===== RECEIVE CONTENT =====
async function handleReceive() {
    const code = elements.receiveCode.value.trim().toUpperCase();
    
    if (!code || code.length !== 6) {
        showToast('Please enter a valid 6-digit code', 'error');
        return;
    }
    
    // Show loading
    elements.receiveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    elements.receiveBtn.disabled = true;
    
    try {
        // Call Spring Boot API
        const response = await fetch(`${CONFIG.API_BASE_URL}/test-get?code=${code}`);
        
        if (!response.ok) {
            if (response.status === 500) {
                throw new Error('Invalid code or content not found');
            }
            throw new Error('Failed to retrieve content');
        }
        
        const data = await response.json();
        
        // Display content
        displayReceivedContent(data);
        
        showToast('Content retrieved successfully!', 'success');
        
    } catch (error) {
        console.error('Receive error:', error);
        showToast(error.message, 'error');
        elements.contentDisplay.style.display = 'none';
    } finally {
        elements.receiveBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
        elements.receiveBtn.disabled = false;
    }
}

// ===== DISPLAY RECEIVED CONTENT =====
function displayReceivedContent(data) {
    currentReceivedContent = data;
    elements.contentDisplay.style.display = 'block';
    
    // Display the content
    elements.contentBox.textContent = data.content;
    
    // Display timestamp
    const timestamp = new Date(data.createdAt);
    elements.contentTimestamp.textContent = `Shared on ${timestamp.toLocaleString()}`;
    
    // Scroll to content
    elements.contentDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== COPY RECEIVED CONTENT =====
function copyReceivedContent() {
    if (currentReceivedContent) {
        navigator.clipboard.writeText(currentReceivedContent.content).then(() => {
            showToast('Content copied to clipboard!', 'success');
            elements.copyContentBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                elements.copyContentBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(() => {
            showToast('Failed to copy content', 'error');
        });
    }
}

// ===== SHARE RECEIVED CONTENT AGAIN =====
function shareReceivedContent() {
    if (currentReceivedContent) {
        // Switch to send tab
        switchTab('send');
        // Fill the text input
        elements.textInput.value = currentReceivedContent.content;
        updateCharCount();
        // Focus on input
        elements.textInput.focus();
        showToast('Content loaded! Click "Generate Share Code" to share', 'success');
    }
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

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', init);
