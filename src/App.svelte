<!-- src/App.svelte -->
<script>
	import News from "./News.svelte";
	let currentScreen = "home";
	let selectedDate = "";
	let Keyword = "";
	let favorites = [];
	function toggleFavorite(article) {
		const index = favorites.findIndex((fav) => fav.url === article.url);
		if (index === -1) {
			// Přidat do oblíbených
			favorites = [...favorites, article];
		} else {
			// Odebrat z oblíbených
			favorites = favorites.filter((fav) => fav.url !== article.url);
		}
	}
</script>

<body>
	<div class="navbar">
		<a
			href="javascript:void(0);"
			class={currentScreen === "home" ? "active" : ""}
			on:click={() => (currentScreen = "home")}>Home</a
		>
		<a
			href="javascript:void(0);"
			class={currentScreen === "about" ? "active" : ""}
			on:click={() => (currentScreen = "Recommended")}>Recommended</a
		>
		<a
			href="javascript:void(0);"
			class={currentScreen === "contact" ? "active" : ""}
			on:click={() => (currentScreen = "Favorite")}>Favorite</a
		>
	</div>

	{#if currentScreen === "home"}
		<div class="container">
			<div class="container">
				<div class="form">
					<h1>Home Screen</h1>
					<p>Welcome to the home screen!</p>
					<label for="keyword">Search by Keyword:</label>
					<input
						id="keyword"
						bind:value={Keyword}
						placeholder="Enter keyword"
					/>

					<label for="date">Choose date:</label>
					<input type="date" id="date" bind:value={selectedDate} />

					<div class="buttons">
						<button on:click={() => (currentScreen = "articles")}
							>Search</button
						>
						<button
							on:click={() => {
								selectedDate = "";
								Keyword = "";
							}}>Clear filters</button
						>
					</div>
				</div>
			</div>
		</div>
	{:else if currentScreen === "articles"}
		<h1>Articles</h1>
		<!-- Zobrazte výsledky na základě Keyword a selectedDate -->
		<News
			keyword={Keyword}
			date={selectedDate}
			on:toggleFavorite={(e) => toggleFavorite(e.detail)}
		/>
	{:else if currentScreen === "Favorite"}
		<main>
			<h1>Favorite Articles</h1>
			{#each favorites as article}
				<div class="article">
					<h2>{article.title}</h2>
					<p>{article.description}</p>
					<a href={article.url} target="_blank">Read more</a>
					<button on:click={() => toggleFavorite(article)}
						>Remove from Favorite</button
					>
				</div>
			{/each}
		</main>
	{/if}
</body>

<style>
	.navbar {
		background-color: #333;
		overflow: hidden;
	}

	.navbar a {
		float: left;
		display: block;
		color: white;
		text-align: center;
		padding: 14px 20px;
		text-decoration: none;
	}

	.navbar a:hover {
		background-color: #ddd;
		color: black;
	}

	/* Styl pro aktivní tlačítko */
	.active {
		background-color: #3eabc3;
		color: white;
	}
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh; /* Zajistí, že obsah bude vertikálně na středu */
		padding: 0 20px;
		background-color: #f4f4f9;
	}

	.form {
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 500px; /* Maximální šířka formuláře */
		box-sizing: border-box;
	}

	.form h1 {
		text-align: center;
		margin-bottom: 20px;
		color: #333;
	}

	.form p {
		text-align: center;
		color: #555;
		margin-bottom: 20px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: bold;
	}

	input[type="text"],
	input[type="date"] {
		width: 100%;
		padding: 10px;
		margin-bottom: 15px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 16px;
	}

	.buttons {
		display: flex;
		justify-content: space-between;
	}

	body {
		background-color: #ffffff; /* Tmavé pozadí pro stránku */
		margin: 0;
		font-family: Arial, sans-serif;
	}

	button:hover {
		background-color: #3eabc3;
		color: white;
	}

	button:focus {
		outline: none;
	}

	button {
		padding: 12px 20px;
		font-size: 16px;
		cursor: pointer;
		border: none;
		border-radius: 4px;
		transition: background-color 0.3s;
	}
</style>
