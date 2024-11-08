<!-- src/News.svelte -->
<script>
  import { onMount, createEventDispatcher } from "svelte";
  export let keyword = ""; // Přijetí klíčového slova
  export let date = ""; // Přijetí data
  export let favorites = [];

  let articles = [];
  let loading = true;
  let error = null;

  const dispatch = createEventDispatcher();

  async function fetchArticles() {
    loading = true;
    articles = [];
    error = null;

    try {
      const url = `https://newsapi.org/v2/everything?q=${keyword || "anything"}&from=${date}&apiKey=e2d3b015ca494468a3e2c3fbca3f0a32`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "ok") {
        articles = data.articles;
      } else {
        throw new Error(data.message || "Error fetching data");
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  onMount(fetchArticles);

  $: if (keyword || date) {
    fetchArticles();
  }

  function toggleFavorite(article) {
    dispatch("toggleFavorite", article);
  }
</script>

{#if loading}
  <p>Loading articles...</p>
{:else if error}
  <p>Error: {error}</p>
{:else}
  <div>
    {#each articles as article}
      <div class="article">
        <p>{article.author}</p>
        <h2>{article.title}</h2>
        <p>{article.description}</p>
        <p>{article.publishedAt}</p>
        <a href={article.url} target="_blank">Read more</a>
        <button on:click={() => toggleFavorite(article)}>
          {#if favorites.findIndex((fav) => fav.url === article.url) === -1}Add
            to Favorite{:else}Remove from Favorite{/if}
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .article {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }
  .article h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }
  .article p {
    margin: 0.5rem 0;
    color: #666;
  }
</style>
