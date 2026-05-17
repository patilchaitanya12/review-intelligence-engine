import { useState, useEffect } from "react";

const DARK = {
  bg: "#080C14", surface: "#0D1420", border: "#1A2540",
  text: "#E2E8F5", textSub: "#6B7FA3", textMuted: "#3D4F72",
  accent: "#4C9EEB", accentGlow: "rgba(76,158,235,0.15)",
  accentSoft: "rgba(76,158,235,0.08)", tag: "#1A2540",
  pill: "rgba(76,158,235,0.12)", pillText: "#4C9EEB",
  shadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)",
};
const LIGHT = {
  bg: "#F0F4FA", surface: "#FFFFFF", border: "#DDE5F0",
  text: "#0F1A2E", textSub: "#5A6E96", textMuted: "#A0B0CC",
  accent: "#2B7FD4", accentGlow: "rgba(43,127,212,0.12)",
  accentSoft: "rgba(43,127,212,0.06)", tag: "#EEF2FA",
  pill: "rgba(43,127,212,0.10)", pillText: "#2B7FD4",
  shadow: "0 1px 3px rgba(15,26,46,0.06), 0 8px 32px rgba(15,26,46,0.08)",
};

function injectFonts() {
  if (document.getElementById("lp-fonts")) return;
  const l = document.createElement("link");
  l.id = "lp-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(l);
}

