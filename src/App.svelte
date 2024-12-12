<!-- src/App.svelte -->
<script>
  import NewsLayout from "./NewsLayout.svelte";
  import {
    articles,
    favorites,
    recentArticles,
    recentSearches,
    loading,
    error,
    toggleFavorite,
    toggleRecent,
    searchArticles,
    addRecentSearch,
  } from "./NewsLogic";
  import { onMount } from "svelte";

  let localKeyword = "";
  let localDate = "";
  let currentScreen = "home";

  // Inicializace dat při načtení stránky
  onMount(() => {
    searchArticles("bitcoin", ""); // Výchozí data
  });

  function handleSearch() {
    searchArticles(localKeyword, localDate);
    recentSearches.update((current) => {
      // Kontrola, jestli hledání už existuje
      const exists = current.find(
        (search) => search.keyword === localKeyword && search.date === localDate
      );

      if (!exists) {
        addRecentSearch(localKeyword, localDate);
        return [{ keyword: localKeyword, date: localDate }, ...current].slice(
          0,
          5
        ); // Max 5 položek
      }

      return current;
    });
    currentScreen = "articles";
  }

  function searchFromRecent(keyword, date) {
    localKeyword = keyword; // Nastavíme lokální hodnoty
    localDate = date;
    searchArticles(keyword, date); // Spustíme vyhledávání
    currentScreen = "articles"; // Přepneme na zobrazení článků
  }

  function handleNavigate(screen) {
    currentScreen = screen;
  }
</script>

<!-- Horní menu -->
<nav class="navbar">
  <a
    href="javascript:void(0);"
    class:active={currentScreen === "home"}
    on:click={() => handleNavigate("home")}
  >
    <span class="icon">🏠</span> Home
  </a>
  <a href="javascript:void(0);" class="nav-link">
    <span class="icon">👍</span> Recommended
  </a>
  <a
    href="javascript:void(0);"
    class:active={currentScreen === "favorites"}
    on:click={() => handleNavigate("favorites")}
  >
    <span class="icon">🔖</span> Saved
  </a>
  <a
    href="javascript:void(0);"
    class:active={currentScreen === "recent"}
    on:click={() => handleNavigate("recent")}
  >
    <span class="icon">⏰</span> Recent
  </a>
</nav>

