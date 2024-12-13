<!-- src/NewsLayout.svelte -->
<script>
  export let articles = [];
  export let onFavoriteClick = () => {};
  export let onReadMore = () => {};

  import {
    favorites,
    savedGroups,
    addArticleToGroup,
    removeArticleFromGroup,
  } from "./NewsLogic";

  let creatingNewGroup = {}; // Stav pro zobrazení pole pro nový group per článek
  let newGroupName = {};
  let selectedGroup = {};

  function handleAddToGroup(groupName, article) {
    if (groupName === "new") {
      // Inicializace stavu pro konkrétní článek
      creatingNewGroup[article.url] = true;
      if (!newGroupName[article.url]) {
        newGroupName[article.url] = "";
      }
    } else if (groupName) {
      addArticleToGroup(groupName, article); // Přidá článek do existující skupiny
    }
    selectedGroup[article.url] = "";
  }

  function createNewGroup(article) {
    if (newGroupName[article.url]?.trim()) {
      // Vytvoří novou skupinu a přidá článek
      savedGroups.update((groups) => {
        if (!groups[newGroupName[article.url]]) {
          groups[newGroupName[article.url]] = [];
        }
        if (
          !groups[newGroupName[article.url]].some((a) => a.url === article.url)
        ) {
          groups[newGroupName[article.url]].push(article);
        }
        return { ...groups };
      });

      // Reset stavu pro tento článek
      newGroupName[article.url] = "";
      creatingNewGroup[article.url] = false;
      selectedGroup[article.url] = "";
    }
  }
</script>

{#if articles.length === 0}
  <p>No articles available.</p>
{:else}
  <div class="articles-container">
    {#each articles as article}
      <div class="article-card">
        <!-- Textová část -->
        <div class="article-content">
          {#if article.author}
            <p class="author"><strong>Author:</strong> {article.author}</p>
          {/if}
          <h2 class="title">{article.title}</h2>
          <p class="description">{article.description}</p>
          {#if article.publishedAt}
            <p class="time"><strong>Time:</strong> {article.publishedAt}</p>
          {/if}
          <div class="actions">
            <a
              href={article.url}
              target="_blank"
              class="read-more"
              on:click={() => onReadMore(article)}>Read more</a
            >
            <button
              class="save-button"
              on:click={() => onFavoriteClick(article)}
              aria-label="Toggle Favorite"
            >
              {#if $favorites.some((fav) => fav.url === article.url)}
                <!-- Vyplněná ikona záložky -->
                <i class="fas fa-bookmark saved"></i>
              {:else}
                <!-- Prázdná ikona záložky -->
                <i class="far fa-bookmark"></i>
              {/if}
            </button>
            {#if $favorites.some((fav) => fav.url === article.url)}
              <label>
                Add to group:
                <select
                  bind:value={selectedGroup[article.url]}
                  on:change={(e) => handleAddToGroup(e.target.value, article)}
                >
                  <option value="" disabled selected>Select group</option>
                  {#each Object.keys($savedGroups) as group}
                    <option value={group}>{group}</option>
                  {/each}
                  <option value="new">Create new group</option>
                </select>
              </label>
              {#if creatingNewGroup[article.url]}
                <div class="new-group-input">
                  <input
                    type="text"
                    placeholder="Enter new group name"
                    bind:value={newGroupName[article.url]}
                    on:keydown={(e) =>
                      e.key === "Enter" && createNewGroup(article)}
                  />
                  <button
                    class="button button--create"
                    on:click={createNewGroup(article)}>Create</button
                  >
                </div>
              {/if}

              {#each Object.keys($savedGroups) as group}
                {#if $savedGroups[group].some((a) => a.url === article.url)}
                  <button
                    class="button button--remove"
                    on:click={() => removeArticleFromGroup(group, article)}
                  >
                    Remove from "{group}"
                  </button>
                {/if}
              {/each}
            {/if}
          </div>
        </div>

        <!-- Obrázek -->
        {#if article.urlToImage}
          <div class="article-image">
            <img src={article.urlToImage} alt="Article Image" />
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .articles-container {
    display: flex;
    flex-direction: column;
    gap: 15px; /* Mezera mezi články */
    padding: 10px;
  }

  /* Jedna karta článku */
  .article-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background-color: #fff;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    gap: 15px;
  }

  /* Obsah článku */
  .article-content {
    flex: 1; /* Zabere zbytek prostoru */
  }

  .article-content .author,
  .article-content .time {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
  }

  .article-content .title {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 5px 0;
    color: #000;
  }

  .article-content .description {
    color: #333;
    margin: 10px 0;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .read-more {
    color: #28a745;
    text-decoration: none;
    font-weight: bold;
  }

  .read-more:hover {
    text-decoration: underline;
  }

  .save-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #2d2d2d;
    transition: color 0.3s ease;
  }

  .save-button:hover {
    color: #888;
  }

  .save-button .saved {
    color: #28a745; /* Zelená barva pro uložený článek */
  }

  /* Obrázek */
  .article-image img {
    width: 150px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
  }

  select {
    margin-top: 5px;
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  .button {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  .button--create {
    background-color: #28a745; /* Zelená barva */
    color: white;
  }

  .button--create:hover {
    background-color: #218838; /* Tmavší zelená */
  }

  /* Tlačítko Remove */
  .button--remove {
    background-color: #dc3545; /* Červená barva */
    color: white;
  }

  .button--remove:hover {
    background-color: #c82333; /* Tmavší červená */
  }

  /* Specifické styly pro input */
  .new-group-input {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .new-group-input input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 0.9rem;
  }
</style>
