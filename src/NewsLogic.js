// src/NewsLogic.js
import { writable } from "svelte/store";
import { fetchArticlesFromAPI } from "./NewsAPI";

function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key, defaultValue = []) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Stav aplikace
export const articles = writable([]);
export const favorites = writable(loadFromLocalStorage("favorites"));
export const recentArticles = writable(loadFromLocalStorage("recentArticles")); 
export const recentSearches = writable(loadFromLocalStorage("recentSearches"));
export const loading = writable(false);
export const error = writable(null);

// Funkce pro přidání/odebrání z oblíbených
export function toggleFavorite(article) {
  favorites.update((current) => {
    const exists = current.find((fav) => fav.url === article.url);
    const updatedFavorites = exists
      ? current.filter((fav) => fav.url !== article.url)
      : [article, ...current];

    saveToLocalStorage("favorites", updatedFavorites); // Uložení do Local Storage
    return updatedFavorites;
  });
}

export function toggleRecent(article) {
  recentArticles.update((current) => {
    const exists = current.find((fav) => fav.url === article.url);
    const updatedRecent = exists
      ? [article, ...current.filter((fav) => fav.url !== article.url)].slice(0, 10)
      : [article, ...current].slice(0, 10);

    saveToLocalStorage("recentArticles", updatedRecent); // Uložení do Local Storage
    return updatedRecent;
  });
}

export function addRecentSearch(keyword, date) {
  recentSearches.update((current) => {
    const exists = current.find(
      (search) => search.keyword === keyword && search.date === date
    );

    if (!exists) {
      const updatedSearches = [{ keyword, date }, ...current].slice(0, 5);
      saveToLocalStorage("recentSearches", updatedSearches); // Uložení do Local Storage
      return updatedSearches;
    }

    return current;
  });
}


// Funkce pro vyhledání článků
export async function searchArticles(keyword, date) {
  loading.set(true);
  error.set(null);

  try {
    const data = await fetchArticlesFromAPI(keyword, date);
    articles.set(data.articles || []);
    addRecentSearch(keyword, date);
  } catch (err) {
    error.set(err.message);
  } finally {
    loading.set(false);
  }
}
