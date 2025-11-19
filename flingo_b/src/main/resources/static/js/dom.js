// ========================================
// FLINGO - DOM Elements
// ========================================

export const elements = {
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
