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
  const [baseUrl, setBaseUrl] = useState<string>("https://leanvote.com");
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    setMounted(true);
  }, []);

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
    
    // Sample posts for preview
    const samplePosts = [
      { id: 1, title: "Add dark mode support", votes: 24, category: "feature" },
      { id: 2, title: "Mobile app crashes on startup", votes: 12, category: "bug" },
      { id: 3, title: "Improve loading speed", votes: 8, category: "improvement" },
    ];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; flex-direction: column; }
    .mock-header { background: rgba(255,255,255,0.95); padding: 16px 24px; border-bottom: 1px solid rgba(0,0,0,0.1); }
    .mock-logo { font-weight: 700; font-size: 18px; color: #1a1a2e; }
    .mock-hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: white; }
    .mock-hero h1 { font-size: 42px; font-weight: 800; margin-bottom: 16px; }
    .mock-hero p { font-size: 18px; opacity: 0.9; max-width: 500px; }
    
    .lv-widget { font-family: inherit; position: fixed; z-index: 9999; }
    .lv-widget.bottom-right { bottom: 24px; right: 24px; }
    .lv-widget.bottom-left { bottom: 24px; left: 24px; }
    .lv-widget.top-right { top: 24px; right: 24px; }
    .lv-widget.top-left { top: 24px; left: 24px; }
    .lv-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: none; border-radius: 50px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.15); transition: all 0.2s; }
    .lv-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
    .lv-btn.open { border-radius: 12px; padding: 12px; }
    .lv-btn.open span { display: none; }
    .lv-btn svg { width: 18px; height: 18px; }
    .lv-panel { position: absolute; width: 360px; max-height: 480px; background: #fff; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; opacity: 0; visibility: hidden; transform: scale(0.95) translateY(10px); transition: all 0.2s; display: flex; flex-direction: column; }
    .lv-widget.bottom-right .lv-panel { bottom: 56px; right: 0; transform-origin: bottom right; }
    .lv-widget.bottom-left .lv-panel { bottom: 56px; left: 0; transform-origin: bottom left; }
    .lv-widget.top-right .lv-panel { top: 56px; right: 0; transform-origin: top right; }
    .lv-widget.top-left .lv-panel { top: 56px; left: 0; transform-origin: top left; }
    .lv-panel.visible { opacity: 1; visibility: visible; transform: scale(1) translateY(0); }
    .lv-header { padding: 20px; color: #fff; }
    .lv-header h3 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
    .lv-header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .lv-body { flex: 1; overflow-y: auto; padding: 16px; }
    .lv-post { background: #f9fafb; border-radius: 10px; padding: 14px; margin-bottom: 10px; cursor: pointer; transition: background 0.2s; }
    .lv-post:hover { background: #f3f4f6; }
    .lv-post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .lv-post-votes { display: flex; flex-direction: column; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; min-width: 44px; }
    .lv-post-votes span { font-size: 16px; font-weight: 700; color: #111827; }
    .lv-post-votes small { font-size: 9px; color: #9ca3af; text-transform: uppercase; }
    .lv-post-title { font-size: 14px; font-weight: 600; color: #111827; flex: 1; }
    .lv-badge { font-size: 10px; font-weight: 500; padding: 3px 8px; border-radius: 20px; }
    .lv-badge.feature { background: #dbeafe; color: #1d4ed8; }
    .lv-badge.bug { background: #fee2e2; color: #dc2626; }
    .lv-badge.improvement { background: #d1fae5; color: #059669; }
    .lv-footer { padding: 16px; background: #fff; border-top: 1px solid #e5e7eb; }
    .lv-submit-link { display: block; width: 100%; padding: 12px; border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; }
    .lv-submit-link:hover { opacity: 0.9; }
    .lv-powered { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 12px; font-size: 11px; color: #9ca3af; text-decoration: none; }
    .lv-powered svg { width: 12px; height: 12px; }
  </style>
</head>
<body>
  <header class="mock-header"><div class="mock-logo">YourApp</div></header>
  <main class="mock-hero">
    <h1>Welcome to YourApp</h1>
    <p>This is a preview of how the LeanVote widget will appear on your website. Click the button(s) to test.</p>
  </main>
  <script>
    const BASE_URL = '${baseUrl}';
    const configs = ${JSON.stringify(enabledWidgets)};
    const posts = ${JSON.stringify(samplePosts)};
    
    configs.forEach(cfg => {
      const w = document.createElement('div');
      w.className = 'lv-widget ' + cfg.position;
      w.innerHTML = \`
        <div class="lv-panel">
          <div class="lv-header" style="background:linear-gradient(135deg,\${cfg.primaryColor} 0%,\${cfg.primaryColor}dd 100%)">
            <h3>Feedback</h3>
            <p>See what others are requesting</p>
          </div>
          <div class="lv-body">
            \${posts.map(p => \`
              <div class="lv-post">
                <div class="lv-post-header">
                  <div class="lv-post-votes"><span>\${p.votes}</span><small>votes</small></div>
                  <div class="lv-post-title">\${p.title}</div>
                </div>
                <span class="lv-badge \${p.category}">\${p.category}</span>
              </div>
            \`).join('')}
          </div>
          <div class="lv-footer">
            <a href="\${BASE_URL}/b/\${cfg.boardSlug}" class="lv-submit-link" style="background:\${cfg.primaryColor}">Submit Feedback</a>
            <a href="\${BASE_URL}" class="lv-powered">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Powered by LeanVote
            </a>
          </div>
        </div>
        <button class="lv-btn" style="background:\${cfg.primaryColor}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>\${cfg.buttonText}</span>
        </button>
      \`;
      
      const btn = w.querySelector('.lv-btn');
      const panel = w.querySelector('.lv-panel');
      let open = false;
      
      btn.onclick = () => {
        open = !open;
        panel.classList.toggle('visible', open);
        btn.classList.toggle('open', open);
        btn.innerHTML = open 
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
          : \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>\${cfg.buttonText}</span>\`;
      };
      
      document.body.appendChild(w);
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
