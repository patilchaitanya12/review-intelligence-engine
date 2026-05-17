import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const DARK = {
  bg: "#080C14", surface: "#0D1420", border: "#1A2540", borderHover: "#243355",
  text: "#E2E8F5", textSub: "#6B7FA3", textMuted: "#3D4F72",
  accent: "#4C9EEB", accentGlow: "rgba(76,158,235,0.15)", accentSoft: "rgba(76,158,235,0.08)",
  success: "#34D399", successBg: "rgba(52,211,153,0.08)", error: "#F87171",
  errorBg: "rgba(248,113,113,0.08)", logBg: "#050810", logText: "#7AADCF",
  pill: "rgba(76,158,235,0.12)", pillText: "#4C9EEB", tag: "#1A2540",
  warning: "#FBBF24", orange: "#FB923C", purple: "#A78BFA", purpleBg: "rgba(167,139,250,0.08)",
  shadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)",
  shadowSm: "0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
};
const LIGHT = {
  bg: "#F0F4FA", surface: "#FFFFFF", border: "#DDE5F0", borderHover: "#C2D0E8",
  text: "#0F1A2E", textSub: "#5A6E96", textMuted: "#A0B0CC",
  accent: "#2B7FD4", accentGlow: "rgba(43,127,212,0.12)", accentSoft: "rgba(43,127,212,0.06)",
  success: "#059669", successBg: "rgba(5,150,105,0.07)", error: "#DC2626",
  errorBg: "rgba(220,38,38,0.06)", logBg: "#F8FAFD", logText: "#2B6CB0",
  pill: "rgba(43,127,212,0.10)", pillText: "#2B7FD4", tag: "#EEF2FA",
  warning: "#D97706", orange: "#EA580C", purple: "#7C3AED", purpleBg: "rgba(124,58,237,0.07)",
  shadow: "0 1px 3px rgba(15,26,46,0.06), 0 8px 32px rgba(15,26,46,0.08)",
  shadowSm: "0 1px 3px rgba(15,26,46,0.05), 0 4px 12px rgba(15,26,46,0.06)",
};

function injectFonts() {
  if (document.getElementById("ca-fonts")) return;
  const l = document.createElement("link");
  l.id = "ca-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(l);
}

// ── BACK BUTTON ───────────────────────────────────────────────────────────────
function BackButton({ t }) {
  return (
    <button
      onClick={() => window.location.href = "/"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "transparent", border: `1px solid ${t.border}`,
        borderRadius: 8, padding: "6px 14px", fontSize: 12,
        fontWeight: 600, color: t.textSub, cursor: "pointer",
        fontFamily: "'Sora', sans-serif", transition: "all 0.2s",
        letterSpacing: "0.3px",
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSub; }}
    >
      ← Home
    </button>
  );
}

