// ========================================
// FLINGO - Receive Functions
// ========================================

import { CONFIG } from './config.js';
import { elements } from './dom.js';
import { currentReceivedContent, setCurrentReceivedContent } from './state.js';
import { showToast, formatFileSize } from './utils.js';
import { switchTab, updateCharCount } from './ui.js';

// Handle receive content
export async function handleReceive() {
    const code = elements.receiveCode.value.trim().toUpperCase();
    
    if (!code || code.length !== 6) {
        showToast('Please enter a valid 6-digit code', 'error');
        return;
    }
    
    elements.receiveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    elements.receiveBtn.disabled = true;
    
    let foundContent = false;
    
    try {
        // Try text first
        try {
            const textResponse = await fetch(`${CONFIG.API_BASE_URL}/test-get?code=${code}`);
            
            if (textResponse.ok) {
                const textData = await textResponse.json();
                
                if (textData && textData.content) {
                    displayReceivedText(textData);
                    showToast('Content retrieved successfully!', 'success');
                    foundContent = true;
                }
            }
        } catch (textError) {
            console.log('Text not found, trying file...');
        }
        
        // Try file if text not found
        if (!foundContent) {
            try {
                const fileResponse = await fetch(`${CONFIG.API_BASE_URL}/file/${code}`);
                
                if (fileResponse.ok) {
                    const fileData = await fileResponse.json();
                    
                    if (fileData && fileData.originalFilename) {
                        displayReceivedFile(fileData);
                        showToast('File retrieved successfully!', 'success');
                        foundContent = true;
                    }
                }
            } catch (fileError) {
                console.log('File not found either');
            }
        }
        
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

// Display received text
function displayReceivedText(data) {
    setCurrentReceivedContent(data);
    elements.contentDisplay.style.display = 'block';
    elements.contentBox.style.display = 'block';
    elements.fileBox.style.display = 'none';
    
    elements.contentBox.textContent = data.content;
    const timestamp = new Date(data.createdAt);
    elements.contentTimestamp.textContent = `Shared on ${timestamp.toLocaleString()}`;
    
    elements.contentDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display received file
function displayReceivedFile(data) {
    setCurrentReceivedContent(data);
    elements.contentDisplay.style.display = 'block';
    elements.contentBox.style.display = 'none';
    elements.fileBox.style.display = 'block';
    
    elements.receivedFileName.textContent = data.originalFilename;
    elements.receivedFileSize.textContent = formatFileSize(data.size);
    
    const timestamp = new Date(data.createdAt);
    elements.contentTimestamp.textContent = `Shared on ${timestamp.toLocaleString()}`;
    
    elements.contentDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Download file
export function downloadReceivedFile() {
    if (currentReceivedContent && currentReceivedContent.code) {
        try {
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

// Copy received content
export function copyReceivedContent() {
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

// Share received content
export function shareReceivedContent() {
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
