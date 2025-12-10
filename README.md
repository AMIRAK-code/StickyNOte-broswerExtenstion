# StickyNOte-broswerExtenstion

# 📝 Tab Sticky Notes 

> A minimal, beautiful Chrome Extension that lets you leave persistent sticky notes on any webpage.

**Tab Sticky Notes** solves a simple problem: you're browsing, watching a video, or reading an article, and you need to jot down a quick thought *right there*. Not in a separate app, but attached to the context of the page itself. 

Designed with a premium **Apple/iOS aesthetic**, it features frosted glass effects, spring animations, and zero-interference code.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange)

## ✨ Features

* **📍 Context-Aware:** Notes are tied to the specific URL. Leave a note on a YouTube video, go away, and it will be there when you come back.
* **🍎 iOS Aesthetic:** Beautiful glassmorphism UI (backdrop blur), San Francisco typography, and spring-physics animations.
* **⚡️ Quick Access:** Toggle your note instantly with `Alt + N` (Windows) or `Option + N` (Mac).
* **🛡 Shadow DOM:** The UI is encapsulated in a Shadow DOM, meaning the website's CSS can't break the note, and the note's CSS won't break the website.
* **🌗 Dark Mode:** Automatically adapts to your system's light/dark mode preferences.
* **💾 Auto-Save:** Typing is saved automatically to local storage with a visual status indicator.

## 🚀 Installation

Since this extension is currently in **Developer Mode**, follow these steps to install it:

1.  **Clone or Download** this repository to a folder on your computer.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the folder where you saved these files.
6.  That's it! Visit any website to test it out.

## 📖 How to Use

1.  **Open the Note:**
    * Click the **floating pencil icon** on the right side of your screen.
    * **OR** Press `Alt + N` on your keyboard.
2.  **Write:** Type your reminder, timestamp, or idea.
    * *Green Dot* = Saved.
    * *Grey Dot* = Unsaved (typing).
3.  **Close:** Click the toggle button again or press the shortcut. The note slides away but remains ready.
4.  **Notifications:** A subtle "toast" notification will remind you of the shortcut when you visit a new page.

## 🛠 Technical Details

* **Manifest V3:** Built using the latest Chrome Extension standards.
* **Vanilla JS:** No heavy frameworks (React/Vue) were used, keeping the extension extremely lightweight and fast.
* **Storage API:** Uses `chrome.storage.local` to persist data securely on your device.

## 📂 Project Structure

```text
TabStickyNotes/
├── manifest.json   # Extension configuration
└── content.js      # The logic, styles (CSS), and UI elements
