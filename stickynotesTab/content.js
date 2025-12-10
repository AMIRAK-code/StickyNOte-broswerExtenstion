// 1. Create the Host Element
const host = document.createElement('div');
host.id = 'ios-sticky-note-host';
host.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
document.body.appendChild(host);

// 2. Attach Shadow DOM
const shadow = host.attachShadow({ mode: 'open' });

// 3. Apple/iOS Style Interface (Updated with Notification Styles)
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

  .note-wrapper {
    position: fixed;
    top: 20vh;
    right: 20px;
    display: flex;
    align-items: flex-start;
    transform: translateX(320px);
    transition: transform 0.5s var(--anim-spring);
    pointer-events: auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .note-wrapper.visible {
    transform: translateX(0);
  }

  .toggle-handle {
    width: 44px;
    height: 44px;
    background: var(--ios-glass);
    backdrop-filter: var(--ios-blur);
    -webkit-backdrop-filter: var(--ios-blur);
    border: 1px solid var(--ios-border);
    border-radius: 50%;
    margin-right: 12px;
    cursor: pointer;
    box-shadow: var(--ios-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    color: var(--ios-accent);
  }

  .toggle-handle:hover {
    transform: scale(1.05);
  }
  
  .note-card {
    width: 300px;
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
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #e5e5ea;
    transition: background-color 0.3s;
  }
  .status-dot.saved { background-color: #34c759; }

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

  /* Shortcut Footer Hint */
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
    transform: translateX(-50%) translateY(-100px); /* Start hidden above */
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
    z-index: 2147483648; /* Higher than host */
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
    <span>Quick Note is ready. Press <span class="kbd">Alt</span> + <span class="kbd">N</span> to open.</span>
  </div>

  <div class="note-wrapper" id="wrapper">
    <div class="toggle-handle" id="toggle">
      <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
    </div>

    <div class="note-card">
      <div class="note-header">
        <span>Quick Note</span>
        <div class="status-dot" id="status" title="Saved"></div>
      </div>
      <textarea id="note-text" placeholder="Jot something down..."></textarea>
      <div class="shortcut-hint">Pro Tip: Press Alt + N to toggle</div>
    </div>
  </div>
`;

// 4. Logic & Functionality
const wrapper = shadow.getElementById('wrapper');
const toggleBtn = shadow.getElementById('toggle');
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
    toggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'; // Close X
    setTimeout(() => textarea.focus(), 100); // Auto-focus text area
  } else {
    wrapper.classList.remove('visible');
    toggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'; // Pencil
  }
}

// Click Listener
toggleBtn.addEventListener('click', toggleNote);

// Keyboard Shortcut Listener (Alt + N)
window.addEventListener('keydown', (e) => {
  // Check for Alt (or Option on Mac) + N
  if ((e.altKey || e.metaKey) && e.code === 'KeyN') {
    e.preventDefault(); // Stop browser from typing 'n' if focused elsewhere
    toggleNote();
  }
});

// Load Logic & Notification
chrome.storage.local.get([currentUrl, 'hasSeenHint'], (result) => {
  // 1. Load Note Content
  if (result[currentUrl]) {
    textarea.value = result[currentUrl];
    statusDot.classList.add('saved');
  }

  // 2. Show Toast Notification (Only once per session or logic choice)
  // We use sessionStorage so it shows once per tab session, not annoying the user every reload.
  if (!sessionStorage.getItem('noteToastShown')) {
    setTimeout(() => {
      toast.classList.add('show');
      // Hide after 4 seconds
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
      sessionStorage.setItem('noteToastShown', 'true');
    }, 1000); // Wait 1s before showing
  }
});

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