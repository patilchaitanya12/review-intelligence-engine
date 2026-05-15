import { useEffect } from "react";

function injectFonts() {
  if (document.getElementById("lp-fonts")) return;
  const l = document.createElement("link");
  l.id = "lp-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(l);
}

export default function LandingApp() {
  useEffect(() => { injectFonts(); }, []);

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #F7F5F0; font-family: 'DM Sans', sans-serif; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .lp-root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .lp-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fff;
      border: 1px solid #E8E3DA;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 500;
      color: #8C7E6E;
      letter-spacing: 0.3px;
      margin-bottom: 32px;
      animation: fadeIn 0.6s ease;
    }

    .lp-title {
      font-family: 'Lora', serif;
      font-size: clamp(36px, 6vw, 58px);
      font-weight: 600;
      color: #1A1612;
      text-align: center;
      letter-spacing: -1px;
      line-height: 1.15;
      margin-bottom: 16px;
      animation: fadeUp 0.6s ease 0.1s both;
    }

    .lp-title em {
      font-style: italic;
      color: #D4622A;
    }

    .lp-subtitle {
      font-size: 17px;
      color: #8C7E6E;
      text-align: center;
      line-height: 1.6;
      max-width: 440px;
      margin-bottom: 56px;
      font-weight: 400;
      animation: fadeUp 0.6s ease 0.2s both;
    }

    .lp-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      width: 100%;
      max-width: 640px;
      animation: fadeUp 0.6s ease 0.3s both;
    }

    @media (max-width: 560px) {
      .lp-cards { grid-template-columns: 1fr; }
    }

    .lp-card {
      background: #FFFFFF;
      border: 1.5px solid #E8E3DA;
      border-radius: 20px;
      padding: 32px 28px;
      cursor: pointer;
      transition: all 0.25s;
      text-align: left;
      position: relative;
      overflow: hidden;
    }

    .lp-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, transparent 60%, rgba(212,98,42,0.04));
      opacity: 0;
      transition: opacity 0.3s;
    }

    .lp-card:hover {
      border-color: #D4622A;
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(212,98,42,0.12), 0 2px 8px rgba(26,22,18,0.06);
    }

    .lp-card:hover::before { opacity: 1; }

    .lp-card:hover .lp-card-arrow {
      transform: translateX(4px);
      color: #D4622A;
    }

    .lp-card:hover .lp-card-icon {
      transform: scale(1.1);
    }

    .lp-card-icon {
      font-size: 36px;
      margin-bottom: 16px;
      display: block;
      transition: transform 0.2s;
      line-height: 1;
    }

    .lp-card-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.4px;
      text-transform: uppercase;
      color: #C4B8A8;
      margin-bottom: 8px;
    }

    .lp-card-title {
      font-family: 'Lora', serif;
      font-size: 20px;
      font-weight: 600;
      color: #1A1612;
      margin-bottom: 10px;
      line-height: 1.3;
    }

    .lp-card-desc {
      font-size: 13px;
      color: #8C7E6E;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .lp-card-arrow {
      font-size: 18px;
      color: #C4B8A8;
      transition: all 0.2s;
      display: inline-block;
    }

    .lp-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 20px;
    }

    .lp-tag {
      background: #F7F5F0;
      border: 1px solid #E8E3DA;
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 11px;
      color: #8C7E6E;
      font-weight: 500;
    }

    .lp-footer {
      margin-top: 48px;
      font-size: 12px;
      color: #C4B8A8;
      text-align: center;
      animation: fadeIn 0.6s ease 0.5s both;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="lp-root">

        {/* BADGE */}
        <div className="lp-badge">
          🧠 Review Intelligence Engine
        </div>

        {/* HEADLINE */}
        <h1 className="lp-title">
          What brings you<br />
          here <em>today?</em>
        </h1>

        <p className="lp-subtitle">
          We'll show you the right tools based on
          whether you're selling or shopping.
        </p>

        {/* CARDS */}
        <div className="lp-cards">

          {/* SELLER */}
          <div className="lp-card" onClick={() => window.location.href = "/seller"}>
            <span className="lp-card-icon">🏪</span>
            <div className="lp-card-label">For Sellers</div>
            <div className="lp-card-title">I sell products online</div>
            <div className="lp-card-desc">
              Analyze your listing vs competitors. Get insights to improve your product, marketing, and positioning.
            </div>
            <div className="lp-card-tags">
              <span className="lp-tag">Amazon</span>
              <span className="lp-tag">Flipkart</span>
              <span className="lp-tag">Alibaba</span>
            </div>
            <span className="lp-card-arrow">→</span>
          </div>

          {/* BUYER */}
          <div className="lp-card" onClick={() => window.location.href = "/compare"}>
            <span className="lp-card-icon">🛒</span>
            <div className="lp-card-label">For Shoppers</div>
            <div className="lp-card-title">I want to buy something</div>
            <div className="lp-card-desc">
              Compare products side by side. Get an honest recommendation on what to actually buy.
            </div>
            <div className="lp-card-tags">
              <span className="lp-tag">Search products</span>
              <span className="lp-tag">Paste URLs</span>
            </div>
            <span className="lp-card-arrow">→</span>
          </div>

        </div>

        <div className="lp-footer">
          Powered by real customer reviews · No sponsored results
        </div>

      </div>
    </>
  );
}