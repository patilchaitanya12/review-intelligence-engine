import { useState, useRef, useEffect } from "react";
import { streamAnalysis } from "./api";

const DARK = {
  bg: "#080C14", surface: "#0D1420", surfaceHover: "#111B2E",
  border: "#1A2540", borderHover: "#243355", text: "#E2E8F5",
  textSub: "#6B7FA3", textMuted: "#3D4F72", accent: "#4C9EEB",
  accentGlow: "rgba(76,158,235,0.15)", accentSoft: "rgba(76,158,235,0.08)",
  success: "#34D399", successBg: "rgba(52,211,153,0.08)", error: "#F87171",
  logBg: "#050810", logBorder: "#111B2E", logText: "#7AADCF", cursor: "#4C9EEB",
  pill: "rgba(76,158,235,0.12)", pillText: "#4C9EEB", tag: "#1A2540",
  warning: "#FBBF24", warningBg: "rgba(251,191,36,0.08)",
  purple: "#A78BFA", purpleBg: "rgba(167,139,250,0.08)",
  orange: "#FB923C", orangeBg: "rgba(251,146,60,0.08)",
};

const LIGHT = {
  bg: "#F0F4FA", surface: "#FFFFFF", surfaceHover: "#F7FAFF",
  border: "#DDE5F0", borderHover: "#C2D0E8", text: "#0F1A2E",
  textSub: "#5A6E96", textMuted: "#A0B0CC", accent: "#2B7FD4",
  accentGlow: "rgba(43,127,212,0.12)", accentSoft: "rgba(43,127,212,0.06)",
  success: "#059669", successBg: "rgba(5,150,105,0.07)", error: "#DC2626",
  logBg: "#F8FAFD", logBorder: "#DDE5F0", logText: "#2B6CB0", cursor: "#2B7FD4",
  pill: "rgba(43,127,212,0.10)", pillText: "#2B7FD4", tag: "#EEF2FA",
  warning: "#D97706", warningBg: "rgba(217,119,6,0.07)",
  purple: "#7C3AED", purpleBg: "rgba(124,58,237,0.07)",
  orange: "#EA580C", orangeBg: "rgba(234,88,12,0.07)",
};

function useTheme(dark) { return dark ? DARK : LIGHT; }

