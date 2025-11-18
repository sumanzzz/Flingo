// --- TYPE DEFINITIONS ---
type ShareType = 'text' | 'file';
interface ShareItem {
    id: string;
    type: ShareType;
    content: string; // text content or base64 data URL for files
    filename?: string;
    mimeType?: string;
    oneTime: boolean;
    sensitive: boolean;
    createdAt: number; // Unix timestamp
    expiresAt: number; // Unix timestamp
}

// --- DOM ELEMENTS ---
const mainContent = document.getElementById('main-content') as HTMLElement;
const historyList = document.getElementById('history-list') as HTMLUListElement;
const noHistoryMsg = document.getElementById('no-history') as HTMLParagraphElement;


// --- EPHEMERAL IN-MEMORY STORE for SENSITIVE ITEMS ---
const ephemeralStore = new Map<string, ShareItem>();


// --- STORAGE ABSTRACTION ---
const storage = {
    get: (id: string): ShareItem | null => {
        // 1. Check ephemeral store first for sensitive items
        if (ephemeralStore.has(id)) {
            const item = ephemeralStore.get(id)!;
            if (Date.now() > item.expiresAt) {
                ephemeralStore.delete(id);
                return null;
            }
            return item;
        }

        // 2. Check persistent local storage for non-sensitive items
        const itemJSON = localStorage.getItem(id);
        if (!itemJSON) return null;

        const item: ShareItem = JSON.parse(itemJSON);
        
        // Check for expiration
        if (Date.now() > item.expiresAt) {
            localStorage.removeItem(id);
            // We need to re-render history if an item expired on retrieval
            setTimeout(renderHistory, 0); 
            return null;
        }
        return item;
    },
    set: (item: ShareItem) => {
        if (item.sensitive) {
            ephemeralStore.set(item.id, item);
        } else {
            const itemJSON = JSON.stringify(item);
            localStorage.setItem(item.id, itemJSON);
        }
    },
    delete: (id: string) => {
        ephemeralStore.delete(id);
        localStorage.removeItem(id);
    },
    getHistory: (): ShareItem[] => {
        // History ONLY comes from persistent localStorage
        let expiredKeys: string[] = [];
        const items = Object.keys(localStorage)
            .map(key => {
                try {
                    const item = JSON.parse(localStorage.getItem(key)!);
                    if (item && typeof item.id === 'string' && item.sensitive === false) {
                         if (Date.now() > item.expiresAt) {
                             expiredKeys.push(key);
                             return null;
                         }
                         return item as ShareItem;
                    }
                    return null;
                } catch {
                    return null;
                }
            })
            .filter((item): item is ShareItem => item !== null)
            .sort((a, b) => b.createdAt - a.createdAt);

        // Clean up expired items found during history fetch
        if (expiredKeys.length > 0) {
            expiredKeys.forEach(key => localStorage.removeItem(key));
        }

        return items;
    }
};

