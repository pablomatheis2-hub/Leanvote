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
    .lv-panel { position: absolute; width: 380px; max-height: 520px; background: #fff; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; opacity: 0; visibility: hidden; transform: scale(0.95) translateY(10px); transition: all 0.2s ease; display: flex; flex-direction: column; }
    .lv-widget.bottom-right .lv-panel { bottom: 56px; right: 0; transform-origin: bottom right; }
    .lv-widget.bottom-left .lv-panel { bottom: 56px; left: 0; transform-origin: bottom left; }
    .lv-widget.top-right .lv-panel { top: 56px; right: 0; transform-origin: top right; }
    .lv-widget.top-left .lv-panel { top: 56px; left: 0; transform-origin: top left; }
    .lv-panel.visible { opacity: 1; visibility: visible; transform: scale(1) translateY(0); }
    .lv-header { padding: 20px; color: #fff; flex-shrink: 0; }
    .lv-header h3 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
    .lv-header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .lv-body { flex: 1; overflow-y: auto; padding: 12px; }
    .lv-post { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; gap: 12px; }
    .lv-post:hover { border-color: rgba(249, 115, 82, 0.3); }
    .lv-post:last-child { margin-bottom: 0; }
    .lv-post-votes { display: flex; flex-direction: column; align-items: center; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; min-width: 48px; transition: all 0.2s; flex-shrink: 0; }
    .lv-post-votes svg { width: 16px; height: 16px; stroke: #9ca3af; margin-bottom: 2px; }
    .lv-post-votes span { font-size: 16px; font-weight: 600; color: #111827; line-height: 1.2; }
    .lv-post-content { flex: 1; min-width: 0; }
    .lv-post-title { font-size: 14px; font-weight: 600; color: #111827; line-height: 1.4; margin: 0 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .lv-post-desc { font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .lv-post-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .lv-badge { font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 6px; border: 1px solid; display: inline-flex; align-items: center; gap: 6px; }
    .lv-badge.feature { background: #faf5ff; color: #7c3aed; border-color: #e9d5ff; }
    .lv-badge.bug { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
    .lv-badge.integration { background: #ecfeff; color: #0891b2; border-color: #a5f3fc; }
    .lv-badge.status { background: transparent; }
    .lv-badge.status.planned { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
    .lv-badge.status.in-progress { background: #fffbeb; color: #d97706; border-color: #fde68a; }
    .lv-badge.status.complete { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
    .lv-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .lv-status-dot.planned { background: #3b82f6; }
    .lv-status-dot.in-progress { background: #f59e0b; }
    .lv-status-dot.complete { background: #10b981; }
    .lv-empty { text-align: center; padding: 30px 20px; color: #6b7280; }
    .lv-empty p { margin: 0 0 4px; font-size: 14px; }
    .lv-empty small { font-size: 12px; opacity: 0.8; }
    .lv-loading { text-align: center; padding: 40px 20px; color: #9ca3af; font-size: 14px; }
    .lv-footer { padding: 16px; background: #fff; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
    .lv-submit-link { display: block; width: 100%; padding: 12px; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; cursor: pointer; transition: opacity 0.2s; }
    .lv-submit-link:hover { opacity: 0.9; }
    .lv-powered { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 12px; font-size: 11px; color: #9ca3af; text-decoration: none; }
    .lv-powered:hover { color: #6b7280; }
    .lv-powered svg { width: 12px; height: 12px; }
    @media (max-width: 420px) { .lv-panel { width: calc(100vw - 48px); } }
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
      arrow: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
      chevronUp: '<polyline points="18 15 12 9 6 15"/>'
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

  function getStatusClass(status) {
    if (!status || status === 'Open') return null;
    return status.toLowerCase().replace(' ', '-');
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

    body.innerHTML = posts.map(post => {
      const category = (post.category || 'feature').toLowerCase();
      const statusClass = getStatusClass(post.status);
      const statusLabel = post.status && post.status !== 'Open' ? post.status : null;
      
      return `
        <div class="lv-post" onclick="window.open('${BASE_URL}/b/${config.boardSlug}/post/${post.id}', '_blank')">
          <div class="lv-post-votes">
            ${icon('chevronUp')}
            <span>${post.votes || 0}</span>
          </div>
          <div class="lv-post-content">
            <p class="lv-post-title">${escapeHtml(post.title)}</p>
            ${post.description ? `<p class="lv-post-desc">${escapeHtml(post.description)}</p>` : ''}
            <div class="lv-post-meta">
              <span class="lv-badge ${category}">${post.category || 'Feature'}</span>
              ${statusLabel ? `<span class="lv-badge status ${statusClass}"><span class="lv-status-dot ${statusClass}"></span>${statusLabel}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
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