// ── WINNER BADGE ──────────────────────────────────────────────────────────────
function WinnerBadge({ insights, products, t }) {
  if (!insights?.winner) return null;
  const winnerAsin = insights.winner.asin;
  const idx = products.findIndex(p => p.asin === winnerAsin);

  return (
    <div style={{
      background: t.accentSoft, border: `1.5px solid ${t.accent}`,
      borderRadius: 20, padding: "28px 32px", marginBottom: 28,
      display: "flex", alignItems: "flex-start", gap: 20,
      boxShadow: `0 4px 24px ${t.accentGlow}`,
    }}>
      <div style={{ fontSize: 34, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>🏆</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.4px", textTransform: "uppercase", color: t.accent, marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>
          Best Pick
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: t.text, fontFamily: "'Sora', sans-serif", marginBottom: 8, lineHeight: 1.3, letterSpacing: "-0.3px" }}>
          Product {idx + 1}
          <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: t.textSub, fontWeight: 400, marginLeft: 10 }}>
            {winnerAsin}
          </span>
        </div>
        <div style={{ fontSize: 14, color: t.textSub, lineHeight: 1.6, fontFamily: "'Sora', sans-serif", marginBottom: 14 }}>
          {insights.winner.reason}
        </div>
        <a href={insights.winner.url} target="_blank" rel="noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: t.accent, color: "#fff", borderRadius: 8,
          padding: "8px 16px", fontSize: 13, fontWeight: 600,
          textDecoration: "none", fontFamily: "'Sora', sans-serif",
          boxShadow: `0 4px 16px ${t.accentGlow}`,
        }}>
          View on Amazon ↗
        </a>
      </div>
    </div>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ product, insightProduct, index, isWinner, t }) {
  return (
    <div style={{
      background: t.surface, border: isWinner ? `1.5px solid ${t.accent}` : `1px solid ${t.border}`,
      borderRadius: 18, padding: "22px 22px 18px",
      boxShadow: isWinner ? `0 4px 24px ${t.accentGlow}` : t.shadowSm,
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = t.shadow; }}
      onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isWinner ? `0 4px 24px ${t.accentGlow}` : t.shadowSm; }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: isWinner ? t.accent : t.textSub, fontFamily: "'Sora', sans-serif" }}>
          Product {index + 1}{isWinner && " · Best Pick"}
        </div>
        <a href={product.url} target="_blank" rel="noreferrer" style={{
          fontSize: 11, color: t.pillText, textDecoration: "none",
          fontFamily: "'DM Mono', monospace", background: t.pill,
          borderRadius: 6, padding: "3px 8px",
        }}>↗ Amazon</a>
      </div>

      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: t.textMuted, marginBottom: 16 }}>
        {product.asin}
      </div>

      {/* Pros */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: t.success, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>✓ Pros</div>
        {(insightProduct?.pros || product.pros || []).map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: `1px solid ${t.border}`, fontSize: 13, color: t.text, lineHeight: 1.5, fontFamily: "'Sora', sans-serif" }}>
            <span style={{ color: t.success, flexShrink: 0 }}>+</span>{p}
          </div>
        ))}
      </div>

      {/* Cons */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: t.error, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>✕ Cons</div>
        {(insightProduct?.cons || product.cons || []).map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: `1px solid ${t.border}`, fontSize: 13, color: t.text, lineHeight: 1.5, fontFamily: "'Sora', sans-serif" }}>
            <span style={{ color: t.error, flexShrink: 0 }}>−</span>{c}
          </div>
        ))}
      </div>

      {/* Best For + Watch Out */}
      {insightProduct && (
        <>
          <div style={{ background: t.successBg, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: t.success, marginBottom: 4, fontFamily: "'Sora', sans-serif" }}>Best for</div>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5, fontFamily: "'Sora', sans-serif" }}>{insightProduct.best_for}</div>
          </div>
          <div style={{ background: `${t.error}0D`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: t.error, marginBottom: 4, fontFamily: "'Sora', sans-serif" }}>⚠ Watch out</div>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5, fontFamily: "'Sora', sans-serif" }}>{insightProduct.watch_out}</div>
          </div>
        </>
      )}
    </div>
  );
}

