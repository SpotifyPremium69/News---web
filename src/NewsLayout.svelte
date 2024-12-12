<!-- src/NewsLayout.svelte -->
<script>
  export let articles = [];
  export let onFavoriteClick = () => {};
  export let onReadMore = () => {};
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
            >
              &#128278; <!-- Ikona záložky -->
            </button>
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
    font-size: 1.2rem;
    color: #28a745;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .save-button:hover {
    color: #218838;
  }

  /* Obrázek */
  .article-image img {
    width: 150px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
  }
</style>