function injectFonts() {
  if (document.getElementById("ri-fonts")) return;
  const link = document.createElement("link");
  link.id = "ri-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

const SEVERITY_COLOR = (severity, t) => ({
  high: t.error, medium: t.warning, low: t.success,
}[severity?.toLowerCase()] || t.textSub);

export default function App() {
  const [mainUrl, setMainUrl] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [dark, setDark] = useState(true);
  const [logDone, setLogDone] = useState(false);
  const logRef = useRef(null);
  const t = useTheme(dark);

  useEffect(() => { injectFonts(); }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const formatItem = (item) => {
    if (typeof item === "string") return item;
    if (typeof item === "object") return item.description || item.text || JSON.stringify(item);
    return "";
  };

  // ── ANALYZE ────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setLogs([]);
    setData(null);
    setLoading(true);
    setLogDone(false);

    const payload = {
      main_product: mainUrl,
      competitors: competitors.split("\n").filter(Boolean),
    };

    try {
      await streamAnalysis(
        payload,
        (log) => setLogs((prev) => [...prev, log]),
        (result) => { setData(result); setLoading(false); setLogDone(true); }
      );
    } catch {
      setLogs((prev) => [...prev, "ERR  Connection failed"]);
      setLoading(false);
      setLogDone(true);
    }
  };

  // ── PDF EXPORT ─────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    // Inject print-only styles
    const style = document.createElement("style");
    style.id = "ri-print-style";
    style.innerHTML = `
      @media print {
        /* Force light mode for all elements */
        .ri-root, .ri-wrap, body {
          background: #ffffff !important;
          color: #0F1A2E !important;
        }
        .ri-section-title {
          color: #5A6E96 !important;
        }
        .ri-section-line {
          background: #DDE5F0 !important;
        }
        .ri-list-card, .ri-strategy, .ri-improve-card,
        .ri-angle-card, .ri-audience-card, .ri-risk-card,
        .ri-win-item {
          background: #ffffff !important;
          color: #0F1A2E !important;
          box-shadow: none !important;
          border: 1px solid #DDE5F0 !important;
          break-inside: avoid;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .ri-list-item, .ri-strategy-value, .ri-improve-issue,
        .ri-angle-rationale, .ri-audience-reason, .ri-risk-mitigation {
          color: #0F1A2E !important;
        }
        .ri-list-card-title { color: inherit !important; }
        .ri-pros { background: rgba(5,150,105,0.07) !important; }
        .ri-strengths { background: rgba(43,127,212,0.06) !important; }
        .ri-angle-card { background: rgba(124,58,237,0.07) !important; }
        .ri-win-item { background: rgba(5,150,105,0.07) !important; }
        .ri-improve-action {
          background: rgba(5,150,105,0.07) !important;
          color: #059669 !important;
        }
        .ri-win-num { color: #059669 !important; }
        .ri-angle-hook { color: #7C3AED !important; }
        .ri-audience-segment { color: #2B7FD4 !important; }
        .ri-diff-badge {
          background: rgba(43,127,212,0.06) !important;
          color: #2B7FD4 !important;
        }
        /* Hide UI chrome */
        .ri-header { display: none !important; }
        .ri-card { display: none !important; }
        .ri-terminal { display: none !important; }
        .ri-links { display: none !important; }
        .ri-export-row { display: none !important; }
        .ri-root { padding: 8px 16px !important; }
        .ri-wrap { max-width: 100% !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    // Remove after dialog closes
    setTimeout(() => {
      const s = document.getElementById("ri-print-style");
      if (s) s.remove();
    }, 1500);
  };

  // ── CSS ────────────────────────────────────────────────────────────────────
  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${t.bg}; color: ${t.text}; font-family: 'Sora', sans-serif; transition: background 0.3s, color 0.3s; }
    ::selection { background: ${t.accentGlow}; color: ${t.accent}; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }

    .ri-root { min-height: 100vh; padding: 40px 20px 80px; }
    .ri-wrap { max-width: 960px; margin: 0 auto; }

    /* HEADER */
    .ri-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 48px; }
    .ri-logo { display: flex; align-items: center; gap: 12px; }
    .ri-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: ${t.accent}; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 20px ${t.accentGlow}; flex-shrink: 0; }
    .ri-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: ${t.text}; line-height: 1; }
    .ri-subtitle { font-size: 13px; color: ${t.textSub}; margin-top: 4px; font-weight: 400; }

    /* TOGGLE */
    .ri-toggle { display: flex; align-items: center; gap: 8px; background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 20px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; user-select: none; }
    .ri-toggle:hover { border-color: ${t.borderHover}; }
    .ri-toggle-track { width: 32px; height: 18px; border-radius: 9px; background: ${dark ? t.accent : t.border}; position: relative; transition: background 0.3s; }
    .ri-toggle-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: ${dark ? "17px" : "3px"}; transition: left 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
    .ri-toggle-label { font-size: 12px; color: ${t.textSub}; font-weight: 500; }

    /* CARD */
    .ri-card { background: ${t.surface}; border: none; border-radius: 20px; padding: 32px; margin-bottom: 16px; transition: all 0.2s; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)" : "0 1px 3px rgba(15,26,46,0.06), 0 8px 32px rgba(15,26,46,0.08)"}; }
    .ri-card-label { font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: ${t.textSub}; margin-bottom: 16px; }

    /* INPUT */
    .ri-input-wrap { position: relative; margin-bottom: 14px; }
    .ri-input-label { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: ${t.textSub}; margin-bottom: 8px; display: block; }
    .ri-input { width: 100%; background: ${dark ? t.bg : "#F8FAFF"}; border: 1px solid ${t.border}; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-family: 'Sora', sans-serif; color: ${t.text}; outline: none; transition: all 0.2s; resize: none; }
    .ri-input::placeholder { color: ${t.textMuted}; }
    .ri-input:focus { border-color: ${t.accent}; box-shadow: 0 0 0 3px ${t.accentSoft}; }

    /* BUTTONS */
    .ri-btn { display: inline-flex; align-items: center; gap: 8px; background: ${t.accent}; color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; font-family: 'Sora', sans-serif; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; margin-top: 8px; box-shadow: 0 4px 20px ${t.accentGlow}; }
    .ri-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px ${t.accentGlow}; }
    .ri-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .ri-btn-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.7); animation: blink 1s ease-in-out infinite; }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }

    /* EXPORT BUTTON */
    .ri-btn-export { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: ${t.textSub}; border: 1px solid ${t.border}; border-radius: 10px; padding: 9px 18px; font-size: 13px; font-weight: 600; font-family: 'Sora', sans-serif; cursor: pointer; transition: all 0.2s; }
    .ri-btn-export:hover { border-color: ${t.accent}; color: ${t.accent}; background: ${t.accentSoft}; }
    .ri-export-row { display: flex; justify-content: flex-end; margin-bottom: 16px; }

    /* TERMINAL */
    .ri-terminal { background: ${t.logBg}; border: none; border-radius: 16px; overflow: hidden; margin-bottom: 16px; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.35)" : "0 1px 3px rgba(15,26,46,0.06), 0 8px 24px rgba(15,26,46,0.08)"}; }
    .ri-terminal-bar { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}; }
    .ri-terminal-dot { width: 10px; height: 10px; border-radius: 50%; }
    .ri-terminal-title { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${t.textMuted}; margin-left: 4px; }
    .ri-terminal-status { margin-left: auto; font-size: 11px; font-family: 'DM Mono', monospace; color: ${logDone ? t.success : t.accent}; display: flex; align-items: center; gap: 6px; }
    .ri-terminal-status-dot { width: 6px; height: 6px; border-radius: 50%; background: ${logDone ? t.success : t.accent}; animation: ${logDone ? "none" : "pulse 1.4s ease-in-out infinite"}; }
    @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    .ri-terminal-body { padding: 16px; height: 180px; overflow-y: auto; font-family: 'DM Mono', monospace; font-size: 12.5px; line-height: 1.8; }
    .ri-log-line { display: flex; gap: 12px; align-items: flex-start; animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    .ri-log-ts { color: ${t.textMuted}; flex-shrink: 0; font-size: 11px; padding-top: 1px; }
    .ri-log-text { color: ${t.logText}; }
    .ri-log-err { color: ${t.error}; }
    .ri-cursor { display: inline-block; width: 7px; height: 13px; background: ${t.cursor}; margin-left: 2px; vertical-align: middle; animation: blink 1s step-end infinite; border-radius: 1px; }

    /* QUICK LINKS */
    .ri-links { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
    .ri-link-chip { display: inline-flex; align-items: center; gap: 6px; background: ${t.pill}; color: ${t.pillText}; border: 1px solid ${dark ? "rgba(76,158,235,0.2)" : "rgba(43,127,212,0.2)"}; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 600; text-decoration: none; transition: all 0.2s; letter-spacing: 0.3px; }
    .ri-link-chip:hover { background: ${t.accentGlow}; transform: translateY(-1px); }

    /* SECTION */
    .ri-section-title { font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${t.textSub}; margin-bottom: 14px; margin-top: 32px; display: flex; align-items: center; gap: 8px; }
    .ri-section-line { flex: 1; height: 1px; background: ${t.border}; }

    /* GRID */
    .ri-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .ri-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .ri-grid { grid-template-columns: 1fr; } .ri-grid-3 { grid-template-columns: 1fr; } }

    /* LIST CARD */
    .ri-list-card { background: ${t.surface}; border: none; border-radius: 16px; padding: 22px; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(0,0,0,0.28)" : "0 1px 3px rgba(15,26,46,0.05), 0 6px 20px rgba(15,26,46,0.07)"}; }
    .ri-list-card-title { font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
    .ri-list-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}; font-size: 13.5px; line-height: 1.5; color: ${t.text}; }
    .ri-list-item:last-child { border-bottom: none; padding-bottom: 0; }
    .ri-list-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 7px; }

    .ri-pros .ri-list-card-title { color: ${t.success}; }
    .ri-pros .ri-list-dot { background: ${t.success}; }
    .ri-pros { background: ${t.successBg}; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(52,211,153,0.06)" : "0 1px 3px rgba(15,26,46,0.05), 0 6px 20px rgba(5,150,105,0.07)"}; }

    .ri-cons .ri-list-card-title { color: ${t.error}; }
    .ri-cons .ri-list-dot { background: ${t.error}; }

    .ri-strengths .ri-list-card-title { color: ${t.accent}; }
    .ri-strengths .ri-list-dot { background: ${t.accent}; }
    .ri-strengths { background: ${t.accentSoft}; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(76,158,235,0.07)" : "0 1px 3px rgba(15,26,46,0.05), 0 6px 20px rgba(43,127,212,0.07)"}; }

    .ri-weaknesses .ri-list-card-title { color: ${t.orange}; }
    .ri-weaknesses .ri-list-dot { background: ${t.orange}; }

    /* STRATEGY */
    .ri-strategy { background: ${t.surface}; border: none; border-radius: 16px; padding: 24px; margin-top: 14px; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(0,0,0,0.28)" : "0 1px 3px rgba(15,26,46,0.05), 0 6px 20px rgba(15,26,46,0.07)"}; }
    .ri-strategy-row { padding: 12px 0; border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}; }
    .ri-strategy-row:last-child { border-bottom: none; padding-bottom: 0; }
    .ri-strategy-label { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${t.textSub}; margin-bottom: 6px; }
    .ri-strategy-value { font-size: 14px; line-height: 1.6; color: ${t.text}; }

    /* INSIGHTS — IMPROVEMENT CARDS */
    .ri-improve-card { background: ${t.surface}; border-radius: 14px; padding: 18px 20px; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(0,0,0,0.28)" : "0 1px 3px rgba(15,26,46,0.05), 0 6px 20px rgba(15,26,46,0.07)"}; }
    .ri-improve-area { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${t.error}; margin-bottom: 8px; }
    .ri-improve-issue { font-size: 13px; color: ${t.text}; line-height: 1.5; margin-bottom: 8px; }
    .ri-improve-action { font-size: 12.5px; color: ${t.success}; background: ${t.successBg}; border-radius: 8px; padding: 8px 12px; line-height: 1.5; }
    .ri-improve-action::before { content: "→ "; font-weight: 700; }

    /* INSIGHTS — MARKETING ANGLES */
    .ri-angle-card { background: ${t.purpleBg}; border-radius: 14px; padding: 18px 20px; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(167,139,250,0.06)" : "0 1px 3px rgba(15,26,46,0.05), 0 6px 20px rgba(124,58,237,0.06)"}; }
    .ri-angle-hook { font-size: 15px; font-weight: 600; color: ${t.purple}; margin-bottom: 8px; line-height: 1.4; }
    .ri-angle-rationale { font-size: 12.5px; color: ${t.textSub}; line-height: 1.5; }

    /* INSIGHTS — AUDIENCE */
    .ri-audience-card { background: ${t.surface}; border-radius: 14px; padding: 18px 20px; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(0,0,0,0.28)" : "0 1px 3px rgba(15,26,46,0.05), 0 6px 20px rgba(15,26,46,0.07)"}; }
    .ri-audience-segment { font-size: 13px; font-weight: 600; color: ${t.accent}; margin-bottom: 6px; }
    .ri-audience-reason { font-size: 12.5px; color: ${t.textSub}; line-height: 1.5; }

    /* INSIGHTS — DIFFERENTIATORS */
    .ri-diff-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}; font-size: 13.5px; color: ${t.text}; line-height: 1.5; }
    .ri-diff-item:last-child { border-bottom: none; }
    .ri-diff-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; background: ${t.accentSoft}; color: ${t.accent}; border-radius: 6px; padding: 2px 8px; flex-shrink: 0; margin-top: 2px; }

    /* INSIGHTS — RISK FLAGS */
    .ri-risk-card { background: ${t.surface}; border-radius: 14px; padding: 18px 20px; box-shadow: ${dark ? "0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(0,0,0,0.28)" : "0 1px 3px rgba(15,26,46,0.05), 0 6px 20px rgba(15,26,46,0.07)"}; }
    .ri-risk-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .ri-risk-label { font-size: 13px; font-weight: 600; color: ${t.text}; }
    .ri-risk-mitigation { font-size: 12.5px; color: ${t.textSub}; line-height: 1.5; }

    /* INSIGHTS — QUICK WINS */
    .ri-win-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; background: ${t.successBg}; border-radius: 10px; font-size: 13.5px; color: ${t.text}; line-height: 1.5; }
    .ri-win-num { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 700; color: ${t.success}; flex-shrink: 0; padding-top: 2px; }
  `;

  const now = new Date();
  const ts = (i) => {
    const d = new Date(now.getTime() + i * 1200);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };

  const insights = data?.insights || {};

  return (
    <>
      <style>{css}</style>
      <div className="ri-root">
        <div className="ri-wrap">

          {/* HEADER */}
          <div className="ri-header">
            <div className="ri-logo">
              <div className="ri-logo-icon">🧠</div>
              <div>
                <div className="ri-title">Review Intelligence</div>
                <div className="ri-subtitle">Turn reviews into actionable insights</div>
              </div>
            </div>
            <div className="ri-toggle" onClick={() => setDark(!dark)}>
              <span className="ri-toggle-label">{dark ? "Dark" : "Light"}</span>
              <div className="ri-toggle-track">
                <div className="ri-toggle-thumb" />
              </div>
            </div>
          </div>

          {/* INPUT CARD */}
          <div className="ri-card">
            <div className="ri-card-label">Configure Analysis</div>
            <div className="ri-input-wrap">
              <label className="ri-input-label">Main Product URL</label>
              <input
                className="ri-input"
                placeholder="https://amazon.com/dp/..."
                value={mainUrl}
                onChange={(e) => setMainUrl(e.target.value)}
              />
            </div>
            <div className="ri-input-wrap">
              <label className="ri-input-label">Competitor URLs — one per line</label>
              <textarea
                className="ri-input"
                rows={3}
                placeholder={"https://amazon.com/dp/...\nhttps://amazon.com/dp/..."}
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
              />
            </div>
            <button className="ri-btn" onClick={handleAnalyze} disabled={loading}>
              {loading ? (<><div className="ri-btn-dot" /> Analyzing</>) : (<>→ Run Analysis</>)}
            </button>
          </div>

          {/* TERMINAL */}
          {(loading || logs.length > 0) && (
            <div className="ri-terminal">
              <div className="ri-terminal-bar">
                <div className="ri-terminal-dot" style={{ background: "#FF5F57" }} />
                <div className="ri-terminal-dot" style={{ background: "#FEBC2E" }} />
                <div className="ri-terminal-dot" style={{ background: "#28C840" }} />
                <span className="ri-terminal-title">Analysis Stream</span>
                <span className="ri-terminal-status">
                  <div className="ri-terminal-status-dot" />
                  {logDone ? "Complete" : "Running"}
                </span>
              </div>
              <div className="ri-terminal-body" ref={logRef}>
                {logs.map((log, i) => (
                  <div key={i} className="ri-log-line">
                    <span className="ri-log-ts">{ts(i)}</span>
                    <span className={log.startsWith("ERR") ? "ri-log-err" : "ri-log-text"}>{log}</span>
                  </div>
                ))}
                {loading && (
                  <div className="ri-log-line">
                    <span className="ri-log-ts">{ts(logs.length)}</span>
                    <span className="ri-log-text"><span className="ri-cursor" /></span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {data && (
            <>
              {/* QUICK LINKS */}
              <div className="ri-links" style={{ marginTop: 8 }}>
                {mainUrl && (
                  <a className="ri-link-chip" href={mainUrl} target="_blank" rel="noreferrer">↗ Main Product</a>
                )}
                {competitors.split("\n").filter(Boolean).map((url, i) => (
                  <a key={i} className="ri-link-chip" href={url} target="_blank" rel="noreferrer">↗ Competitor {i + 1}</a>
                ))}
              </div>

              {/* EXPORT BUTTON */}
              <div className="ri-export-row">
                <button className="ri-btn-export" onClick={handleExportPDF}>
                  ↓ Export PDF
                </button>
              </div>

              {/* PROS / CONS */}
              <div className="ri-section-title">Product Insights <div className="ri-section-line" /></div>
              <div className="ri-grid">
                <div className="ri-list-card ri-pros">
                  <div className="ri-list-card-title">✓ Pros</div>
                  {data.main.pros.map((p, i) => (
                    <div key={i} className="ri-list-item"><div className="ri-list-dot" />{formatItem(p)}</div>
                  ))}
                </div>
                <div className="ri-list-card ri-cons">
                  <div className="ri-list-card-title">✕ Cons</div>
                  {data.main.cons.map((c, i) => (
                    <div key={i} className="ri-list-item"><div className="ri-list-dot" />{formatItem(c)}</div>
                  ))}
                </div>
              </div>

              {/* COMPARISON */}
              <div className="ri-section-title">Competitive Comparison <div className="ri-section-line" /></div>
              <div className="ri-grid">
                <div className="ri-list-card ri-strengths">
                  <div className="ri-list-card-title">↑ Strengths</div>
                  {data.comparison.strengths.map((s, i) => (
                    <div key={i} className="ri-list-item"><div className="ri-list-dot" />{formatItem(s)}</div>
                  ))}
                </div>
                <div className="ri-list-card ri-weaknesses">
                  <div className="ri-list-card-title">↓ Weaknesses</div>
                  {data.comparison.weaknesses.map((w, i) => (
                    <div key={i} className="ri-list-item"><div className="ri-list-dot" />{formatItem(w)}</div>
                  ))}
                </div>
              </div>

              {/* STRATEGY */}
              <div className="ri-section-title">Strategy <div className="ri-section-line" /></div>
              <div className="ri-strategy">
                <div className="ri-strategy-row">
                  <div className="ri-strategy-label">Positioning</div>
                  <div className="ri-strategy-value">{data.comparison.positioning}</div>
                </div>
                <div className="ri-strategy-row">
                  <div className="ri-strategy-label">Summary</div>
                  <div className="ri-strategy-value">{data.comparison.summary}</div>
                </div>
              </div>

              {/* INSIGHTS */}
              {insights && Object.keys(insights).length > 0 && (
                <>
                  {insights.improvements?.length > 0 && (
                    <>
                      <div className="ri-section-title">Improvements <div className="ri-section-line" /></div>
                      <div className="ri-grid">
                        {insights.improvements.map((item, i) => (
                          <div key={i} className="ri-improve-card">
                            <div className="ri-improve-area">{item.area}</div>
                            <div className="ri-improve-issue">{item.issue}</div>
                            <div className="ri-improve-action">{item.action}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {insights.marketing_angles?.length > 0 && (
                    <>
                      <div className="ri-section-title">Marketing Angles <div className="ri-section-line" /></div>
                      <div className="ri-grid">
                        {insights.marketing_angles.map((item, i) => (
                          <div key={i} className="ri-angle-card">
                            <div className="ri-angle-hook">"{item.angle}"</div>
                            <div className="ri-angle-rationale">{item.rationale}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="ri-grid" style={{ marginTop: 32 }}>
                    {insights.target_audience?.length > 0 && (
                      <div>
                        <div className="ri-section-title" style={{ marginTop: 0 }}>Target Audience <div className="ri-section-line" /></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {insights.target_audience.map((item, i) => (
                            <div key={i} className="ri-audience-card">
                              <div className="ri-audience-segment">◎ {item.segment}</div>
                              <div className="ri-audience-reason">{item.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {insights.key_differentiators?.length > 0 && (
                      <div>
                        <div className="ri-section-title" style={{ marginTop: 0 }}>Key Differentiators <div className="ri-section-line" /></div>
                        <div className="ri-list-card" style={{ padding: "16px 20px" }}>
                          {insights.key_differentiators.map((item, i) => (
                            <div key={i} className="ri-diff-item">
                              <span className="ri-diff-badge">#{i + 1}</span>{item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {insights.risk_flags?.length > 0 && (
                    <>
                      <div className="ri-section-title">Risk Flags <div className="ri-section-line" /></div>
                      <div className="ri-grid">
                        {insights.risk_flags.map((item, i) => (
                          <div key={i} className="ri-risk-card">
                            <div className="ri-risk-header">
                              <div className="ri-risk-label">{item.risk}</div>
                              <span style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: "0.8px",
                                textTransform: "uppercase", color: SEVERITY_COLOR(item.severity, t),
                                background: `${SEVERITY_COLOR(item.severity, t)}18`,
                                borderRadius: 6, padding: "2px 8px", flexShrink: 0,
                              }}>{item.severity}</span>
                            </div>
                            <div className="ri-risk-mitigation">{item.mitigation}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {insights.quick_wins?.length > 0 && (
                    <>
                      <div className="ri-section-title">Quick Wins <div className="ri-section-line" /></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {insights.quick_wins.map((item, i) => (
                          <div key={i} className="ri-win-item">
                            <span className="ri-win-num">0{i + 1}</span>{item}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}