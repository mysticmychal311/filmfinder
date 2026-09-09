let allMovies = []
let movies = []
let spotlightMovie = 0
let spotlightTimer = null

const WORDS = [
  "love", "life", "night", "day", "world", "dark", "king", "war", "dream", "star",
  "home", "story", "man", "girl", "boy", "house", "secret", "last", "lost", "new",
  "old", "great", "good", "true", "free", "fire", "gold", "silver", "blue", "red",
  "black", "white", "wild", "time", "game", "power", "shadow", "light", "storm", "rise",
  "fall", "hero", "legend", "mystery", "ghost", "edge", "sky", "sea", "moon", "sun",
  "wolf", "lion", "dragon", "angel", "city", "road", "journey", "escape", "revenge",
  "justice", "freedom", "destiny", "fate", "hope", "fear", "courage", "honor", "glory"
]

function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


async function loadTrending() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)]
  const response = await fetch(`https://www.omdbapi.com/?apikey=13365a49&s=${word}&type=movie`)
  const data = await response.json()

  const found = data.Response === "True" ? data.Search.filter((movie) => movie.Poster !== "N/A") : []
  allMovies = shuffleInPlace(found).slice(0, 5)

  renderMovies()
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function searchMovies() {
  const searchInput = document.getElementById("search-input").value
  if (!searchInput) return
  const resultsEl = document.getElementById("movie__results")
  resultsEl.classList.add("movies__loading")
  resultsEl.innerHTML = `<img src="assets/spinner.png" alt="Loading" class="spinner">`

  await delay(2700)

  const response = await fetch(`https://www.omdbapi.com/?apikey=13365a49&s=${encodeURIComponent(searchInput)}`)
  const data = await response.json()
  allMovies = data.Response === "True" ? data.Search.filter((movie) => movie.Poster !== "N/A") : []

  resultsEl.classList.remove("movies__loading")
  document.getElementById("results-heading").textContent = `Results for "${searchInput}"`
  document.getElementById("filter").value = ""
  renderMovies()
}

function renderMovies(filter) {
    let movies = [...allMovies]
     if (filter === "RELEASE DATE") movies.sort((a, b) => b.Year - a.Year)
    else if (filter === "A-Z") movies.sort((a, b) => a.Title.localeCompare(b.Title))
    else if (filter === "SHOWS")  movies = movies.filter((movie) => movie.Type === "series")
    else if (filter === "MOVIES") movies = movies.filter((movie) => movie.Type === "movie")
    document.getElementById("movie__results").innerHTML = movies.length
    ? movies.map((movie) => `
        <div class="movie__card" data-poster="${movie.Poster}">
          <img src="${movie.Poster}" alt="${movie.Title} Poster" class="movie__poster">
          <h3 class="movie__title">${movie.Title}</h3>
          <p class="movie__description">${movie.Year} &middot; ${movie.Type}</p>
        </div>
      `).join("")
    : `<p class="no-results">No movies found. Try another search.</p>`
        document.querySelectorAll(".movie__poster").forEach((img) => {
        img.addEventListener("error", () => img.closest(".movie__card").remove())
  })

  document.querySelectorAll(".movie__card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      clearInterval(spotlightTimer)
      document.querySelector(".movie__card.spotlight")?.classList.remove("spotlight")
      setBackdrop(card.dataset.poster)
    })
    card.addEventListener("mouseleave", resumeSpotlight)
    })
    if (!document.getElementById("filter")) startSpotlight()
}

function setBackdrop(posterUrl) {
  document.getElementById("poster-backdrop").style.backgroundImage = `url("${posterUrl}")`
}

function highlightCard(index) {
  const cards = document.querySelectorAll(".movie__card")
  if (!cards.length) return
  cards[spotlightMovie]?.classList.remove("spotlight")
  spotlightMovie = (index + cards.length) % cards.length
  cards[spotlightMovie].classList.add("spotlight")
  setBackdrop(cards[spotlightMovie].dataset.poster)
}

function startSpotlight() {
  highlightCard(0)
  resumeSpotlight()
}

function resumeSpotlight() {
  if (document.getElementById("filter")) return
  clearInterval(spotlightTimer)
  spotlightTimer = setInterval(() => highlightCard(spotlightMovie + 1), 6000)
}

document.addEventListener("keydown", (e) => {
  if (document.getElementById("filter")) return
  if (e.key === "ArrowRight") highlightCard(spotlightMovie + 1)
  else if (e.key === "ArrowLeft") highlightCard(spotlightMovie - 1)
  else return

  resumeSpotlight()
})

function filterMovies(event) {
  renderMovies(event.target.value)
}
document.getElementById("filter")?.addEventListener("change", filterMovies)

document.getElementById("search-form").addEventListener("submit", (e) => {
  if (!document.getElementById("filter")) return
  e.preventDefault()
  searchMovies()
})

const searchTerm = new URLSearchParams(window.location.search).get("q")
if (document.getElementById("filter")) {
  if (searchTerm) {
    document.getElementById("search-input").value = searchTerm
    searchMovies()
  }
} else {
  loadTrending()
}