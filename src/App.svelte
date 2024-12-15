<!-- src/App.svelte -->
<script>
  import NewsLayout from "./NewsLayout.svelte";
  import {
    articles,
    favorites,
    savedGroups,
    recentArticles,
    recentSearches,
    quickSearches,
    loading,
    error,
    languages,
    addQuickSearch,
    removeQuickSearch,
    getLanguageName,
    toggleFavorite,
    getDateLimits,
    deleteGroup,
    renameGroup,
    toggleRecent,
    getRecommendedArticles,
    searchArticles,
    addRecentSearch,
  } from "./NewsLogic";
  import { onMount } from "svelte";

  let localKeyword = "";
  let localDate = "";
  let fromDate = ""; // Počáteční datum
  let toDate = "";
  let maxDate = ""; // Maximální datum (dnes)
  let minDate = ""; // Minimální datum (před 30 dny)
  let selectedLanguage = "en";
  let currentScreen = "home";
  let currentGroup = null; // Aktuální vybraná skupina
  let allGroups = $savedGroups;
  let filteredArticles = [];
  let newGroupName = "";
  let editedGroupName = "";
  let editingGroup = null;
  let isEditing = false;
  let editingIndex = null;
  let editedKeyword = "";
  let editedFromDate = "";
  let editedToDate = "";
  let editedLanguage = "";

  $: allGroups = $savedGroups;

  $: {
    if (currentGroup) {
      // Zobrazí články ve vybrané skupině
      filteredArticles = $savedGroups[currentGroup] || [];
    } else {
      // Zobrazí všechny články ze všech skupin
      filteredArticles = $favorites;
    }
  }

  function addNewGroup() {
    if (newGroupName.trim() && !$savedGroups[newGroupName]) {
      savedGroups.update((groups) => ({ ...groups, [newGroupName]: [] }));
      newGroupName = ""; // Vyčištění pole po vytvoření skupiny
    }
  }

  function handleGroupClick(groupName) {
    if (currentGroup === groupName) {
      currentGroup = null; // Odkliknutí skupiny
    } else {
      currentGroup = groupName; // Zakliknutí skupiny
    }
  }

  // Inicializace dat při načtení stránky
  onMount(() => {
    const { minDate: min, maxDate: max } = getDateLimits();
    minDate = min; // Nejnižší povolené datum (30 dní zpět)
    maxDate = max; // Nejvyšší povolené datum (dnes)
  });

  function handleFromDateInput(event) {
    const newValue = event.target.value;
    fromDate = newValue;

    if (toDate && toDate < fromDate) {
      toDate = fromDate; // Zajistí validní rozsah
    }
  }

  function handleToDateInput(event) {
    const newValue = event.target.value;
    toDate = newValue;

    if (toDate < fromDate) {
      toDate = fromDate; // Zajistí validní rozsah
    }
  }

  function openEditForm(index, keyword, fromDate, toDate, language) {
    isEditing = true;
    editingIndex = index;
    editedKeyword = keyword;
    editedFromDate = fromDate || "";
    editedToDate = toDate || "";
    editedLanguage = language || "en";
  }

  // Funkce pro uložení úpravy
  function saveQuickSearch(index) {
    if (editedKeyword.trim()) {
      quickSearches.update((searches) => {
        searches[index] = {
          keyword: editedKeyword,
          fromDate: editedFromDate,
          toDate: editedToDate,
          language: editedLanguage,
        };
        return searches;
      });
      cancelEditing();
    }
  }

  // Funkce pro smazání QuickSearch
  function deleteQuickSearch(index) {
    quickSearches.update((searches) => searches.filter((_, i) => i !== index));
  }

  function handleSearch() {
    searchArticles(localKeyword, fromDate, toDate, selectedLanguage);

    recentSearches.update((current) => {
      const exists = current.find(
        (search) =>
          search.keyword === localKeyword &&
          search.fromDate === fromDate &&
          search.toDate === toDate &&
          search.language === selectedLanguage
      );

      if (!exists) {
        addRecentSearch(localKeyword, fromDate, toDate, selectedLanguage);
        return [
          {
            keyword: localKeyword,
            fromDate,
            toDate,
            language: selectedLanguage,
          },
          ...current,
        ].slice(0, 5); // Max 5 položek
      }

      return current;
    });

    currentScreen = "articles";
  }

  function searchFromRecent({ keyword, fromDate, toDate, language }) {
    // Nastavíme lokální hodnoty
    localKeyword = keyword || "";
    fromDate = fromDate || "";
    toDate = toDate || "";
    selectedLanguage = language || "en";

    // Spustíme vyhledávání
    searchArticles(localKeyword, fromDate, toDate, selectedLanguage);

    // Přepneme na zobrazení článků
    currentScreen = "articles";
  }

  function handleNavigate(screen) {
    currentScreen = screen;
  }

  function startEditingGroup(group) {
    editingGroup = group;
    editedGroupName = group;
  }

  function handleRenameGroup(group) {
    if (editedGroupName.trim() && editedGroupName !== group) {
      renameGroup(group, editedGroupName);
    }
    editingGroup = null;
  }

  function goToRecommended() {
    currentScreen = "recommended";
    getRecommendedArticles();
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
  <a
    href="javascript:void(0);"
    class:active={currentScreen === "recommended"}
    on:click={() => goToRecommended()}
  >
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
        <h1 class="main-title">Fresh News</h1>

        <!-- Flexbox container pro filtry a tlačítka -->
        <div class="search-form">
          <!-- Klíčové slovo -->
          <div class="input-container keyword">
            <label for="keyword">Search by keyword:</label>
            <div class="input-with-icon">
              <span class="icon">🔍</span>
              <input
                id="keyword"
                type="text"
                placeholder="Enter keyword"
                bind:value={localKeyword}
                on:keydown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <!-- Datum -->
          <div class="input-container">
            <label for="fromDate">From:</label>
            <input
              id="fromDate"
              type="date"
              bind:value={fromDate}
              min={minDate}
              max={maxDate}
              on:input={handleFromDateInput}
              placeholder="dd.mm.rrrr"
            />
          </div>

          <div class="input-container">
            <label for="toDate">To:</label>
            <input
              id="toDate"
              type="date"
              bind:value={toDate}
              min={fromDate || minDate}
              max={maxDate}
              on:input={handleToDateInput}
              placeholder="dd.mm.rrrr"
            />
          </div>

          <div class="input-container">
            <label for="language">Language:</label>
            <select id="language" bind:value={selectedLanguage}>
              <option value="" disabled>Select language</option>
              {#each languages as lang}
                <option value={lang.code}>{lang.name}</option>
              {/each}
            </select>
          </div>

          <!-- Tlačítka -->
          <div class="button-container">
            <button
              class="clear-button"
              on:click={() => {
                localKeyword = "";
                fromDate = "";
                toDate = "";
              }}
            >
              Clear Filters
            </button>

            <button
              class="quick-save"
              on:click={() =>
                addQuickSearch(
                  localKeyword,
                  fromDate,
                  toDate,
                  selectedLanguage
                )}
            >
              Save as QuickSearch
            </button>
          </div>
        </div>

        <!-- Velké tlačítko Search pod filtry -->
        <div class="search-button-container">
          <button class="big-search-button" on:click={handleSearch}
            >Search</button
          >
        </div>

        <div class="quicksearch-container">
          <h2>Your Quick Searches</h2>
          <div class="quicksearch-tags">
            {#each $quickSearches as search, index}
              <div class="quicksearch-tag">
                <!-- Hlavní obsah -->
                <span
                  class="quicksearch-text"
                  on:click={() => searchFromRecent(search)}
                >
                  {search.keyword || "None"}
                </span>
                <!-- Ikony pro editaci a smazání -->
                <div class="quicksearch-icons-area">
                  <div class="quicksearch-icons">
                    <button
                      class="icon-button edit"
                      on:click={() =>
                        openEditForm(
                          index,
                          search.keyword,
                          search.fromDate,
                          search.toDate,
                          search.language
                        )}
                    >
                      <i class="fas fa-pen"></i>
                    </button>
                    <button
                      class="icon-button delete"
                      on:click={() => deleteQuickSearch(index)}
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      {#if isEditing}
        <div class="modal-overlay" on:click={() => closeEditForm()}>
          <div class="modal-content" on:click|stopPropagation>
            <h3>Edit QuickSearch</h3>
            <label>Keyword:</label>
            <input type="text" bind:value={editedKeyword} />

            <label>From Date:</label>
            <input type="date" bind:value={editedFromDate} />

            <label>To Date:</label>
            <input type="date" bind:value={editedToDate} />

            <label>Language:</label>
            <select bind:value={editedLanguage}>
              <option value="" disabled>Select language</option>
              {#each languages as lang}
                <option value={lang.code}>{lang.name}</option>
              {/each}
            </select>

            <div class="modal-buttons">
              <button class="save-button" on:click={() => saveQuickSearch()}>
                Save
              </button>
              <button class="cancel-button" on:click={() => closeEditForm()}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      {/if}
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
              on:keydown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <!-- Datum -->
        <div class="input-container">
          <label for="fromDate">From:</label>
          <input
            id="fromDate"
            type="date"
            bind:value={fromDate}
            min={minDate}
            max={maxDate}
            on:input={handleFromDateInput}
            placeholder="dd.mm.rrrr"
          />
        </div>

        <div class="input-container">
          <label for="toDate">To:</label>
          <input
            id="toDate"
            type="date"
            bind:value={toDate}
            min={fromDate || minDate}
            max={maxDate}
            on:input={handleToDateInput}
            placeholder="dd.mm.rrrr"
          />
        </div>

        <div class="input-container">
          <label for="language">Language:</label>
          <select id="language" bind:value={selectedLanguage}>
            <option value="" disabled>Select language</option>
            {#each languages as lang}
              <option value={lang.code}>{lang.name}</option>
            {/each}
          </select>
        </div>

        <!-- Tlačítka -->
        <div class="button-container">
          <button class="search-button" on:click={handleSearch}>Search</button>
          <button
            class="clear-button"
            on:click={() => {
              localKeyword = "";
              fromDate = "";
              toDate = "";
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
  {:else if currentScreen === "recommended"}
    <section class="recommended">
      <h1>Recommended Articles:</h1>
      <NewsLayout
        articles={$articles}
        onFavoriteClick={toggleFavorite}
        onReadMore={toggleRecent}
      />
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
              on:click={() => searchFromRecent(search)}
            >
              <p><strong>Keyword:</strong> {search.keyword || "None"}</p>
              <p><strong>From:</strong> {search.fromDate || "None"}</p>
              <p><strong>To:</strong> {search.toDate || "None"}</p>
              <p>
                <strong>Language:</strong>
                {getLanguageName(search.language) || "English"}
              </p>
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
      <h2>Groups:</h2>
      <div class="groups-container">
        <!-- Zobrazení všech skupin -->
        {#each Object.keys($savedGroups) as group}
          <button
            class="group-card {currentGroup === group ? 'active' : ''}"
            on:click={() => handleGroupClick(group)}
          >
            {#if editingGroup === group}
              <input
                type="text"
                bind:value={editedGroupName}
                placeholder="Edit group name"
                on:click|stopPropagation
                on:keydown={(e) => {
                  if (e.key === "Enter") handleRenameGroup(group);
                }}
              />
              <button
                class="icon-button save"
                on:click|stopPropagation={() => handleRenameGroup(group)}
              >
                <i class="fas fa-check"></i>
              </button>
              <button
                class="icon-button cancel"
                on:click|stopPropagation={() => (editingGroup = null)}
              >
                <i class="fas fa-times"></i>
              </button>
            {:else}
              <!-- Zobrazení názvu skupiny -->
              <h2 class="group-title">{group}</h2>
              <p class="article-count">
                {($savedGroups[group] || []).length} articles
              </p>
              <div class="group-actions">
                <button
                  class="icon-button edit"
                  on:click|stopPropagation={() => startEditingGroup(group)}
                >
                  <i class="fas fa-pen"></i>
                </button>
                <button
                  class="icon-button delete"
                  on:click|stopPropagation={() => deleteGroup(group)}
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            {/if}
          </button>
        {/each}

        <button class="group-card" on:click={() => (currentGroup = null)}>
          <h2>Show All</h2>
        </button>

        <!-- Tlačítko pro vytvoření nové skupiny -->
        <div class="group-card create-group">
          <input
            type="text"
            placeholder="Group name"
            bind:value={newGroupName}
            on:keydown={(e) => e.key === "Enter" && addNewGroup()}
          />
          <button on:click={addNewGroup} class="add-button">+</button>
        </div>
      </div>

      <div class="articles">
        {#if filteredArticles.length === 0}
          <h2>{currentGroup} articles:</h2>
          <p>No articles in this group.</p>
        {:else}
          {#if currentGroup === null}
            <h2>All saved articles:</h2>
          {:else}
            <h2>{currentGroup} articles:</h2>
          {/if}
          <NewsLayout
            articles={filteredArticles}
            onFavoriteClick={toggleFavorite}
            onReadMore={toggleRecent}
          />
        {/if}
      </div>
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
    height: 83vh;
    background-color: #ddd; /* Světle šedé pozadí */
    margin: 0;
  }

  .form-container {
    background-color: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .main-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }

  /* Každý filtr */
  .input-container {
    flex: 1;
    min-width: 150px;
  }

  .input-container input,
  .input-container select {
    width: 100%;
  }

  /* Tlačítka */

  .clear-button,
  .quick-save {
    padding: 10px 15px;
    font-size: 0.9rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .clear-button {
    background-color: #3a3a3a;
    color: white;
  }

  .clear-button:hover {
    background-color: #218838;
  }

  .quick-save {
    background-color: #3a3a3a;
    color: white;
  }

  .quick-save:hover {
    background-color: #218838;
  }

  /* Velké tlačítko Search */
  .search-button-container {
    margin-top: 20px;
    text-align: center;
  }

  .big-search-button {
    width: 70%;
    padding: 15px 0;
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
    background-color: #28a745;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .big-search-button:hover {
    background-color: #218838;
  }

  .quicksearch-container {
    margin-top: 30px;
    text-align: center;
  }

  .quicksearch-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .quicksearch-tag {
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    background-color: #3a3a3a;
    padding: 8px 12px;
    padding-right: 100px;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    border-radius: 20px;
    border: 1px solid #ccc;
    cursor: pointer;
    transition: background-color 0.3s ease;
    overflow: hidden;
  }

  .quicksearch-icons-area {
    background-color: #e0e4e8; /* Barva pozadí rezervovaného místa */
    width: 100px; /* Šířka rezervovaného místa */
    border-radius: 20px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
  }

  .quicksearch-tag:hover {
    background-color: #218838;
  }

  /* Text QuickSearch */
  .quicksearch-text {
    flex: 1; /* Zajistí, že text zabere dostupný prostor */
    text-align: left;
    padding-right: 10px;
    color: white;
    z-index: 1; /* Text zůstane nad ikonami */
  }

  /* Ikony pro editaci a smazání QuickSearch */

  .quicksearch-icons {
    position: absolute;
    margin-top: 5px;
    display: flex;
    opacity: 0; /* Skryté ve výchozím stavu */
    transition: opacity 0.3s ease;
    z-index: 2;
  }

  .quicksearch-tag:hover .quicksearch-icons {
    opacity: 1;
  }

  /* Specifické styly ikon QuickSearch */
  .quicksearch-icons .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem; /* Menší velikost ikon */
    color: #555;
    transition: color 0.2s ease;
  }

  .quicksearch-icons .icon-button.edit:hover {
    color: #ffc107; /* Žlutá barva pro editaci */
  }

  .quicksearch-icons .icon-button.delete:hover {
    color: #dc3545; /* Červená barva pro mazání */
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

  .input-container select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
  }

  .input-container.keyword {
    flex: 2; /* Zvětší tento input na dvojnásobek */
    min-width: 300px; /* Zajistí minimální šířku */
  }

  .input-container .icon {
    position: absolute;
    top: 60%;
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

  h1 {
    margin-bottom: 20px;
  }

  .groups-container {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .group-card {
    width: 150px;
    height: 150px;
    background-color: #f9f9f9;
    color: #000; /* Černý text */
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition:
      background-color 0.2s,
      transform 0.2s;
    padding: 10px;
    gap: 5px; /* Menší mezera mezi prvky */
    overflow: visible;
  }

  .group-card i {
    font-family: "Font Awesome 5 Free";
    font-weight: 900; /* Pro solid ikony */
    font-size: 1rem;
    color: #333;
  }

  .group-card.active {
    background-color: #28a745;
    color: white;
    font-weight: bold;
  }

  .group-card h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .group-card p {
    margin: 0; /* Zrušíme výchozí margin pro odstavce */
    font-size: 0.9rem;
    line-height: 1.2;
  }

  .article-count {
    font-size: 1.2rem;
    font-weight: bold;
    color: #555;
  }

  /* Vytvoření nové skupiny */
  .create-group {
    width: 130px; /* Stejná šířka jako ostatní karty */
    height: 130px; /* Stejná výška jako ostatní karty */
    background-color: #28a745;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition:
      background-color 0.2s,
      transform 0.2s;
  }

  .create-group:hover {
    background-color: #218838;
    transform: translateY(-5px);
  }

  .create-group input {
    width: 80%; /* Pro lepší zarovnání */
    padding: 5px;
    border: none;
    border-radius: 4px;
    text-align: center;
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .create-group .add-button {
    width: 40px;
    height: 40px;
    background-color: #1e7e34;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s;
  }

  .create-group .add-button:hover {
    background-color: #155724;
  }

  .group-actions {
    display: flex;
    gap: 5px;
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem; /* Velikost ikony */
    color: #333; /* Výchozí barva ikon */
    transition: color 0.3s ease; /* Plynulý efekt barvy */
  }

  /* Změna barvy ikony při hover */
  .icon-button:hover,
  .icon-button:hover i {
    color: #007bff; /* Modrá barva jako výchozí */
  }

  /* Specifické styly pro editaci */
  .icon-button.edit:hover i {
    color: #ffc107; /* Žlutá pro editaci */
  }

  /* Specifické styly pro mazání */
  .icon-button.delete:hover i {
    color: #dc3545; /* Červená pro smazání */
  }

  /* Styl samotných ikon */
  .icon-button i {
    transition: color 0.3s ease;
  }

  input {
    width: 100%;
    padding: 5px;
    font-size: 0.9rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
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
</style>