// --- UTILITY FUNCTIONS ---
const generateId = (): string => Math.random().toString(36).substring(2, 10);

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- SVG ICONS ---
const icons = {
    send: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>`,
    receive: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>`,
    upload: `<svg class="icon upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48" style="color: var(--placeholder-color)"><path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>`,
    link: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.97 4.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>`,
};

// --- UI RENDERING ---
const renderHistory = () => {
    const history = storage.getHistory();
    historyList.innerHTML = '';
    if (history.length === 0) {
        noHistoryMsg.style.display = 'block';
        return;
    }
    noHistoryMsg.style.display = 'none';
    history.forEach(item => {
        const li = document.createElement('li');
        li.setAttribute('aria-label', `View shared item ${item.id}`);
        li.innerHTML = `
            <div class="history-item-id">${item.id}</div>
            <div class="history-item-type">${item.type} - ${new Date(item.createdAt).toLocaleString()}</div>
        `;
        li.onclick = () => {
            window.location.hash = `view/${item.id}`;
        };
        historyList.appendChild(li);
    });
};

const renderMainView = () => {
    mainContent.innerHTML = `
        <header>
            <h1>FLINGO</h1>
            <p>Fling content, instantly, across all devices.</p>
        </header>
        <div class="container">
            <div class="tabs" id="main-tabs">
                <div class="tab active" id="tab-share" role="button" aria-selected="true">${icons.send} Send</div>
                <div class="tab" id="tab-receive" role="button" aria-selected="false">${icons.receive} Receive</div>
            </div>

            <!-- Share Content -->
            <div id="tab-content-share">
                <textarea id="text-input" class="input-area" placeholder="Type or paste text/links here..."></textarea>
                <div class="separator">OR</div>
                <div class="file-drop-zone" id="file-drop-zone">
                     ${icons.upload}
                    <strong id="file-name-display">Click to upload or drag and drop</strong>
                    <p>Any file type up to 10MB</p>
                    <input type="file" id="file-input">
                </div>
                 <div class="options">
                    <div class="select-wrapper">
                        <label for="expires-in">Expires In</label>
                        <select id="expires-in">
                            <option value="300">5 Minutes</option>
                            <option value="3600" selected>1 Hour</option>
                            <option value="86400">1 Day</option>
                            <option value="604800">1 Week</option>
                        </select>
                    </div>
                    <label class="option">
                        <input type="checkbox" id="onetime-checkbox">
                        One-Time Access
                    </label>
                     <label class="option">
                        <input type="checkbox" id="sensitive-checkbox">
                        Sensitive (no history)
                    </label>
                </div>
                <button id="share-btn" class="btn">${icons.link} Fling It!</button>
            </div>

            <!-- Receive Content -->
            <div id="tab-content-receive" style="display: none;">
                 <div class="receive-container">
                    <p>Enter the code you received to view the content.</p>
                    <input type="text" id="receive-code-input" placeholder="Enter receive code...">
                    <button id="receive-btn" class="btn">Receive Content</button>
                </div>
            </div>
        </div>
    `;
    setupMainViewListeners();
};

const renderShareResultView = (item: ShareItem) => {
    const url = `${window.location.origin}${window.location.pathname}#view/${item.id}`;
    mainContent.innerHTML = `
        <div class="container result-view">
            <h2>Content Shared!</h2>
            <p>Share this code with the receiver.</p>
             <div class="share-link-wrapper">
                <input type="text" id="share-code" value="${item.id}" readonly>
                <button class="copy-btn" id="copy-btn">Copy Code</button>
            </div>
            <p class="qr-label">Or scan QR for direct link:</p>
            <div id="qr-code">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}" alt="QR Code for Share Link" />
            </div>
            ${item.sensitive ? '<div class="notice">This is a sensitive share. It will not be saved in history and will be deleted upon expiration or if the page is closed.</div>' : ''}
            <button id="share-another-btn" class="btn home-btn">Share Another</button>
        </div>
    `;

    document.getElementById('copy-btn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(item.id);
        const btn = document.getElementById('copy-btn')!;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy Code' }, 2000);
    });

    document.getElementById('share-another-btn')?.addEventListener('click', () => {
        window.location.hash = '';
    });
};

const renderContentView = (item: ShareItem) => {
    let contentHTML: string;
    if (item.type === 'text') {
        contentHTML = `<pre class="content-box">${item.content}</pre>`;
    } else {
        contentHTML = `
            <div class="content-box">
                <p><strong>File:</strong> ${item.filename}</p>
                <p><strong>Type:</strong> ${item.mimeType}</p>
            </div>
            <a href="${item.content}" download="${item.filename}" class="file-download-link">Download File</a>
        `;
    }

    mainContent.innerHTML = `
        <div class="container content-view">
            <h2>Shared Content</h2>
            ${contentHTML}
            ${item.oneTime ? '<div class="notice">This was a one-time share and has now been deleted.</div>' : ''}
            <button id="share-another-btn" class="btn home-btn">Share New Content</button>
        </div>
    `;

     document.getElementById('share-another-btn')?.addEventListener('click', () => {
        window.location.hash = '';
    });
};

const renderNotFoundView = () => {
    mainContent.innerHTML = `
        <div class="container not-found-view">
            <h2>Not Found</h2>
            <p>The content you are looking for does not exist, has expired, or has already been viewed.</p>
            <button id="home-btn" class="btn home-btn">Go to Homepage</button>
        </div>
    `;
     document.getElementById('home-btn')?.addEventListener('click', () => {
        window.location.hash = '';
    });
};

