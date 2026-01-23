(function() {
  'use strict';

  if (window.LeanVoteWidget) return;

  const VERSION = '2.0.0';
  const BASE_URL = window.LEANVOTE_BASE_URL || 'https://leanvote.com';

  let config = {
    boardSlug: null,
    position: 'bottom-right',
    primaryColor: '#f97352',
    buttonText: 'Feedback',
    showOnMobile: true,
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
    .lv-panel { position: absolute; width: 340px; background: #fff; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; opacity: 0; visibility: hidden; transform: scale(0.95) translateY(10px); transition: all 0.2s ease; }
    .lv-widget.bottom-right .lv-panel { bottom: 56px; right: 0; transform-origin: bottom right; }
    .lv-widget.bottom-left .lv-panel { bottom: 56px; left: 0; transform-origin: bottom left; }
    .lv-widget.top-right .lv-panel { top: 56px; right: 0; transform-origin: top right; }
    .lv-widget.top-left .lv-panel { top: 56px; left: 0; transform-origin: top left; }
    .lv-panel.visible { opacity: 1; visibility: visible; transform: scale(1) translateY(0); }
    .lv-header { padding: 20px; color: #fff; }
    .lv-header h3 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
    .lv-header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .lv-body { padding: 20px; }
    .lv-field { margin-bottom: 16px; }
    .lv-field label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .lv-field label span { color: #9ca3af; font-weight: 400; }
    .lv-field input, .lv-field textarea, .lv-field select { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
    .lv-field input:focus, .lv-field textarea:focus, .lv-field select:focus { outline: none; border-color: var(--lv-color); box-shadow: 0 0 0 3px var(--lv-color-light); }
    .lv-field textarea { resize: vertical; min-height: 80px; }
    .lv-submit { width: 100%; padding: 12px; border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .lv-submit:hover { opacity: 0.9; }
    .lv-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .lv-footer { padding: 12px 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; }
    .lv-footer a { font-size: 12px; color: #6b7280; text-decoration: none; display: flex; align-items: center; gap: 4px; }
    .lv-footer a:hover { color: #374151; }
    .lv-footer svg { width: 14px; height: 14px; }
    .lv-link { font-size: 12px; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 4px; }
    .lv-link:hover { opacity: 0.8; }
    .lv-success { text-align: center; padding: 40px 20px; }
    .lv-success-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .lv-success h4 { margin: 0 0 8px; font-size: 18px; color: #111827; }
    .lv-success p { margin: 0 0 20px; font-size: 14px; color: #6b7280; }
    .lv-success button { padding: 10px 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; }
    .lv-success button:hover { background: #f9fafb; }
    .lv-error { padding: 10px 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 13px; margin-bottom: 16px; }
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
      check: '<polyline points="20 6 9 17 4 12"/>',
      external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
  }

  function createWidget() {
    container = document.createElement('div');
    container.className = `lv-widget ${config.position}`;
    container.style.setProperty('--lv-color', config.primaryColor);
    container.style.setProperty('--lv-color-light', config.primaryColor + '20');
    container.innerHTML = `
      <div class="lv-panel">
        <div class="lv-header" style="background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.primaryColor}dd 100%);">
          <h3>Share your feedback</h3>
          <p>Help us improve by sharing your thoughts</p>
        </div>
        <div class="lv-body">
          <div class="lv-error" style="display:none;"></div>
          <div class="lv-field">
            <label>Type</label>
            <select class="lv-type">
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="improvement">Improvement</option>
            </select>
          </div>
          <div class="lv-field">
            <label>Title</label>
            <input type="text" class="lv-title" placeholder="Brief summary of your feedback" maxlength="100">
          </div>
          <div class="lv-field">
            <label>Description <span>(optional)</span></label>
            <textarea class="lv-desc" placeholder="Tell us more details..." maxlength="1000"></textarea>
          </div>
          <button class="lv-submit" style="background:${config.primaryColor}">Submit Feedback</button>
        </div>
        <div class="lv-footer">
          <a href="${BASE_URL}" target="_blank">${icon('chat')} Powered by LeanVote</a>
          <a href="${BASE_URL}/b/${config.boardSlug}" target="_blank" class="lv-link" style="color:${config.primaryColor}">View all ${icon('external')}</a>
        </div>
      </div>
      <button class="lv-btn" style="background:${config.primaryColor}">${icon('chat')}<span>${config.buttonText}</span></button>
    `;

    const btn = container.querySelector('.lv-btn');
    const panel = container.querySelector('.lv-panel');
    const form = container.querySelector('.lv-body');
    const submitBtn = container.querySelector('.lv-submit');
    const errorEl = container.querySelector('.lv-error');

    btn.onclick = () => {
      isOpen = !isOpen;
      panel.classList.toggle('visible', isOpen);
      btn.classList.toggle('open', isOpen);
      btn.innerHTML = isOpen ? icon('close') : `${icon('chat')}<span>${config.buttonText}</span>`;
    };

    submitBtn.onclick = async () => {
      const title = container.querySelector('.lv-title').value.trim();
      const desc = container.querySelector('.lv-desc').value.trim();
      const type = container.querySelector('.lv-type').value;

      if (!title) {
        errorEl.textContent = 'Please enter a title';
        errorEl.style.display = 'block';
        return;
      }

      errorEl.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        const res = await fetch(`${BASE_URL}/api/widget/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardSlug: config.boardSlug, title, description: desc, type })
        });

        if (!res.ok) throw new Error('Failed to submit');

        form.innerHTML = `
          <div class="lv-success">
            <div class="lv-success-icon" style="background:${config.primaryColor}20">${icon('check').replace('stroke="currentColor"', `stroke="${config.primaryColor}"`)}</div>
            <h4>Thank you!</h4>
            <p>Your feedback has been submitted successfully.</p>
            <button class="lv-new">Submit another</button>
          </div>
        `;
        container.querySelector('.lv-new').onclick = () => location.reload();
      } catch (e) {
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Feedback';
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
