"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Code2,
  Settings2,
  Eye,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import Link from "next/link";

interface WidgetConfig {
  id: string;
  boardSlug: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor: string;
  buttonText: string;
  showOnMobile: boolean;
  zIndex: number;
  enabled: boolean;
}

const defaultWidget: Omit<WidgetConfig, "id"> = {
  boardSlug: "demo-board",
  position: "bottom-right",
  primaryColor: "#f97352",
  buttonText: "Feedback",
  showOnMobile: true,
  zIndex: 9999,
  enabled: true,
};

const positions = [
  { value: "bottom-right", label: "Bottom Right", icon: "↘" },
  { value: "bottom-left", label: "Bottom Left", icon: "↙" },
  { value: "top-right", label: "Top Right", icon: "↗" },
  { value: "top-left", label: "Top Left", icon: "↖" },
];

const presetColors = [
  { value: "#f97352", label: "Coral" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
  { value: "#ef4444", label: "Red" },
  { value: "#171717", label: "Black" },
];

export default function WidgetTestPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { ...defaultWidget, id: "widget-1" },
  ]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>("widget-1");
  const [previewKey, setPreviewKey] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>("https://leanvote.app");
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    setMounted(true);
  }, []);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

  const addWidget = () => {
    const newId = `widget-${Date.now()}`;
    const newWidget: WidgetConfig = {
      ...defaultWidget,
      id: newId,
      position: getNextAvailablePosition(),
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidgetId(newId);
  };

  const getNextAvailablePosition = (): WidgetConfig["position"] => {
    const usedPositions = widgets.filter((w) => w.enabled).map((w) => w.position);
    const allPositions: WidgetConfig["position"][] = [
      "bottom-right",
      "bottom-left",
      "top-right",
      "top-left",
    ];
    return allPositions.find((p) => !usedPositions.includes(p)) || "bottom-right";
  };

  const removeWidget = (id: string) => {
    if (widgets.length <= 1) return;
    const newWidgets = widgets.filter((w) => w.id !== id);
    setWidgets(newWidgets);
    if (selectedWidgetId === id) {
      setSelectedWidgetId(newWidgets[0].id);
    }
  };

  const updateWidget = (id: string, updates: Partial<WidgetConfig>) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const refreshPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  const getEmbedCodeForWidget = (widget: WidgetConfig) => {
    return `<script src="${baseUrl}/widget.js"></script>
<script>
  LeanVoteWidget.init({
    boardSlug: '${widget.boardSlug}',
    position: '${widget.position}',
    primaryColor: '${widget.primaryColor}',
    buttonText: '${widget.buttonText}',
    showOnMobile: ${widget.showOnMobile},
    zIndex: ${widget.zIndex}
  });
</script>`;
  };

  const copyCode = async (code: string, widgetId: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(widgetId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getPreviewHTML = () => {
    const enabledWidgets = widgets.filter((w) => w.enabled);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .mock-header {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .mock-logo { font-weight: 700; font-size: 18px; color: #1a1a2e; }
    .mock-hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      color: white;
    }
    .mock-hero h1 { font-size: 42px; font-weight: 800; margin-bottom: 16px; text-shadow: 0 2px 20px rgba(0,0,0,0.2); }
    .mock-hero p { font-size: 18px; opacity: 0.9; max-width: 500px; line-height: 1.6; }
    .mock-card {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 32px;
      margin-top: 40px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .mock-card h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 8px; }
    .mock-card .stat { font-size: 48px; font-weight: 700; }
    
    /* Widget Styles */
    .lv-widget-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: fixed;
      z-index: 9999;
    }
    .lv-widget-container.bottom-right { bottom: 24px; right: 24px; }
    .lv-widget-container.bottom-left { bottom: 24px; left: 24px; }
    .lv-widget-container.top-right { top: 24px; right: 24px; }
    .lv-widget-container.top-left { top: 24px; left: 24px; }
    
    .lv-widget-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 50px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    }
    .lv-widget-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); }
    .lv-widget-button svg { width: 18px; height: 18px; }
    .lv-widget-button.lv-open { border-radius: 12px; padding: 12px; }
    .lv-widget-button.lv-open span { display: none; }
    
    .lv-widget-panel {
      position: absolute;
      width: 340px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: scale(0.95) translateY(10px);
      transition: all 0.25s ease;
    }
    .lv-widget-container.bottom-right .lv-widget-panel { bottom: 60px; right: 0; transform-origin: bottom right; }
    .lv-widget-container.bottom-left .lv-widget-panel { bottom: 60px; left: 0; transform-origin: bottom left; }
    .lv-widget-container.top-right .lv-widget-panel { top: 60px; right: 0; transform-origin: top right; }
    .lv-widget-container.top-left .lv-widget-panel { top: 60px; left: 0; transform-origin: top left; }
    .lv-widget-panel.lv-visible { opacity: 1; visibility: visible; transform: scale(1) translateY(0); }
    
    .lv-panel-header {
      padding: 20px;
      color: white;
    }
    .lv-panel-header h3 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
    .lv-panel-header p { margin: 0; font-size: 13px; opacity: 0.9; }
    
    .lv-panel-content { padding: 20px; }
    
    .lv-form-group { margin-bottom: 16px; }
    .lv-form-group label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    .lv-form-group input,
    .lv-form-group textarea,
    .lv-form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    .lv-form-group input:focus,
    .lv-form-group textarea:focus,
    .lv-form-group select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-color-light);
    }
    .lv-form-group textarea { resize: vertical; min-height: 80px; }
    
    .lv-submit-btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .lv-submit-btn:hover { opacity: 0.9; }
    
    .lv-panel-footer {
      padding: 12px 20px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .lv-panel-footer a {
      font-size: 12px;
      color: #6b7280;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .lv-panel-footer a:hover { color: #374151; }
    .lv-panel-footer svg { width: 14px; height: 14px; }
    
    .lv-view-all {
      font-size: 12px;
      font-weight: 500;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .lv-view-all:hover { opacity: 0.8; }
    
    .lv-success-msg {
      text-align: center;
      padding: 30px 20px;
    }
    .lv-success-msg .icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .lv-success-msg h4 { margin: 0 0 8px; font-size: 16px; color: #111827; }
    .lv-success-msg p { margin: 0; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <header class="mock-header">
    <div class="mock-logo">YourApp</div>
  </header>
  
  <main class="mock-hero">
    <h1>Welcome to YourApp</h1>
    <p>This is a preview of how the LeanVote widget will appear on your website. Click the button(s) to test.</p>
    
    <div class="mock-card">
      <h3>Active Widgets</h3>
      <div class="stat">${enabledWidgets.length}</div>
    </div>
  </main>

  <script>
    const BASE_URL = '${baseUrl}';
    const widgetConfigs = ${JSON.stringify(enabledWidgets)};
    
    widgetConfigs.forEach((config) => {
      const container = document.createElement('div');
      container.className = 'lv-widget-container ' + config.position;
      container.style.zIndex = config.zIndex;
      
      const button = document.createElement('button');
      button.className = 'lv-widget-button';
      button.style.backgroundColor = config.primaryColor;
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span>' + config.buttonText + '</span>';
      
      let isOpen = false;
      let panel = null;
      let submitted = false;
      
      function showSuccess() {
        const content = panel.querySelector('.lv-panel-content');
        content.innerHTML = \`
          <div class="lv-success-msg">
            <div class="icon" style="background: \${config.primaryColor}20;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="\${config.primaryColor}" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h4>Thank you!</h4>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        \`;
        submitted = true;
      }
      
      button.onclick = function() {
        isOpen = !isOpen;
        if (isOpen) {
          if (!panel) {
            panel = document.createElement('div');
            panel.className = 'lv-widget-panel';
            panel.style.setProperty('--primary-color', config.primaryColor);
            panel.style.setProperty('--primary-color-light', config.primaryColor + '20');
            panel.innerHTML = \`
              <div class="lv-panel-header" style="background: linear-gradient(135deg, \${config.primaryColor} 0%, \${config.primaryColor}cc 100%);">
                <h3>Share your feedback</h3>
                <p>Help us improve by sharing your thoughts</p>
              </div>
              <div class="lv-panel-content">
                <div class="lv-form-group">
                  <label>Type</label>
                  <select>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="improvement">Improvement</option>
                  </select>
                </div>
                <div class="lv-form-group">
                  <label>Title</label>
                  <input type="text" placeholder="Brief summary of your feedback">
                </div>
                <div class="lv-form-group">
                  <label>Description <span style="color: #9ca3af; font-weight: 400;">(optional)</span></label>
                  <textarea placeholder="Tell us more details..."></textarea>
                </div>
                <button class="lv-submit-btn" style="background: \${config.primaryColor};" onclick="event.preventDefault();">
                  Submit Feedback
                </button>
              </div>
              <div class="lv-panel-footer">
                <a href="\${BASE_URL}" target="_blank">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Powered by LeanVote
                </a>
                <a href="\${BASE_URL}/b/\${config.boardSlug}" target="_blank" class="lv-view-all" style="color: \${config.primaryColor};">
                  View all feedback
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              </div>
            \`;
            
            // Add submit handler
            const submitBtn = panel.querySelector('.lv-submit-btn');
            submitBtn.addEventListener('click', function(e) {
              e.preventDefault();
              showSuccess();
            });
            
            container.insertBefore(panel, button);
          } else if (submitted) {
            // Reset form if reopening after submission
            submitted = false;
            panel.querySelector('.lv-panel-content').innerHTML = \`
              <div class="lv-form-group">
                <label>Type</label>
                <select>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="improvement">Improvement</option>
                </select>
              </div>
              <div class="lv-form-group">
                <label>Title</label>
                <input type="text" placeholder="Brief summary of your feedback">
              </div>
              <div class="lv-form-group">
                <label>Description <span style="color: #9ca3af; font-weight: 400;">(optional)</span></label>
                <textarea placeholder="Tell us more details..."></textarea>
              </div>
              <button class="lv-submit-btn" style="background: \${config.primaryColor};" onclick="event.preventDefault();">
                Submit Feedback
              </button>
            \`;
            const newSubmitBtn = panel.querySelector('.lv-submit-btn');
            newSubmitBtn.addEventListener('click', function(e) {
              e.preventDefault();
              showSuccess();
            });
          }
          panel.classList.add('lv-visible');
          button.classList.add('lv-open');
          button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        } else {
          if (panel) panel.classList.remove('lv-visible');
          button.classList.remove('lv-open');
          button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span>' + config.buttonText + '</span>';
        }
      };
      
      container.appendChild(button);
      document.body.appendChild(container);
    });
  </script>
</body>
</html>`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">LeanVote</span>
            </Link>
            <span className="text-muted-foreground/30">/</span>
            <h1 className="text-foreground font-medium">Widget Test Lab</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshPreview}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Collapsible Left Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-[420px]" : "w-0"
          } transition-all duration-300 flex-shrink-0 border-r border-border bg-card overflow-hidden`}
        >
          <div className="w-[420px] h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Widgets Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    Widgets ({widgets.length})
                  </h2>
                  <button
                    onClick={addWidget}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Widget
                  </button>
                </div>

                {/* Widget List */}
                <div className="space-y-3">
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className={`rounded-xl border transition-all ${
                        selectedWidgetId === widget.id
                          ? "border-primary bg-secondary/50"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      {/* Widget Header */}
                      <button
                        onClick={() => setSelectedWidgetId(widget.id)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: widget.primaryColor }}
                          >
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">
                                {widget.buttonText}
                              </span>
                              {!widget.enabled && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded">
                                  OFF
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span>{positions.find((p) => p.value === widget.position)?.icon}</span>
                              <span>{widget.position}</span>
                            </div>
                          </div>
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              widget.enabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                            }`}
                          />
                        </div>
                      </button>

                      {/* Widget Settings (Expanded) */}
                      {selectedWidgetId === widget.id && (
                        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                          {/* Enable Toggle */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground">Enable Widget</span>
                            <button
                              onClick={() =>
                                updateWidget(widget.id, { enabled: !widget.enabled })
                              }
                              className={`w-11 h-6 rounded-full transition-colors relative ${
                                widget.enabled ? "bg-primary" : "bg-muted"
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                                  widget.enabled ? "left-6" : "left-1"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Board Slug */}
                          <div>
                            <label className="block text-sm text-muted-foreground mb-1.5">
                              Board Slug
                            </label>
                            <input
                              type="text"
                              value={widget.boardSlug}
                              onChange={(e) =>
                                updateWidget(widget.id, { boardSlug: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              placeholder="your-board-slug"
                            />
                          </div>

                          {/* Button Text */}
                          <div>
                            <label className="block text-sm text-muted-foreground mb-1.5">
                              Button Text
                            </label>
                            <input
                              type="text"
                              value={widget.buttonText}
                              onChange={(e) =>
                                updateWidget(widget.id, { buttonText: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              placeholder="Feedback"
                            />
                          </div>

                          {/* Position */}
                          <div>
                            <label className="block text-sm text-muted-foreground mb-1.5">
                              Position
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {positions.map((pos) => (
                                <button
                                  key={pos.value}
                                  onClick={() =>
                                    updateWidget(widget.id, {
                                      position: pos.value as WidgetConfig["position"],
                                    })
                                  }
                                  className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                                    widget.position === pos.value
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  <span>{pos.icon}</span>
                                  <span>{pos.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Color */}
                          <div>
                            <label className="block text-sm text-muted-foreground mb-1.5">
                              Primary Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {presetColors.map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() =>
                                    updateWidget(widget.id, { primaryColor: color.value })
                                  }
                                  className={`w-7 h-7 rounded-lg transition-all ${
                                    widget.primaryColor === color.value
                                      ? "ring-2 ring-foreground ring-offset-2"
                                      : "hover:scale-110"
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.label}
                                />
                              ))}
                              <input
                                type="color"
                                value={widget.primaryColor}
                                onChange={(e) =>
                                  updateWidget(widget.id, { primaryColor: e.target.value })
                                }
                                className="w-7 h-7 rounded-lg cursor-pointer border border-border"
                                title="Custom color"
                              />
                            </div>
                          </div>

                          {/* Preview Button */}
                          <div className="pt-2">
                            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-xl">
                              <button
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white font-medium text-sm shadow-lg"
                                style={{ backgroundColor: widget.primaryColor }}
                              >
                                <MessageSquare className="w-4 h-4" />
                                {widget.buttonText || "Feedback"}
                              </button>
                            </div>
                          </div>

                          {/* Embed Code */}
                          <div className="pt-2 border-t border-border">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5 text-primary" />
                                Embed Code
                              </label>
                              <button
                                onClick={() => copyCode(getEmbedCodeForWidget(widget), widget.id)}
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                              >
                                {copiedCode === widget.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="bg-foreground text-background rounded-lg p-3 text-xs overflow-x-auto font-mono max-h-32">
                              {getEmbedCodeForWidget(widget)}
                            </pre>
                          </div>

                          {/* Delete Button */}
                          {widgets.length > 1 && (
                            <button
                              onClick={() => removeWidget(widget.id)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Widget
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-r-lg p-2 hover:bg-muted transition-colors shadow-sm"
          style={{ left: sidebarOpen ? "420px" : "0" }}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
          ) : (
            <PanelLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Live Preview
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {widgets.filter((w) => w.enabled).length} active widget(s)
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-6 bg-muted/20">
            <div className="h-full bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
              <iframe
                key={previewKey}
                srcDoc={getPreviewHTML()}
                className="w-full h-full border-0"
                title="Widget Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