<!-- Obsah stránek -->
<div class="content">
  {#if currentScreen === "home"}
    <section class="home">
      <div class="form-container">
        <h1>Fresh News</h1>

        <label for="keyword">Search by keyword:</label>
        <div class="input-container">
          <span class="icon">🔍</span>
          <input
            id="keyword"
            type="text"
            placeholder="Keyword:"
            bind:value={localKeyword}
          />
        </div>

        <label for="date">Select date:</label>
        <div class="input-container">
          <input id="date" type="date" bind:value={localDate} />
        </div>

        <div class="buttons">
          <button class="search-button" on:click={handleSearch}>Search</button>
          <button
            class="clear-button"
            on:click={() => {
              localKeyword = "";
              localDate = "";
            }}
          >
            Clear filters
          </button>
        </div>
      </div>
    </section>
  {:else if currentScreen === "articles"}
    <section class="articles">
      <!-- Vyhledávací formulář -->

      <div class="search-form">
        <!-- Klíčové slovo -->
        <div class="input-container">
          <label for="keyword">Search by keyword:</label>
          <div class="input-with-icon">
            <span class="icon">🔍</span>
            <input
              id="keyword"
              type="text"
              placeholder="Keyword:"
              bind:value={localKeyword}
            />
          </div>
        </div>

        <!-- Datum -->
        <div class="input-container">
          <label for="date">Select date:</label>
          <input id="date" type="date" bind:value={localDate} />
        </div>

        <!-- Tlačítka -->
        <div class="button-container">
          <button class="search-button" on:click={handleSearch}>Search</button>
          <button
            class="clear-button"
            on:click={() => {
              localKeyword = "";
              localDate = "";
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <h1>Articles</h1>

      <!-- Zobrazení článků -->
      {#if $loading}
        <p>Loading...</p>
      {:else if $error}
        <p style="color: red">Error: {$error}</p>
      {:else}
        <NewsLayout
          articles={$articles}
          onFavoriteClick={toggleFavorite}
          onReadMore={toggleRecent}
        />
      {/if}
    </section>
  {:else if currentScreen === "recent"}
    <section class="recent">
      <h1>Recent Search</h1>
      {#if recentSearches.length === 0}
        <p>No searches performed recently.</p>
      {:else}
        <div class="recent-searches">
          {#each $recentSearches as search}
            <button
              class="search-card"
              on:click={() => searchFromRecent(search.keyword, search.date)}
            >
              <p><strong>Keyword:</strong> {search.keyword || "None"}</p>
              <p><strong>Date:</strong> {search.date || "None"}</p>
            </button>
          {/each}
        </div>
      {/if}

      <h1>Recent Articles</h1>
      {#if recentArticles.length === 0}
        <p>No articles read recently.</p>
      {:else}
        <NewsLayout
          articles={$recentArticles}
          onFavoriteClick={toggleFavorite}
          onReadMore={toggleRecent}
        />
      {/if}
    </section>
  {:else if currentScreen === "favorites"}
    <section class="favorites">
      <h1>Saved Articles</h1>
      {#if $favorites.length === 0}
        <p>No saved articles yet.</p>
      {:else}
        <NewsLayout
          articles={$favorites}
          onFavoriteClick={toggleFavorite}
          onReadMore={toggleRecent}
        />
      {/if}
    </section>
  {/if}
</div>

<style>
  .content {
    margin-top: 60px; /* Posune obsah dolů, aby nebyl skrytý pod navbar */
  }
  .home {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #ddd; /* Světle šedé pozadí */
    margin: 0;
  }

  /* Kontejner formuláře */
  .form-container {
    background-color: #fff;
    padding: 30px 40px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Jemný stín */
    text-align: center;
    width: 100%;
    max-width: 400px;
  }

  .form-container h1 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #333;
  }

  label {
    display: block;
    text-align: left;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
  }

  /* Vstupní pole */
  .input-container {
    position: relative;
    margin-bottom: 15px;
  }

  .input-container input {
    width: 100%;
    padding: 10px 12px;
    padding-left: 35px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
  }

  .input-container .icon {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    color: #888;
  }

  .search-form {
    display: flex;
    align-items: center;
    gap: 15px; /* Mezery mezi prvky */
    background-color: #f4f4f4; /* Světle šedé pozadí */
    padding: 10px 15px;
    border-radius: 8px;
    border: 1px solid #ddd;
  }

  /* Tlačítka */
  .buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
  }

  .button-container {
    display: flex;
    gap: 10px; /* Mezery mezi tlačítky */
    margin-top: 15px;
  }

  .recent-searches {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
  }

  .search-card {
    background-color: #f9f9f9;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    width: 150px;
  }

  .search-card p {
    margin: 0;
    font-size: 0.9rem;
    color: #333;
  }

  .search-card strong {
    color: #000;
  }

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    background-color: #28a745;
    color: white;
    font-weight: 600;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #218838; /* Tmavší zelená při najetí myší */
  }

  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    gap: 20px;
    background-color: #3a3a3a;
    padding: 10px;
  }

  .navbar a {
    text-decoration: none;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  /* Aktivní stránka */
  .navbar a.active {
    background-color: #28a745; /* Zelená barva */
    color: white;
    font-weight: bold;
  }

  /* Hover efekt */
  .navbar a:hover {
    background-color: #ddd;
    color: black;
  }

  section {
    padding: 20px;
  }

  .buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
  }

  input {
    margin-bottom: 10px;
    display: block;
    padding: 5px;
  }

  .article {
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;
  }
</style>
