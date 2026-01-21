(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.LeanVoteWidget) return;

  const WIDGET_VERSION = '1.0.0';
  const BASE_URL = window.LEANVOTE_BASE_URL || 'https://leanvote.app';

  // Widget configuration
  let config = {
    boardSlug: null,
    position: 'bottom-right',
    primaryColor: '#f97352',
    buttonText: 'Feedback',
    showOnMobile: true,
    zIndex: 9999
  };

  // Widget state
  let isOpen = false;
  let container = null;
  let button = null;
  let panel = null;
  let iframe = null;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('leanvote-widget-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'leanvote-widget-styles';
    styles.textContent = `
      .lv-widget-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        position: fixed;
        z-index: ${config.zIndex};
      }
      
      .lv-widget-container.bottom-right {
        bottom: 24px;
        right: 24px;
      }
      
      .lv-widget-container.bottom-left {
        bottom: 24px;
        left: 24px;
      }
      
      .lv-widget-container.top-right {
        top: 24px;
        right: 24px;
      }
      
      .lv-widget-container.top-left {
        top: 24px;
        left: 24px;
      }
      
      .lv-widget-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 50px;
        background: ${config.primaryColor};
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      
      .lv-widget-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05);
      }
      
      .lv-widget-button:active {
        transform: translateY(0);
      }
      
      .lv-widget-button svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }
      
      .lv-widget-button.lv-open {
        border-radius: 12px;
        padding: 12px;
      }
      
      .lv-widget-button.lv-open span {
        display: none;
      }
      
      .lv-widget-panel {
        position: absolute;
        width: 420px;
        height: 600px;
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: scale(0.95) translateY(10px);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .lv-widget-container.bottom-right .lv-widget-panel {
        bottom: 60px;
        right: 0;
        transform-origin: bottom right;
      }
      
      .lv-widget-container.bottom-left .lv-widget-panel {
        bottom: 60px;
        left: 0;
        transform-origin: bottom left;
      }
      
      .lv-widget-container.top-right .lv-widget-panel {
        top: 60px;
        right: 0;
        transform-origin: top right;
      }
      
      .lv-widget-container.top-left .lv-widget-panel {
        top: 60px;
        left: 0;
        transform-origin: top left;
      }
      
      .lv-widget-panel.lv-visible {
        opacity: 1;
        visibility: visible;
        transform: scale(1) translateY(0);
      }
      
      .lv-widget-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: linear-gradient(135deg, ${config.primaryColor} 0%, #e8634a 100%);
        color: white;
      }
      
      .lv-widget-panel-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .lv-widget-panel-header-actions {
        display: flex;
        gap: 8px;
      }
      
      .lv-widget-panel-header button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 8px;
        padding: 6px 12px;
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .lv-widget-panel-header button:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .lv-widget-panel-nav {
        display: flex;
        border-bottom: 1px solid #e5e5e5;
        background: #fafafa;
      }
      
      .lv-widget-panel-nav button {
        flex: 1;
        padding: 12px 16px;
        border: none;
        background: transparent;
        font-size: 13px;
        font-weight: 500;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }
      
      .lv-widget-panel-nav button:hover {
        color: #333;
        background: #f5f5f5;
      }
      
      .lv-widget-panel-nav button.active {
        color: ${config.primaryColor};
        background: white;
      }
      
      .lv-widget-panel-nav button.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: ${config.primaryColor};
      }
      
      .lv-widget-iframe {
        width: 100%;
        height: calc(100% - 100px);
        border: none;
      }
      
      .lv-widget-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px 16px;
        background: #fafafa;
        border-top: 1px solid #e5e5e5;
        text-align: center;
      }
      
      .lv-widget-footer a {
        font-size: 11px;
        color: #999;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      
      .lv-widget-footer a:hover {
        color: #666;
      }
      
      .lv-widget-footer svg {
        width: 12px;
        height: 12px;
      }
      
      @media (max-width: 480px) {
        .lv-widget-container.lv-hide-mobile {
          display: none !important;
        }
        
        .lv-widget-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          max-height: 100%;
          border-radius: 0;
        }
        
        .lv-widget-container.bottom-right .lv-widget-panel,
        .lv-widget-container.bottom-left .lv-widget-panel,
        .lv-widget-container.top-right .lv-widget-panel,
        .lv-widget-container.top-left .lv-widget-panel {
          bottom: auto;
          right: auto;
          transform-origin: center;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  // Create widget DOM elements
  function createWidget() {
    // Container
    container = document.createElement('div');
    container.className = `lv-widget-container ${config.position}`;
    if (!config.showOnMobile) {
      container.classList.add('lv-hide-mobile');
    }

    // Button
    button = document.createElement('button');
    button.className = 'lv-widget-button';
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>${config.buttonText}</span>
    `;
    button.onclick = togglePanel;

    // Panel
    panel = document.createElement('div');
    panel.className = 'lv-widget-panel';
    
    const currentTab = 'feedback';
    panel.innerHTML = `
      <div class="lv-widget-panel-header">
        <h3>${config.boardName || 'Feedback'}</h3>
        <div class="lv-widget-panel-header-actions">
          <button onclick="window.LeanVoteWidget.openFullPage()">Open Full Page</button>
        </div>
      </div>
      <div class="lv-widget-panel-nav">
        <button class="active" data-tab="feedback">💡 Feedback</button>
        <button data-tab="roadmap">🗺️ Roadmap</button>
        <button data-tab="changelog">📋 Changelog</button>
      </div>
      <iframe class="lv-widget-iframe" src="${BASE_URL}/b/${config.boardSlug}?widget=true"></iframe>
      <div class="lv-widget-footer">
        <a href="${BASE_URL}" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Powered by LeanVote
        </a>
      </div>
    `;

    // Add tab click handlers
    panel.querySelectorAll('.lv-widget-panel-nav button').forEach(btn => {
      btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        panel.querySelectorAll('.lv-widget-panel-nav button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        let path = '';
        switch(tab) {
          case 'feedback':
            path = `/b/${config.boardSlug}`;
            break;
          case 'roadmap':
            path = `/b/${config.boardSlug}/roadmap`;
            break;
          case 'changelog':
            path = `/b/${config.boardSlug}/changelog`;
            break;
        }
        panel.querySelector('.lv-widget-iframe').src = `${BASE_URL}${path}?widget=true`;
      });
    });

    container.appendChild(panel);
    container.appendChild(button);
    document.body.appendChild(container);
  }

  // Toggle panel visibility
  function togglePanel() {
    isOpen = !isOpen;
    
    if (isOpen) {
      panel.classList.add('lv-visible');
      button.classList.add('lv-open');
      button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      panel.classList.remove('lv-visible');
      button.classList.remove('lv-open');
      button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>${config.buttonText}</span>
      `;
    }
  }

  // Open full page in new tab
  function openFullPage() {
    window.open(`${BASE_URL}/b/${config.boardSlug}`, '_blank');
  }

  // Initialize widget
  function init(userConfig) {
    if (!userConfig || !userConfig.boardSlug) {
      console.error('LeanVote Widget: boardSlug is required');
      return;
    }

    // Merge user config with defaults
    config = { ...config, ...userConfig };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        injectStyles();
        createWidget();
      });
    } else {
      injectStyles();
      createWidget();
    }
  }

  // Expose public API
  window.LeanVoteWidget = {
    init: init,
    open: function() {
      if (!isOpen) togglePanel();
    },
    close: function() {
      if (isOpen) togglePanel();
    },
    toggle: togglePanel,
    openFullPage: openFullPage,
    version: WIDGET_VERSION
  };
})();