// --- EVENT LISTENERS & LOGIC ---
const setupMainViewListeners = () => {
    // Main tabs (Share/Receive)
    const tabShare = document.getElementById('tab-share')!;
    const tabReceive = document.getElementById('tab-receive')!;
    const contentShare = document.getElementById('tab-content-share')!;
    const contentReceive = document.getElementById('tab-content-receive')!;
    
    const shareBtn = document.getElementById('share-btn') as HTMLButtonElement;
    const receiveBtn = document.getElementById('receive-btn') as HTMLButtonElement;
    const receiveCodeInput = document.getElementById('receive-code-input') as HTMLInputElement;

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const fileDropZone = document.getElementById('file-drop-zone')!;
    const fileNameDisplay = document.getElementById('file-name-display')!;


    // Main tab switching logic
    tabShare.addEventListener('click', () => {
        tabShare.classList.add('active');
        tabReceive.classList.remove('active');
        contentShare.style.display = 'block';
        contentReceive.style.display = 'none';
    });

    tabReceive.addEventListener('click', () => {
        tabReceive.classList.add('active');
        tabShare.classList.remove('active');
        contentReceive.style.display = 'block';
        contentShare.style.display = 'none';
    });

    // File input logic
    fileDropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        }
    });
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });
     fileDropZone.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        if (dt && dt.files) {
            fileInput.files = dt.files;
            fileNameDisplay.textContent = dt.files[0].name;
        }
    });

    // Share button logic
    shareBtn.addEventListener('click', async () => {
        shareBtn.disabled = true;
        shareBtn.innerHTML = 'Flinging...';

        try {
            const oneTime = (document.getElementById('onetime-checkbox') as HTMLInputElement).checked;
            const sensitive = (document.getElementById('sensitive-checkbox') as HTMLInputElement).checked;
            const expiresInSec = parseInt((document.getElementById('expires-in') as HTMLSelectElement).value, 10);
            const now = Date.now();

            let item: Partial<ShareItem> = {
                id: generateId(),
                oneTime,
                sensitive,
                createdAt: now,
                expiresAt: now + expiresInSec * 1000,
            };

            const file = fileInput.files?.[0];
            const text = (document.getElementById('text-input') as HTMLTextAreaElement).value.trim();

            if (file) {
                const content = await fileToBase64(file);
                item = { ...item, type: 'file', content, filename: file.name, mimeType: file.type };
            } else if (text) {
                item = { ...item, type: 'text', content: text };
            } else {
                 alert('Please provide some text or a file to share.');
                 return;
            }

            storage.set(item as ShareItem);
            window.location.hash = `result/${item.id}`;

        } catch (error) {
            console.error('Sharing failed:', error);
            alert('An error occurred while sharing. Please try again.');
        } finally {
            shareBtn.disabled = false;
            shareBtn.innerHTML = `${icons.link} Fling It!`;
        }
    });
    
    // Receive button logic
    const receiveAction = () => {
        const code = receiveCodeInput.value.trim();
        if (code) {
            window.location.hash = `view/${code}`;
        } else {
            alert('Please enter a receive code.');
        }
    };
    
    receiveBtn.addEventListener('click', receiveAction);
    receiveCodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            receiveAction();
        }
    });
};

// --- ROUTER ---
const router = () => {
    const hash = window.location.hash.substring(1);
    const [path, id] = hash.split('/');

    if (path === 'view' && id) {
        const item = storage.get(id);
        if (item) {
            renderContentView(item);
            if (item.oneTime) {
                storage.delete(id);
                // History will update on next full load/refresh
                setTimeout(renderHistory, 0);
            }
        } else {
            renderNotFoundView();
        }
    } else if (path === 'result' && id) {
        const item = storage.get(id);
        if (item) {
            renderShareResultView(item);
        } else {
             // Should not happen, but handle it
            window.location.hash = '';
        }
    } else {
        renderMainView();
    }
    renderHistory();
};

// --- INITIALIZATION ---
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
