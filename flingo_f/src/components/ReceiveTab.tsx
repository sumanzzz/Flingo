import { useState, useEffect } from 'react';
import { getTextByCode, getFileByCode, getDownloadUrl } from '../services/api';
import { formatFileSize, copyToClipboard } from '../utils';
import { SharedText, SharedFile } from '../types';
import './ReceiveTab.css';

interface ReceiveTabProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
  initialCode?: string;
  onSwitchToSend?: (text?: string) => void;
}

export default function ReceiveTab({
  onShowToast,
  initialCode,
  onSwitchToSend,
}: ReceiveTabProps) {
  const [code, setCode] = useState(initialCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [receivedContent, setReceivedContent] = useState<SharedText | SharedFile | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase());
      const timer = setTimeout(() => {
        handleReceive();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
  };

  const handleReceive = async () => {
    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode || trimmedCode.length !== 6) {
      onShowToast('Please enter a valid 6-digit code', 'error');
      return;
    }

    setIsLoading(true);
    let foundContent = false;

    try {
      // Try text first
      const textData = await getTextByCode(trimmedCode);
      if (textData) {
        setReceivedContent(textData);
        onShowToast('Content retrieved successfully!', 'success');
        foundContent = true;
      } else {
        // Try file if text not found
        const fileData = await getFileByCode(trimmedCode);
        if (fileData) {
          setReceivedContent(fileData);
          onShowToast('File retrieved successfully!', 'success');
          foundContent = true;
        }
      }

      if (!foundContent) {
        onShowToast('Invalid code or content not found', 'error');
        setReceivedContent(null);
      }
    } catch (error) {
      console.error('Receive error:', error);
      onShowToast('Invalid code or content not found', 'error');
      setReceivedContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleReceive();
    }
  };

  const handleDownload = () => {
    if (receivedContent && 'originalFilename' in receivedContent) {
      const downloadUrl = getDownloadUrl(receivedContent.code);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = receivedContent.originalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowToast('Download started!', 'success');
    }
  };

  const handleCopyContent = async () => {
    if (!receivedContent) return;

    const textToCopy =
      'content' in receivedContent
        ? receivedContent.content
        : receivedContent.originalFilename;

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setIsCopied(true);
      onShowToast('Content copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      onShowToast('Copy failed. Please copy manually.', 'error');
    }
  };

  const handleShareContent = () => {
    if (receivedContent && 'content' in receivedContent && onSwitchToSend) {
      onSwitchToSend(receivedContent.content);
      onShowToast('Content loaded! Click "Generate Share Code" to share', 'success');
    }
  };

  const isTextContent = receivedContent && 'content' in receivedContent;
  const isFileContent = receivedContent && 'originalFilename' in receivedContent;

  return (
    <div className="tab-content active" id="receiveTab">
      <div className="receive-section">
        <h2>Enter Share Code</h2>
        <div className="code-input-wrapper">
          <input
            type="text"
            id="receiveCode"
            placeholder="ABC123"
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
          />
          <button
            className="receive-btn"
            onClick={handleReceive}
            disabled={isLoading}
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-arrow-right"></i> Get Content
              </>
            )}
          </button>
        </div>

        {/* Content Display */}
        {receivedContent && (
          <div className="content-display">
            <div className="content-header">
              <h3>Received Content</h3>
              <div className="content-actions">
                {isTextContent && (
                  <>
                    <button className="action-btn" onClick={handleCopyContent}>
                      <i className={isCopied ? 'fas fa-check' : 'fas fa-copy'}></i>
                    </button>
                    {onSwitchToSend && (
                      <button className="action-btn" onClick={handleShareContent}>
                        <i className="fas fa-share"></i>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Text Content Box */}
            {isTextContent && (
              <div className="content-box">{receivedContent.content}</div>
            )}

            {/* File Content Box */}
            {isFileContent && (
              <div className="content-box">
                <div className="file-info">
                  <i className="fas fa-file fa-3x"></i>
                  <div className="file-details">
                    <p className="file-name">{receivedContent.originalFilename}</p>
                    <p className="file-size">{formatFileSize(receivedContent.size)}</p>
                  </div>
                </div>
                <button className="download-btn" onClick={handleDownload}>
                  <i className="fas fa-download"></i> Download File
                </button>
              </div>
            )}

            <div className="content-meta">
              <small>
                Shared on {new Date(receivedContent.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

