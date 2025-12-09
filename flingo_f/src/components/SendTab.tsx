import { useState, useRef, useCallback, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { CONFIG } from '../config';
import { uploadText, uploadFile } from '../services/api';
import { copyToClipboard } from '../utils';
import './SendTab.css';

interface SendTabProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
  initialText?: string;
}

export default function SendTab({ onShowToast, initialText }: SendTabProps) {
  const [textContent, setTextContent] = useState(initialText || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialText) {
      setTextContent(initialText);
    }
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      onShowToast('File size exceeds 10MB limit', 'error');
      return;
    }
    setSelectedFile(file);
    setTextContent('');
  }, [onShowToast]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!textContent.trim() && !selectedFile) {
      onShowToast('Please enter text or select a file to share', 'error');
      return;
    }

    setIsUploading(true);
    try {
      let data;
      if (selectedFile) {
        data = await uploadFile(selectedFile);
      } else {
        data = await uploadText(textContent);
      }

      if (data && data.code) {
        setShareCode(data.code);
        onShowToast('Content shared successfully!', 'success');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Submit error:', error);
      onShowToast('Failed to share content. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyCode = async () => {
    if (shareCode) {
      const success = await copyToClipboard(shareCode);
      if (success) {
        setIsCopied(true);
        onShowToast('Code copied to clipboard', 'success');
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        onShowToast('Copy failed. Please copy manually.', 'error');
      }
    }
  };

  const handleNewShare = () => {
    setTextContent('');
    setSelectedFile(null);
    setShareCode(null);
    setIsCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const charCount = textContent.length;

  return (
    <div className="tab-content active" id="sendTab">
      {/* Text Input Section */}
      <div className="input-section">
        <textarea
          id="textInput"
          placeholder="Type or paste your text here..."
          rows={6}
          value={textContent}
          onChange={handleTextChange}
          disabled={!!selectedFile}
        />
        <div className="char-counter">
          <span>{charCount}</span> characters
        </div>
      </div>

      {/* Divider */}
      <div className="divider">
        <span>OR</span>
      </div>

      {/* File Upload Section */}
      {!selectedFile && (
        <div
          className={`upload-area ${isDragging ? 'dragover' : ''}`}
          onClick={handleUploadAreaClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <i className="fas fa-cloud-upload-alt"></i>
          <p className="upload-text">Drop a file here or click to browse</p>
          <p className="upload-info">Max file size: 10MB</p>
          <input
            type="file"
            id="fileInput"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="*/*"
            onChange={handleFileInputChange}
          />
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <div className="selected-file">
          <i className="fas fa-file"></i>
          <span>{selectedFile.name}</span>
          <button className="remove-file" onClick={handleRemoveFile}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Uploading...
          </>
        ) : (
          <>
            <i className="fas fa-share-alt"></i> Generate Share Code
          </>
        )}
      </button>

      {/* Result Section */}
      {shareCode && (
        <div className="result-section">
          <div className="share-code-display">
            <h3>Your Share Code</h3>
            <div className="code-box">
              <span>{shareCode}</span>
              <button className="copy-btn" onClick={handleCopyCode}>
                <i className={isCopied ? 'fas fa-check' : 'fas fa-copy'}></i>
              </button>
            </div>
            <div className="qr-code">
              <QRCode
                value={`${window.location.origin}${window.location.pathname}?code=${shareCode}`}
                size={150}
                fgColor="#8b7bd8"
                bgColor="#251f35"
              />
            </div>
            <p className="share-info">
              Share this code or scan the QR code to access your content
            </p>
            <button className="new-share-btn" onClick={handleNewShare}>
              <i className="fas fa-plus"></i> Share Something Else
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

