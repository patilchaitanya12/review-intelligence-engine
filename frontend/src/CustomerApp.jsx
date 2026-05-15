import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  bg: "#F7F5F0",
  surface: "#FFFFFF",
  border: "#E8E3DA",
  text: "#1A1612",
  textSub: "#8C7E6E",
  textMuted: "#C4B8A8",
  accent: "#D4622A",
  accentBg: "rgba(212,98,42,0.08)",
  accentGlow: "rgba(212,98,42,0.15)",
  success: "#2E7D52",
  successBg: "rgba(46,125,82,0.07)",
  winner: "#D4622A",
  winnerBg: "rgba(212,98,42,0.06)",
  tag: "#F0EBE3",
  shadow: "0 2px 8px rgba(26,22,18,0.06), 0 12px 32px rgba(26,22,18,0.08)",
  shadowSm: "0 1px 3px rgba(26,22,18,0.05), 0 4px 12px rgba(26,22,18,0.06)",
};

function injectFonts() {
  if (document.getElementById("ca-fonts")) return;
  const l = document.createElement("link");
  l.id = "ca-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
}

// ── WINNER BADGE ──────────────────────────────────────────────────────────────
function WinnerBadge({ insights, products }) {
  if (!insights?.winner) return null;

  const winnerAsin = insights.winner.asin;
  const winnerProduct = insights.products?.find(p => p.asin === winnerAsin);
  const idx = products.findIndex(p => p.asin === winnerAsin);

  return (
    <div style={{
      background: T.winnerBg,
      border: `1.5px solid ${T.accent}`,
      borderRadius: 20,
      padding: "28px 32px",
      marginBottom: 32,
      display: "flex",
      alignItems: "flex-start",
      gap: 20,
    }}>
      <div style={{
        fontSize: 36,
        lineHeight: 1,
        flexShrink: 0,
        marginTop: 2,
      }}>🏆</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "1.4px",
          textTransform: "uppercase",
          color: T.accent,
          marginBottom: 6,
          fontFamily: "'DM Sans', sans-serif",
        }}>Best Pick</div>
        <div style={{
          fontSize: 20,
          fontWeight: 600,
          color: T.text,
          fontFamily: "'Lora', serif",
          marginBottom: 8,
          lineHeight: 1.3,
        }}>
          Product {idx + 1}
          <span style={{
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            color: T.textSub,
            fontWeight: 400,
            marginLeft: 10,
          }}>{winnerAsin}</span>
        </div>
        <div style={{
          fontSize: 15,
          color: T.textSub,
          lineHeight: 1.6,
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 12,
        }}>{insights.winner.reason}</div>
        <a
          href={insights.winner.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: T.accent,
            color: "#fff",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
            transition: "opacity 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
        >
          View on Amazon ↗
        </a>
      </div>
    </div>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ product, insightProduct, index, isWinner }) {
  return (
    <div style={{
      background: T.surface,
      border: isWinner ? `1.5px solid ${T.accent}` : `1px solid ${T.border}`,
      borderRadius: 18,
      padding: "24px 24px 20px",
      boxShadow: isWinner ? `0 4px 24px ${T.accentGlow}` : T.shadowSm,
      position: "relative",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseOver={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = T.shadow;
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isWinner ? `0 4px 24px ${T.accentGlow}` : T.shadowSm;
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: isWinner ? T.accent : T.textSub,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Product {index + 1}
          {isWinner && " · Best Pick"}
        </div>
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 11,
            color: T.accent,
            textDecoration: "none",
            fontFamily: "'DM Mono', monospace",
            background: T.accentBg,
            borderRadius: 6,
            padding: "3px 8px",
          }}
        >↗ Amazon</a>
      </div>

      {/* ASIN */}
      <div style={{
        fontSize: 12,
        fontFamily: "'DM Mono', monospace",
        color: T.textMuted,
        marginBottom: 18,
      }}>{product.asin}</div>

      {/* Pros */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          color: T.success,
          marginBottom: 8,
          fontFamily: "'DM Sans', sans-serif",
        }}>✓ Pros</div>
        {(insightProduct?.pros || product.pros || []).map((p, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 8,
            padding: "5px 0",
            borderBottom: `1px solid ${T.border}`,
            fontSize: 13,
            color: T.text,
            lineHeight: 1.5,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ color: T.success, flexShrink: 0, marginTop: 1 }}>+</span>
            {p}
          </div>
        ))}
      </div>

      {/* Cons */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          color: "#C0392B",
          marginBottom: 8,
          fontFamily: "'DM Sans', sans-serif",
        }}>✕ Cons</div>
        {(insightProduct?.cons || product.cons || []).map((c, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 8,
            padding: "5px 0",
            borderBottom: `1px solid ${T.border}`,
            fontSize: 13,
            color: T.text,
            lineHeight: 1.5,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ color: "#C0392B", flexShrink: 0, marginTop: 1 }}>−</span>
            {c}
          </div>
        ))}
      </div>

      {/* Best For + Watch Out */}
      {insightProduct && (
        <>
          <div style={{
            background: T.successBg,
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: T.success, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Best for</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{insightProduct.best_for}</div>
          </div>
          <div style={{
            background: "rgba(192,57,43,0.05)",
            borderRadius: 10,
            padding: "10px 12px",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#C0392B", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>⚠ Watch out</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{insightProduct.watch_out}</div>
          </div>
        </>
      )}
    </div>
  );
}

// ── TERMINAL LOG ──────────────────────────────────────────────────────────────
function TerminalLog({ logs, loading, done }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  if (!loading && logs.length === 0) return null;

  return (
    <div style={{
      background: "#0F0D0A",
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 28,
      boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {["#FF5F57","#FEBC2E","#28C840"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 6, fontSize: 10, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase" }}>
          Analysis Log
        </span>
        <span style={{
          marginLeft: "auto",
          fontSize: 10,
          fontFamily: "'DM Mono', monospace",
          color: done ? "#28C840" : T.accent,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: done ? "#28C840" : T.accent,
            display: "inline-block",
            animation: done ? "none" : "pulse 1.4s ease-in-out infinite",
          }} />
          {done ? "Complete" : "Running"}
        </span>
      </div>
      <div ref={ref} style={{
        padding: "12px 14px",
        height: 140,
        overflowY: "auto",
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        lineHeight: 1.8,
        color: "rgba(180,220,170,0.85)",
      }}>
        {logs.map((l, i) => (
          <div key={i} style={{ animation: "fadeIn 0.2s ease" }}>{l}</div>
        ))}
        {loading && <span style={{ display: "inline-block", width: 7, height: 13, background: T.accent, borderRadius: 1, animation: "blink 1s step-end infinite", verticalAlign: "middle" }} />}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function CustomerApp() {
  const [mode, setMode] = useState("search"); // "search" | "urls"
  const [query, setQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { injectFonts(); }, []);

  const handleAnalyze = async () => {
    setLogs([]);
    setResult(null);
    setError(null);
    setLoading(true);
    setDone(false);

    const endpoint = mode === "search" ? "/customer/search-compare" : "/customer/compare";
    const payload = mode === "search"
      ? { query, max_results: 3 }
      : { urls: urlInput.split("\n").map(u => u.trim()).filter(Boolean) };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.replace("data: ", ""));
            if (parsed.log) setLogs(prev => [...prev, parsed.log]);
            if (parsed.result) { setResult(parsed.result); setDone(true); setLoading(false); }
            if (parsed.error) { setError(parsed.error); setLoading(false); }
          } catch {}
        }
      }
    } catch (e) {
      setError("Connection failed — is the backend running?");
      setLoading(false);
    }
  };

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.bg}; font-family: 'DM Sans', sans-serif; color: ${T.text}; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
    .ca-input { width: 100%; background: ${T.bg}; border: 1.5px solid ${T.border}; border-radius: 12px; padding: 14px 18px; font-size: 15px; font-family: 'DM Sans', sans-serif; color: ${T.text}; outline: none; transition: border-color 0.2s, box-shadow 0.2s; resize: none; }
    .ca-input::placeholder { color: ${T.textMuted}; }
    .ca-input:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.accentGlow}; }
    .ca-btn { display: inline-flex; align-items: center; gap: 8px; background: ${T.accent}; color: #fff; border: none; border-radius: 10px; padding: 13px 28px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; margin-top: 12px; letter-spacing: 0.2px; }
    .ca-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 20px ${T.accentGlow}; }
    .ca-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .ca-mode-btn { background: transparent; border: 1.5px solid ${T.border}; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; color: ${T.textSub}; }
    .ca-mode-btn.active { background: ${T.text}; color: #fff; border-color: ${T.text}; }
    .ca-mode-btn:hover:not(.active) { border-color: ${T.text}; color: ${T.text}; }
    .ca-summary { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 16px; padding: 20px 24px; margin-bottom: 28px; font-size: 15px; color: ${T.textSub}; line-height: 1.6; font-family: 'Lora', serif; font-style: italic; animation: slideUp 0.4s ease; }
    .ca-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; animation: slideUp 0.5s ease; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", padding: "48px 20px 80px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* HEADER */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: T.accent, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>🛒</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "'Lora', serif", color: T.text, letterSpacing: "-0.3px" }}>
                  Smart Shopper
                </div>
                <div style={{ fontSize: 13, color: T.textSub, marginTop: 2 }}>
                  Compare products, get an honest recommendation
                </div>
              </div>
            </div>
          </div>

          {/* INPUT CARD */}
          <div style={{
            background: T.surface,
            borderRadius: 22,
            padding: 32,
            marginBottom: 20,
            boxShadow: T.shadow,
          }}>
            {/* MODE TOGGLE */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <button
                className={`ca-mode-btn ${mode === "search" ? "active" : ""}`}
                onClick={() => setMode("search")}
              >
                🔍 Search products
              </button>
              <button
                className={`ca-mode-btn ${mode === "urls" ? "active" : ""}`}
                onClick={() => setMode("urls")}
              >
                🔗 Paste URLs
              </button>
            </div>

            {mode === "search" ? (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: T.textSub, display: "block", marginBottom: 8 }}>
                  What are you looking for?
                </label>
                <input
                  className="ca-input"
                  placeholder='e.g. "best 43 inch TV under 30k" or "noise cancelling headphones for gym"'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && handleAnalyze()}
                />
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>
                  We'll find the top 3 products on Amazon.in and compare them for you
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: T.textSub, display: "block", marginBottom: 8 }}>
                  Amazon product URLs — one per line (2–4 products)
                </label>
                <textarea
                  className="ca-input"
                  rows={4}
                  placeholder={"https://www.amazon.in/dp/XXXXXXXXXX\nhttps://www.amazon.in/dp/YYYYYYYYYY\nhttps://www.amazon.in/dp/ZZZZZZZZZZ"}
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                />
              </div>
            )}

            <button className="ca-btn" onClick={handleAnalyze} disabled={loading || (!query && !urlInput)}>
              {loading
                ? <><span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.7)", animation: "pulse 1s infinite", display: "inline-block" }} /> Comparing...</>
                : "→ Find Best Product"
              }
            </button>
          </div>

          {/* TERMINAL */}
          <TerminalLog logs={logs} loading={loading} done={done} />

          {/* ERROR */}
          {error && (
            <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 12, padding: "14px 18px", color: "#C0392B", fontSize: 14, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
              ⚠ {error}
            </div>
          )}

          {/* RESULTS */}
          {result && (
            <div style={{ animation: "slideUp 0.4s ease" }}>

              {/* WINNER */}
              <WinnerBadge
                insights={result.insights}
                products={result.products}
              />

              {/* SUMMARY */}
              {result.insights?.summary && (
                <div className="ca-summary">
                  "{result.insights.summary}"
                </div>
              )}

              {/* PRODUCT CARDS */}
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: T.textSub, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
                All Products Compared
              </div>
              <div className="ca-grid">
                {result.products.map((product, i) => {
                  const insightProduct = result.insights?.products?.find(p => p.asin === product.asin);
                  const isWinner = result.insights?.winner?.asin === product.asin;
                  return (
                    <ProductCard
                      key={product.asin}
                      product={product}
                      insightProduct={insightProduct}
                      index={i}
                      isWinner={isWinner}
                    />
                  );
                })}
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}