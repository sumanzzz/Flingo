import { useState, useEffect } from 'react';
import Toast from './components/Toast';
import SendTab from './components/SendTab';
import ReceiveTab from './components/ReceiveTab';
import './App.css';

type Tab = 'send' | 'receive';
type ToastType = 'success' | 'error';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('send');
  const [toast, setToast] = useState<{ message: string; type: ToastType; show: boolean }>({
    message: '',
    type: 'success',
    show: false,
  });
  const [initialCode, setInitialCode] = useState<string>('');
  const [sendText, setSendText] = useState<string>('');

  useEffect(() => {
    // Check for code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setInitialCode(code);
      setActiveTab('receive');
    }
  }, []);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, show: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setInitialCode('');
  };

  const handleSwitchToSend = (text?: string) => {
    if (text) {
      setSendText(text);
    }
    switchTab('send');
  };

  return (
    <div className="container">
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h1 className="logo">FLINGO</h1>
          <p className="tagline">Share text & files instantly with a simple code</p>
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => switchTab('send')}
          >
            <i className="fas fa-paper-plane"></i> Send
          </button>
          <button
            className={`tab-btn ${activeTab === 'receive' ? 'active' : ''}`}
            onClick={() => switchTab('receive')}
          >
            <i className="fas fa-download"></i> Receive
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'send' ? (
          <SendTab key={sendText} onShowToast={showToast} initialText={sendText} />
        ) : (
          <ReceiveTab
            onShowToast={showToast}
            initialCode={initialCode}
            onSwitchToSend={handleSwitchToSend}
          />
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onHide={hideToast}
      />
    </div>
  );
}

export default App;

