const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const streamAnalysis = async (payload, onLog, onResult) => {
  const response = await fetch(`${API_URL}/analyze-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    for (let line of chunk.split("\n")) {
      if (line.startsWith("data: ")) {
        const parsed = JSON.parse(line.replace("data: ", ""));
        if (parsed.log) onLog(parsed.log);
        if (parsed.result) onResult(parsed.result);
      }
    }
  }
};