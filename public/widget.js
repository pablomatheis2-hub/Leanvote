(function() {
  'use strict';

  if (window.LeanVoteWidget) return;

  const VERSION = '2.1.0';
  const BASE_URL = window.LEANVOTE_BASE_URL || 'https://leanvote.com';

  let config = {
    boardSlug: null,
    position: 'bottom-right',
    primaryColor: '#f97352',
    buttonText: 'Feedback',
    zIndex: 9999
  };

  let isOpen = false;
  let container = null;

  const styles = `
    .lv-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: fixed; z-index: 9999; }
    .lv-widget.bottom-right { bottom: 24px; right: 24px; }
    .lv-widget.bottom-left { bottom: 24px; left: 24px; }
    .lv-widget.top-right { top: 24px; right: 24px; }
    .lv-widget.top-left { top: 24px; left: 24px; }
    .lv-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: none; border-radius: 50px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.15); transition: all 0.2s; }
    .lv-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
    .lv-btn.open { border-radius: 12px; padding: 12px; }
    .lv-btn.open span { display: none; }
    .lv-btn svg { width: 18px; height: 18px; }
    .lv-panel { position: absolute; width: 360px; max-height: 480px; background: #fff; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; opacity: 0; visibility: hidden; transform: scale(0.95) translateY(10px); transition: all 0.2s ease; display: flex; flex-direction: column; }
    .lv-widget.bottom-right .lv-panel { bottom: 56px; right: 0; transform-origin: bottom right; }
    .lv-widget.bottom-left .lv-panel { bottom: 56px; left: 0; transform-origin: bottom left; }
    .lv-widget.top-right .lv-panel { top: 56px; right: 0; transform-origin: top right; }
    .lv-widget.top-left .lv-panel { top: 56px; left: 0; transform-origin: top left; }
    .lv-panel.visible { opacity: 1; visibility: visible; transform: scale(1) translateY(0); }
    .lv-header { padding: 20px; color: #fff; flex-shrink: 0; }
    .lv-header h3 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
    .lv-header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .lv-body { flex: 1; overflow-y: auto; padding: 16px; }
    .lv-post { background: #f9fafb; border-radius: 10px; padding: 14px; margin-bottom: 10px; cursor: pointer; transition: background 0.2s; }
    .lv-post:hover { background: #f3f4f6; }
    .lv-post:last-child { margin-bottom: 0; }
    .lv-post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .lv-post-votes { display: flex; flex-direction: column; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; min-width: 44px; }
    .lv-post-votes span { font-size: 16px; font-weight: 700; color: #111827; line-height: 1; }
    .lv-post-votes small { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .lv-post-title { font-size: 14px; font-weight: 600; color: #111827; line-height: 1.3; flex: 1; }
    .lv-post-meta { display: flex; align-items: center; gap: 8px; }
    .lv-badge { font-size: 10px; font-weight: 500; padding: 3px 8px; border-radius: 20px; text-transform: capitalize; }
    .lv-badge.feature { background: #dbeafe; color: #1d4ed8; }
    .lv-badge.bug { background: #fee2e2; color: #dc2626; }
    .lv-badge.improvement { background: #d1fae5; color: #059669; }
    .lv-empty { text-align: center; padding: 30px 20px; color: #6b7280; }
    .lv-empty p { margin: 0 0 4px; font-size: 14px; }
    .lv-empty small { font-size: 12px; opacity: 0.8; }
    .lv-loading { text-align: center; padding: 40px 20px; color: #9ca3af; font-size: 14px; }
    .lv-footer { padding: 16px; background: #fff; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
    .lv-submit-link { display: block; width: 100%; padding: 12px; border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; cursor: pointer; transition: opacity 0.2s; }
    .lv-submit-link:hover { opacity: 0.9; }
    .lv-powered { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 12px; font-size: 11px; color: #9ca3af; text-decoration: none; }
    .lv-powered:hover { color: #6b7280; }
    .lv-powered svg { width: 12px; height: 12px; }
    @media (max-width: 400px) { .lv-panel { width: calc(100vw - 48px); } }
  `;

  function injectStyles() {
    if (document.getElementById('lv-styles')) return;
    const el = document.createElement('style');
    el.id = 'lv-styles';
    el.textContent = styles;
    document.head.appendChild(el);
  }

  function icon(name) {
    const icons = {
      chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      arrow: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
  }

  async function fetchPosts() {
    try {
      const res = await fetch(`${BASE_URL}/api/widget/posts?slug=${config.boardSlug}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.posts || [];
    } catch {
      return [];
    }
  }

  function renderPosts(posts) {
    const body = container.querySelector('.lv-body');
    
    if (posts.length === 0) {
      body.innerHTML = `
        <div class="lv-empty">
          <p>No feedback yet</p>
          <small>Be the first to share your thoughts!</small>
        </div>
      `;
      return;
    }

    body.innerHTML = posts.map(post => `
      <div class="lv-post" onclick="window.open('${BASE_URL}/b/${config.boardSlug}/post/${post.id}', '_blank')">
        <div class="lv-post-header">
          <div class="lv-post-votes">
            <span>${post.votes || 0}</span>
            <small>votes</small>
          </div>
          <div class="lv-post-title">${escapeHtml(post.title)}</div>
        </div>
        <div class="lv-post-meta">
          <span class="lv-badge ${post.category || 'feature'}">${post.category || 'feature'}</span>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createWidget() {
    container = document.createElement('div');
    container.className = `lv-widget ${config.position}`;
    container.innerHTML = `
      <div class="lv-panel">
        <div class="lv-header" style="background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.primaryColor}dd 100%);">
          <h3>Feedback</h3>
          <p>See what others are requesting</p>
        </div>
        <div class="lv-body">
          <div class="lv-loading">Loading...</div>
        </div>
        <div class="lv-footer">
          <a href="${BASE_URL}/b/${config.boardSlug}" target="_blank" class="lv-submit-link" style="background:${config.primaryColor}">
            Submit Feedback
          </a>
          <a href="${BASE_URL}" target="_blank" class="lv-powered">${icon('chat')} Powered by LeanVote</a>
        </div>
      </div>
      <button class="lv-btn" style="background:${config.primaryColor}">${icon('chat')}<span>${config.buttonText}</span></button>
    `;

    const btn = container.querySelector('.lv-btn');
    const panel = container.querySelector('.lv-panel');
    let loaded = false;

    btn.onclick = async () => {
      isOpen = !isOpen;
      panel.classList.toggle('visible', isOpen);
      btn.classList.toggle('open', isOpen);
      btn.innerHTML = isOpen ? icon('close') : `${icon('chat')}<span>${config.buttonText}</span>`;
      
      if (isOpen && !loaded) {
        loaded = true;
        const posts = await fetchPosts();
        renderPosts(posts);
      }
    };

    document.body.appendChild(container);
  }

  function init(userConfig) {
    if (!userConfig?.boardSlug) {
      console.error('LeanVote Widget: boardSlug is required');
      return;
    }
    config = { ...config, ...userConfig };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { injectStyles(); createWidget(); });
    } else {
      injectStyles(); createWidget();
    }
  }

  window.LeanVoteWidget = {
    init,
    open: () => { if (!isOpen && container) container.querySelector('.lv-btn').click(); },
    close: () => { if (isOpen && container) container.querySelector('.lv-btn').click(); },
    toggle: () => { if (container) container.querySelector('.lv-btn').click(); },
    version: VERSION
  };
})();