export default function LandingApp() {
  const [dark, setDark] = useState(true);
  const t = dark ? DARK : LIGHT;
  useEffect(() => { injectFonts(); }, []);

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${t.bg}; font-family: 'Sora', sans-serif; color: ${t.text}; transition: background 0.3s, color 0.3s; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }

    .lp-root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }

    /* HEADER BAR */
    .lp-topbar { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; z-index: 10; }
    .lp-logo { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: ${t.text}; letter-spacing: -0.2px; }
    .lp-logo-icon { width: 30px; height: 30px; border-radius: 8px; background: ${t.accent}; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 0 16px ${t.accentGlow}; }

    /* TOGGLE */
    .lp-toggle { display: flex; align-items: center; gap: 8px; background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 20px; padding: 6px 12px; cursor: pointer; user-select: none; transition: all 0.2s; }
    .lp-toggle:hover { border-color: ${t.accent}; }
    .lp-toggle-track { width: 32px; height: 18px; border-radius: 9px; background: ${dark ? t.accent : t.border}; position: relative; transition: background 0.3s; }
    .lp-toggle-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: ${dark ? "17px" : "3px"}; transition: left 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
    .lp-toggle-label { font-size: 12px; color: ${t.textSub}; font-weight: 500; }

    .lp-badge { display: inline-flex; align-items: center; gap: 6px; background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 500; color: ${t.textSub}; letter-spacing: 0.3px; margin-bottom: 32px; animation: fadeIn 0.6s ease; box-shadow: ${t.shadow}; }

    .lp-title { font-family: 'Sora', sans-serif; font-size: clamp(34px, 6vw, 54px); font-weight: 700; color: ${t.text}; text-align: center; letter-spacing: -1.5px; line-height: 1.15; margin-bottom: 16px; animation: fadeUp 0.6s ease 0.1s both; }
    .lp-title em { font-style: italic; color: ${t.accent}; font-weight: 600; }

    .lp-subtitle { font-size: 16px; color: ${t.textSub}; text-align: center; line-height: 1.6; max-width: 420px; margin-bottom: 52px; font-weight: 400; animation: fadeUp 0.6s ease 0.2s both; }

    .lp-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; max-width: 620px; animation: fadeUp 0.6s ease 0.3s both; }
    @media (max-width: 560px) { .lp-cards { grid-template-columns: 1fr; } }

    .lp-card { background: ${t.surface}; border: 1.5px solid ${t.border}; border-radius: 20px; padding: 30px 26px; cursor: pointer; transition: all 0.25s; text-align: left; position: relative; overflow: hidden; box-shadow: ${t.shadow}; }
    .lp-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 60%, ${t.accentSoft}); opacity: 0; transition: opacity 0.3s; }
    .lp-card:hover { border-color: ${t.accent}; transform: translateY(-3px); box-shadow: 0 8px 32px ${t.accentGlow}, 0 2px 8px rgba(0,0,0,0.1); }
    .lp-card:hover::after { opacity: 1; }
    .lp-card:hover .lp-arrow { transform: translateX(4px); color: ${t.accent}; }
    .lp-card:hover .lp-icon { transform: scale(1.1); }

    .lp-icon { font-size: 34px; margin-bottom: 14px; display: block; transition: transform 0.2s; line-height: 1; }
    .lp-card-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: ${t.textMuted}; margin-bottom: 7px; }
    .lp-card-title { font-size: 18px; font-weight: 700; color: ${t.text}; margin-bottom: 10px; line-height: 1.3; letter-spacing: -0.3px; }
    .lp-card-desc { font-size: 13px; color: ${t.textSub}; line-height: 1.6; margin-bottom: 18px; font-weight: 400; }
    .lp-arrow { font-size: 18px; color: ${t.textMuted}; transition: all 0.2s; display: inline-block; }

    .lp-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
    .lp-tag { background: ${t.tag}; border: 1px solid ${t.border}; border-radius: 20px; padding: 3px 10px; font-size: 11px; color: ${t.textSub}; font-weight: 500; }

    .lp-footer { margin-top: 44px; font-size: 12px; color: ${t.textMuted}; text-align: center; animation: fadeIn 0.6s ease 0.5s both; letter-spacing: 0.2px; }
  `;

  return (
    <>
      <style>{css}</style>

      {/* TOP BAR */}
      <div className="lp-topbar">
        <div className="lp-logo">
          <div className="lp-logo-icon">🧠</div>
          Review Intelligence
        </div>
        <div className="lp-toggle" onClick={() => setDark(!dark)}>
          <span className="lp-toggle-label">{dark ? "Dark" : "Light"}</span>
          <div className="lp-toggle-track"><div className="lp-toggle-thumb" /></div>
        </div>
      </div>

      <div className="lp-root">
        <div className="lp-badge">✦ Powered by real customer reviews</div>

        <h1 className="lp-title">
          What brings you<br />here <em>today?</em>
        </h1>
        <p className="lp-subtitle">
          Get the right tools — whether you're growing a business or making a smart purchase.
        </p>

        <div className="lp-cards">
          {/* SELLER */}
          <div className="lp-card" onClick={() => window.location.href = "/seller"}>
            <span className="lp-icon">🏪</span>
            <div className="lp-card-eyebrow">For Sellers</div>
            <div className="lp-card-title">I sell products online</div>
            <div className="lp-card-desc">Analyze your listing vs competitors. Get insights to improve your product and positioning.</div>
            <div className="lp-tags">
              <span className="lp-tag">Amazon</span>
              <span className="lp-tag">Flipkart</span>
              <span className="lp-tag">Alibaba</span>
            </div>
            <span className="lp-arrow">→</span>
          </div>

          {/* BUYER */}
          <div className="lp-card" onClick={() => window.location.href = "/compare"}>
            <span className="lp-icon">🛒</span>
            <div className="lp-card-eyebrow">For Shoppers</div>
            <div className="lp-card-title">I want to buy something</div>
            <div className="lp-card-desc">Compare products side by side. Get an honest recommendation on what to actually buy.</div>
            <div className="lp-tags">
              <span className="lp-tag">Search products</span>
              <span className="lp-tag">Paste URLs</span>
            </div>
            <span className="lp-arrow">→</span>
          </div>
        </div>

        <div className="lp-footer">No sponsored results · No affiliate links · Just honest analysis</div>
      </div>
    </>
  );
}