// src/NewsAPI.js
const API_KEY = "e2d3b015ca494468a3e2c3fbca3f0a32";
const BASE_URL = "https://newsapi.org/v2/everything";

export async function fetchArticlesFromAPI(keyword = "news", date = "") {
  const url = `${BASE_URL}?q=${keyword}&from=${date}&apiKey=${API_KEY}`;
  const response = await fetch(url);

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.message || "Error fetching data");
  }

  return data;
}
