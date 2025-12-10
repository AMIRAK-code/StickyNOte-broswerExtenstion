// 1. Create the Host Element
const host = document.createElement('div');
host.id = 'ios-sticky-note-host';
host.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
document.body.appendChild(host);

// 2. Attach Shadow DOM
const shadow = host.attachShadow({ mode: 'open' });

// 3. Apple/iOS Style Interface (Stealth Mode Update)
const style = `
  :host {
    --ios-glass: rgba(255, 255, 255, 0.85);
    --ios-border: rgba(255, 255, 255, 0.4);
    --ios-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
    --ios-blur: blur(20px);
    --ios-text: #1d1d1f;
    --ios-accent: #007aff;
    --anim-spring: cubic-bezier(0.175, 0.885, 0.32, 1.1);
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --ios-glass: rgba(30, 30, 30, 0.85);
      --ios-border: rgba(255, 255, 255, 0.1);
      --ios-text: #f5f5f7;
    }
  }

  /* Wrapper centers the note or places it nicely */
  .note-wrapper {
    position: fixed;
    top: 15vh;
    right: 50px; /* Floating freely, not attached to edge */
    display: flex;
    flex-direction: column;
    pointer-events: none; /* Click-through when hidden */
    opacity: 0;
    visibility: hidden;
    transform: translateY(-20px) scale(0.95); /* Start slightly higher and smaller */
    transition: 
      opacity 0.3s ease,
      transform 0.4s var(--anim-spring),
      visibility 0.3s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  /* The Visible State */
  .note-wrapper.visible {
    pointer-events: auto;
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }

  .note-card {
    width: 320px;
    height: 400px;
    background: var(--ios-glass);
    backdrop-filter: var(--ios-blur);
    -webkit-backdrop-filter: var(--ios-blur);
    border-radius: 20px;
    border: 1px solid var(--ios-border);
    box-shadow: var(--ios-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .note-header {
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ios-accent);
    border-bottom: 1px solid rgba(0,0,0,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    cursor: default;
  }
  
  /* Close Button (X) inside header */
  .close-btn {
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
    color: #888;
  }
  .close-btn:hover {
    background: rgba(0,0,0,0.05);
    color: #333;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #e5e5ea;
    margin-right: 8px;
    transition: background-color 0.3s;
  }
  .status-dot.saved { background-color: #34c759; }

  .header-left {
    display: flex;
    align-items: center;
  }

  textarea {
    flex-grow: 1;
    width: 100%;
    background: transparent;
    border: none;
    resize: none;
    padding: 16px;
    font-family: inherit;
    font-size: 16px;
    line-height: 1.5;
    color: var(--ios-text);
    outline: none;
    box-sizing: border-box;
  }

  .shortcut-hint {
    font-size: 11px;
    color: #999;
    text-align: center;
    padding: 8px;
    border-top: 1px solid rgba(0,0,0,0.05);
  }

  /* --- Notification Toast Styles --- */
  .toast-notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: var(--ios-glass);
    backdrop-filter: var(--ios-blur);
    padding: 10px 20px;
    border-radius: 50px;
    box-shadow: var(--ios-shadow);
    border: 1px solid var(--ios-border);
    font-size: 13px;
    font-weight: 500;
    color: var(--ios-text);
    opacity: 0;
    transition: transform 0.6s var(--anim-spring), opacity 0.4s ease;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 2147483648; 
  }

  .toast-notification.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  
  .kbd {
    background: rgba(0,0,0,0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
  
  svg { width: 20px; height: 20px; fill: currentColor; }
`;

shadow.innerHTML = `
  <style>${style}</style>
  
  <div class="toast-notification" id="toast">
    <span>Sticky Note hidden. Press <span class="kbd">Alt</span> + <span class="kbd">N</span> to view.</span>
  </div>

  <div class="note-wrapper" id="wrapper">
    <div class="note-card">
      <div class="note-header">
        <div class="header-left">
          <div class="status-dot" id="status" title="Saved"></div>
          <span>Quick Note</span>
        </div>
        <div class="close-btn" id="close-btn" title="Close (Alt+N)">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </div>
      </div>
      <textarea id="note-text" placeholder="Type here..."></textarea>
      <div class="shortcut-hint">Press Alt + N to close</div>
    </div>
  </div>
`;

// 4. Logic & Functionality
const wrapper = shadow.getElementById('wrapper');
const closeBtn = shadow.getElementById('close-btn');
const textarea = shadow.getElementById('note-text');
const statusDot = shadow.getElementById('status');
const toast = shadow.getElementById('toast');
const currentUrl = window.location.href;

let isOpen = false;

// Function to handle opening/closing
function toggleNote() {
  isOpen = !isOpen;
  if (isOpen) {
    wrapper.classList.add('visible');
    setTimeout(() => textarea.focus(), 100); 
  } else {
    wrapper.classList.remove('visible');
    textarea.blur(); // Remove focus so you can use page shortcuts
  }
}

// Click Listener for Close Button
closeBtn.addEventListener('click', toggleNote);

// Keyboard Shortcut Listener (Alt + N)
window.addEventListener('keydown', (e) => {
  if ((e.altKey || e.metaKey) && e.code === 'KeyN') {
    e.preventDefault(); 
    toggleNote();
  }
});

// Load Logic & Notification
chrome.storage.local.get([currentUrl], (result) => {
  if (result[currentUrl]) {
    textarea.value = result[currentUrl];
    statusDot.classList.add('saved');
    
    // OPTIONAL: If a note exists, show the toast to remind them it's there
    showToast();
  } else {
    // If no note exists, we still show toast once per session so they know how to open it
    if (!sessionStorage.getItem('noteToastShown')) {
      showToast();
      sessionStorage.setItem('noteToastShown', 'true');
    }
  }
});

function showToast() {
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }, 1000);
}

// Save Logic
let timeoutId;
textarea.addEventListener('input', () => {
  const noteContent = textarea.value;
  statusDot.classList.remove('saved'); 

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    if (!noteContent.trim()) {
      chrome.storage.local.remove(currentUrl);
    } else {
      chrome.storage.local.set({ [currentUrl]: noteContent }, () => {
        statusDot.classList.add('saved');
      });
    }
  }, 500);
});