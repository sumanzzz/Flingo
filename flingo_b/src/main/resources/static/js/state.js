// ========================================
// FLINGO - State Management
// ========================================

export let currentReceivedContent = null;
export let selectedFile = null;

export function setCurrentReceivedContent(content) {
    currentReceivedContent = content;
}

export function setSelectedFile(file) {
    selectedFile = file;
}

export function clearSelectedFile() {
    selectedFile = null;
}
