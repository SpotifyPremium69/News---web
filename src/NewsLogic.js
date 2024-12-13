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
export const favorites = writable(loadFromLocalStorage("favorites", []));
export const savedGroups = writable(loadFromLocalStorage("savedGroups", {}));
export const recentArticles = writable(loadFromLocalStorage("recentArticles")); 
export const recentSearches = writable(loadFromLocalStorage("recentSearches"));
export const loading = writable(false);
export const error = writable(null);

savedGroups.subscribe((groups) => {
  localStorage.setItem("savedGroups", JSON.stringify(groups));
});


function isValidArticle(article) {
  return (
    article.title &&
    article.title !== "[Removed]" &&
    article.description &&
    article.url &&
    article.urlToImage
  );
}

export function getDateLimits() {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);

  // Vrátí formátované hodnoty ve formátu yyyy-mm-dd
  return {
    maxDate: today.toISOString().split("T")[0],
    minDate: lastMonth.toISOString().split("T")[0],
  };
}

// Funkce pro přidání/odebrání z oblíbených
export function toggleFavorite(article) {
  favorites.update((current) => {
    const exists = current.some((fav) => fav.url === article.url)
    const updatedFavorites = exists
      ? current.filter((fav) => fav.url !== article.url)
      : [article, ...current];

    saveToLocalStorage("favorites", updatedFavorites); // Uložení do Local Storage
    return updatedFavorites;
  });
}

export function toggleArticleInGroup(article, groupName) {
  savedGroups.update((groups) => {
    const group = groups[groupName] || [];
    const exists = group.some((item) => item.url === article.url);

    // Přidáme/odebereme článek
    const updatedGroup = exists
      ? group.filter((item) => item.url !== article.url)
      : [...group, article];

    // Aktualizujeme skupinu
    const updatedGroups = { ...groups, [groupName]: updatedGroup };

    saveToLocalStorage("savedGroups", updatedGroups); // Uloží do Local Storage
    return updatedGroups;
  });
}

export function addArticleToGroup(groupName, article) {
  savedGroups.update((groups) => {
    const groupArticles = groups[groupName] || [];
    if (!groupArticles.some((a) => a.url === article.url)) {
      // Přidáme článek do skupiny, pokud tam ještě není
      return { ...groups, [groupName]: [...groupArticles, article] };
    }
    return groups; // Pokud už článek existuje, nic neměníme
  });
}

export function removeArticleFromGroup(groupName, article) {
  savedGroups.update((groups) => {
    if (groups[groupName]) {
      const updatedGroup = groups[groupName].filter(
        (a) => a.url !== article.url
      );
      return { ...groups, [groupName]: updatedGroup };
    }
    return groups;
  });
}

export function deleteGroup(groupName) {
  savedGroups.update((groups) => {
    const updatedGroups = { ...groups };
    delete updatedGroups[groupName]; // Smaže skupinu podle jména
    return updatedGroups;
  });
}

export function renameGroup(oldName, newName) {
  if (!newName.trim()) return; // Prázdný název ignorujeme

  savedGroups.update((groups) => {
    const updatedGroups = { ...groups };

    if (updatedGroups[oldName]) {
      updatedGroups[newName] = updatedGroups[oldName]; // Přesun článků do nové skupiny
      delete updatedGroups[oldName]; // Smazání staré skupiny
    }
    return updatedGroups;
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

export async function getRecommendedArticles() {
  let keywords = [];

  // Přidáme klíčová slova z recentSearches
  recentSearches.subscribe((searches) => {
    searches.forEach((search) => {
      if (search.keyword) {
        keywords.push(search.keyword);
      }
    });
  });

  // Přidáme klíčová slova z uložených článků
  favorites.subscribe((savedArticles) => {
    savedArticles.forEach((article) => {
      if (article.title) {
        keywords.push(...article.title.split(" ").slice(0, 3));
      }
    });
  });

  if (keywords.length === 0) {
    articles.set([]);
    return;
  }

  const query = Array.from(new Set(keywords)).join(" OR ");

  try {
    const data = await fetchArticlesFromAPI(query, "");

    let savedUrls = [];
    favorites.subscribe((saved) => {
      savedUrls = saved.map((article) => article.url);
    });

    // Filtrování duplicitních a nevalidních článků
    const filteredArticles = data.articles.filter(
      (article) =>
        !savedUrls.includes(article.url) && isValidArticle(article)
    );

    articles.set(filteredArticles || []);
  } catch (err) {
    console.error("Error fetching recommended articles:", err);
    articles.set([]);
  }
}


export async function searchArticles(keyword, date) {
  loading.set(true);
  error.set(null);

  try {
    const data = await fetchArticlesFromAPI(keyword, date);
    const validArticles = data.articles.filter(isValidArticle);
    articles.set(validArticles || []);
  } catch (err) {
    error.set(err.message);
  } finally {
    loading.set(false);
  }
}
