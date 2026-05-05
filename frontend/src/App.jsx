import { useState } from "react";

export default function App() {
  const [mainUrl, setMainUrl] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [dark, setDark] = useState(true);

  const formatItem = (item) => {
    if (typeof item === "string") return item;
    if (typeof item === "object")
      return item.description || item.text || JSON.stringify(item);
    return "";
  };

  const handleAnalyze = async () => {
    setLogs([]);
    setData(null);
    setLoading(true);

    const payload = {
      main_product: mainUrl,
      competitors: competitors.split("\n").filter(Boolean),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (let line of lines) {
          if (line.startsWith("data: ")) {
            const parsed = JSON.parse(line.replace("data: ", ""));

            if (parsed.log) {
              setLogs((prev) => [...prev, parsed.log]);
            }

            if (parsed.result) {
              setData(parsed.result);
              setLoading(false);
            }

            if (parsed.error) {
              setLogs((prev) => [...prev, "❌ Error: " + parsed.error]);
              setLoading(false);
            }
          }
        }
      }
    } catch (err) {
      setLogs((prev) => [...prev, "❌ Failed to connect"]);
      setLoading(false);
    }
  };

  const card = {
    background: dark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.03)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 16,
    flex: 1,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    transition: "0.3s ease",
  };

  return (
    <div
      style={{
        background: dark
          ? "radial-gradient(circle at top, #0f172a, #020617)"
          : "#f9fafb",
        color: dark ? "#fff" : "#000",
        minHeight: "100vh",
        padding: 40,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        {/* HEADER */}
        <h1 style={{ fontSize: 34, marginBottom: 5 }}>
          🧠 Review Intelligence
        </h1>
        <p style={{ opacity: 0.6, marginBottom: 20 }}>
          Turn raw product reviews into actionable insights
        </p>

        <button
          onClick={() => setDark(!dark)}
          style={{
            marginBottom: 20,
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          {dark ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* INPUT */}
        <div style={{ ...card, marginBottom: 20 }}>
          <input
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 10,
              borderRadius: 8,
              border: "none",
            }}
            placeholder="Paste Amazon product URL..."
            value={mainUrl}
            onChange={(e) => setMainUrl(e.target.value)}
          />

          <textarea
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "none",
            }}
            rows={3}
            placeholder="Competitor URLs (one per line)"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
          />

          <button
            onClick={handleAnalyze}
            style={{
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {loading ? "Analyzing..." : "🚀 Analyze"}
          </button>
        </div>

        {/* LOGS */}
        {loading && (
          <div
            style={{
              ...card,
              maxHeight: 160,
              overflowY: "auto",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {logs.map((log, i) => (
              <div key={i} style={{ opacity: 0.8 }}>
                {log}
              </div>
            ))}
          </div>
        )}

        {/* RESULTS */}
        {data && (
          <>
            <h2 style={{ marginTop: 20 }}>📊 Insights</h2>

            <div style={{ display: "flex", gap: 20 }}>
              <div style={card}>
                <h3>✅ Pros</h3>
                {data.main.pros.map((p, i) => (
                  <p key={i}>• {formatItem(p)}</p>
                ))}
              </div>

              <div style={card}>
                <h3>⚠️ Cons</h3>
                {data.main.cons.map((c, i) => (
                  <p key={i}>• {formatItem(c)}</p>
                ))}
              </div>
            </div>

            <h2 style={{ marginTop: 30 }}>🆚 Comparison</h2>

            <div style={{ display: "flex", gap: 20 }}>
              <div style={card}>
                <h4>💪 Strengths</h4>
                {data.comparison.strengths.map((s, i) => (
                  <p key={i}>• {formatItem(s)}</p>
                ))}
              </div>

              <div style={card}>
                <h4>❌ Weaknesses</h4>
                {data.comparison.weaknesses.map((w, i) => (
                  <p key={i}>• {formatItem(w)}</p>
                ))}
              </div>
            </div>

            <div style={{ ...card, marginTop: 20 }}>
              <h3>🧠 Strategy</h3>

              <p>
                <b>📌 Positioning:</b><br />
                {data.comparison.positioning}
              </p>

              <p>
                <b>📝 Summary:</b><br />
                {data.comparison.summary}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}