// ── TERMINAL ──────────────────────────────────────────────────────────────────
function TerminalLog({ logs, loading, done, t }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  if (!loading && logs.length === 0) return null;

  return (
    <div style={{ background: t.logBg, borderRadius: 16, overflow: "hidden", marginBottom: 20, boxShadow: t.shadow }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `1px solid ${t.border}` }}>
        {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        <span style={{ marginLeft: 4, fontSize: 11, fontFamily: "'DM Mono', monospace", color: t.textMuted, letterSpacing: "1px", textTransform: "uppercase" }}>Analysis Stream</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "'DM Mono', monospace", color: done ? t.success : t.accent, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: done ? t.success : t.accent, display: "inline-block", animation: done ? "none" : "pulse 1.4s ease-in-out infinite" }} />
          {done ? "Complete" : "Running"}
        </span>
      </div>
      <div ref={ref} style={{ padding: "14px 16px", height: 160, overflowY: "auto", fontFamily: "'DM Mono', monospace", fontSize: 12.5, lineHeight: 1.8, color: t.logText }}>
        {logs.map((l, i) => <div key={i} style={{ animation: "fadeIn 0.2s ease" }}>{l}</div>)}
        {loading && <span style={{ display: "inline-block", width: 7, height: 13, background: t.accent, borderRadius: 1, animation: "blink 1s step-end infinite", verticalAlign: "middle" }} />}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CustomerApp() {
  const [dark, setDark] = useState(true);
  const t = dark ? DARK : LIGHT;
  const [mode, setMode] = useState("search");
  const [query, setQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { injectFonts(); }, []);

  const handleAnalyze = async () => {
    setLogs([]); setResult(null); setError(null); setLoading(true); setDone(false);
    const endpoint = mode === "search" ? "/customer/search-compare" : "/customer/compare";
    const payload = mode === "search"
      ? { query, max_results: 3 }
      : { urls: urlInput.split("\n").map(u => u.trim()).filter(Boolean) };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { value, done: sd } = await reader.read();
        if (sd) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.replace("data: ", ""));
            if (parsed.log) setLogs(prev => [...prev, parsed.log]);
            if (parsed.result) { setResult(parsed.result); setDone(true); setLoading(false); }
            if (parsed.error) { setError(parsed.error); setLoading(false); }
          } catch {}
        }
      }
    } catch {
      setError("Connection failed — is the backend running?");
      setLoading(false);
    }
  };

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${t.bg}; color: ${t.text}; font-family: 'Sora', sans-serif; transition: background 0.3s, color 0.3s; }
    ::selection { background: ${t.accentGlow}; color: ${t.accent}; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

    .ca-input { width: 100%; background: ${t.bg}; border: 1px solid ${t.border}; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-family: 'Sora', sans-serif; color: ${t.text}; outline: none; transition: all 0.2s; resize: none; }
    .ca-input::placeholder { color: ${t.textMuted}; }
    .ca-input:focus { border-color: ${t.accent}; box-shadow: 0 0 0 3px ${t.accentSoft}; }

    .ca-btn { display: inline-flex; align-items: center; gap: 8px; background: ${t.accent}; color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; font-family: 'Sora', sans-serif; cursor: pointer; transition: all 0.2s; margin-top: 10px; box-shadow: 0 4px 20px ${t.accentGlow}; letter-spacing: 0.2px; }
    .ca-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px ${t.accentGlow}; }
    .ca-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .ca-mode-btn { background: transparent; border: 1px solid ${t.border}; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600; font-family: 'Sora', sans-serif; cursor: pointer; transition: all 0.2s; color: ${t.textSub}; letter-spacing: 0.3px; }
    .ca-mode-btn.active { background: ${t.accent}; color: #fff; border-color: ${t.accent}; box-shadow: 0 4px 16px ${t.accentGlow}; }
    .ca-mode-btn:hover:not(.active) { border-color: ${t.accent}; color: ${t.accent}; }

    .ca-toggle { display: flex; align-items: center; gap: 8px; background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 20px; padding: 6px 12px; cursor: pointer; user-select: none; transition: all 0.2s; }
    .ca-toggle:hover { border-color: ${t.accent}; }
    .ca-toggle-track { width: 32px; height: 18px; border-radius: 9px; background: ${dark ? t.accent : t.border}; position: relative; transition: background 0.3s; }
    .ca-toggle-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: ${dark ? "17px" : "3px"}; transition: left 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

    .ca-summary { background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 16px; padding: 18px 22px; margin-bottom: 24px; font-size: 14px; color: ${t.textSub}; line-height: 1.6; font-family: 'Sora', sans-serif; font-style: italic; animation: slideUp 0.4s ease; box-shadow: ${t.shadowSm}; }
    .ca-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; animation: slideUp 0.5s ease; }
    .ca-section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${t.textSub}; margin-bottom: 14px; margin-top: 28px; display: flex; align-items: center; gap: 8px; font-family: 'Sora', sans-serif; }
    .ca-section-line { flex: 1; height: 1px; background: ${t.border}; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", padding: "0 0 80px" }}>

        {/* TOP NAV */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: `1px solid ${t.border}`, background: t.surface, boxShadow: t.shadowSm, marginBottom: 32, position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BackButton t={t} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: `0 0 14px ${t.accentGlow}` }}>🛒</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: "-0.3px", fontFamily: "'Sora', sans-serif" }}>Smart Shopper</div>
                <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'Sora', sans-serif" }}>Compare products · Get honest recommendations</div>
              </div>
            </div>
          </div>
          <div className="ca-toggle" onClick={() => setDark(!dark)}>
            <span style={{ fontSize: 12, color: t.textSub, fontWeight: 500, fontFamily: "'Sora', sans-serif" }}>{dark ? "Dark" : "Light"}</span>
            <div className="ca-toggle-track"><div className="ca-toggle-thumb" /></div>
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>

          {/* INPUT CARD */}
          <div style={{ background: t.surface, borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: t.shadow }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: t.textSub, marginBottom: 16, fontFamily: "'Sora', sans-serif" }}>Configure Comparison</div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button className={`ca-mode-btn ${mode === "search" ? "active" : ""}`} onClick={() => setMode("search")}>🔍 Search products</button>
              <button className={`ca-mode-btn ${mode === "urls" ? "active" : ""}`} onClick={() => setMode("urls")}>🔗 Paste URLs</button>
            </div>

            {mode === "search" ? (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: t.textSub, display: "block", marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>What are you looking for?</label>
                <input className="ca-input" placeholder='e.g. "best 43 inch TV under 30k" or "noise cancelling headphones for gym"' value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && handleAnalyze()} />
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 8, fontFamily: "'Sora', sans-serif" }}>We'll find the top 3 products on Amazon.in and compare them for you</div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: t.textSub, display: "block", marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>Amazon product URLs — one per line (2–4 products)</label>
                <textarea className="ca-input" rows={4} placeholder={"https://www.amazon.in/dp/XXXXXXXXXX\nhttps://www.amazon.in/dp/YYYYYYYYYY"} value={urlInput} onChange={e => setUrlInput(e.target.value)} />
              </div>
            )}

            <button className="ca-btn" onClick={handleAnalyze} disabled={loading || (!query && !urlInput)}>
              {loading ? <><span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.7)", animation: "pulse 1s infinite", display: "inline-block" }} /> Comparing...</> : "→ Find Best Product"}
            </button>
          </div>

          {/* TERMINAL */}
          <TerminalLog logs={logs} loading={loading} done={done} t={t} />

          {/* ERROR */}
          {error && (
            <div style={{ background: t.errorBg, border: `1px solid ${t.error}30`, borderRadius: 12, padding: "14px 18px", color: t.error, fontSize: 13, marginBottom: 20, fontFamily: "'Sora', sans-serif" }}>
              ⚠ {error}
            </div>
          )}

          {/* RESULTS */}
          {result && (
            <div style={{ animation: "slideUp 0.4s ease" }}>
              <WinnerBadge insights={result.insights} products={result.products} t={t} />

              {result.insights?.summary && (
                <div className="ca-summary">"{result.insights.summary}"</div>
              )}

              <div className="ca-section-title">All Products Compared <div className="ca-section-line" /></div>
              <div className="ca-grid">
                {result.products.map((product, i) => {
                  const insightProduct = result.insights?.products?.find(p => p.asin === product.asin);
                  const isWinner = result.insights?.winner?.asin === product.asin;
                  return <ProductCard key={product.asin} product={product} insightProduct={insightProduct} index={i} isWinner={isWinner} t={t} />;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}