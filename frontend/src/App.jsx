import { useState } from "react";
import { analyzeProduct } from "./api";

export default function App() {
  const [mainUrl, setMainUrl] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const payload = {
      main_product: mainUrl,
      competitors: competitors.split("\n").filter(Boolean),
    };
    const res = await analyzeProduct(payload);
    setData(res);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", color: "#fff" }}>
      <h1>🧠 Review Intelligence</h1>

      <input
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
        placeholder="Main Product URL"
        value={mainUrl}
        onChange={(e) => setMainUrl(e.target.value)}
      />

      <textarea
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
        rows={3}
        placeholder="Competitor URLs"
        value={competitors}
        onChange={(e) => setCompetitors(e.target.value)}
      />

      <button onClick={handleAnalyze}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {data && (
        <div style={{ marginTop: 20 }}>
          <h2>Pros</h2>
          {data.main.pros.map((p, i) => <p key={i}>• {p}</p>)}

          <h2>Cons</h2>
          {data.main.cons.map((c, i) => <p key={i}>• {c}</p>)}

          <h2>Strengths</h2>
          {data.comparison.strengths.map((s, i) => <p key={i}>• {s}</p>)}

          <h2>Weaknesses</h2>
          {data.comparison.weaknesses.map((w, i) => <p key={i}>• {w}</p>)}

          <h2>Strategy</h2>
          <p><b>{data.comparison.positioning}</b></p>
          <p>{data.comparison.summary}</p>
        </div>
      )}
    </div>
  );
}