import axios from "axios";

export const analyzeProduct = async (payload) => {
  const res = await axios.post("http://127.0.0.1:8000/analyze", payload);
  return res.data;
};