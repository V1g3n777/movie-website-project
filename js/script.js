import { API } from "./api.js";
import { Auth } from "./auth.js";
import { Storage } from "./storage.js";
import { 
  initTheme, 
  initLanguages, 
  drawToHtml, 
  setupModals, 
  initSmoothScroll,
  createMovieCard,
  createActorCard,
  initScrollReveal,
  showLoading,
  hideLoading,
  showNoResults,
  openSearchOverlay,
  closeSearchOverlay,
  initCarousel,
  initLiveCarousel,
  setupSearch,
  setupAuthListeners,
  updateUserInfo,
  initFAQ,
  initBurgerMenu
} from "./ui.js";

const hero = document.querySelector(".hero");
const titleEl = document.querySelector(".movie-title");
const overviewEl = document.querySelector(".movie-overview");
const cardsTrends = document.getElementById("cardsTrends");
const now = document.getElementById("now");
const allMovies = document.getElementById("allMovies");
const searchSection = document.getElementById("searchSection");
const searchResults = document.getElementById("searchResults");
const genreList = document.querySelector(".genre-Movies");
const searchInput = document.getElementById("searchInput");
const navSearch = document.getElementById("navSearch");
const navUser = document.getElementById("navUser");
const userName = document.getElementById("userName");

let currentGenre = null;
let currentBackgroundIndex = 0;
let currentMovieId = null;


async function init() {
  initTheme();
  initLanguages();
  setupModals();
  setupAuthListeners();
  setupSearch();
  initSmoothScroll();
  initScrollReveal();
  updateUserInfo();
  initFAQ();
  initBurgerMenu();
  
  const { lang } = Storage.getGlobalSettings();
  const includeAdult = Auth.isAdult();

  try {
    const trendingData = await API.getMovies("/trending/movie/week", 1, lang, includeAdult);
    startBackgroundRotation(trendingData.results);
    drawToHtml(cardsTrends, trendingData.results, createMovieCard);
    initCarousel("cardsTrends");

    const nowPlayingData = await API.getMovies("/movie/now_playing", 1, lang, includeAdult);
    drawToHtml(now, nowPlayingData.results, createMovieCard);
    initCarousel("now");

    const actorsData = await API.getPopularPeople(1, lang);
    drawToHtml(popularActorsContainer, actorsData.results.slice(0, 10), createActorCard);
    initLiveCarousel("popularActorsContainer");

    const genresData = await API.getGenres(lang);
    renderGenres(genresData.genres);

    loadAllMovies(1);

    renderFavoritesPreview();
  } catch (err) {
    console.error("Initialization error:", err);
  }
}

function startBackgroundRotation(movies) {
  if (!movies.length) return;
  changeBackground(movies);
  setInterval(() => {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % movies.length;
    changeBackground(movies);
  }, 6000);
}

function changeBackground(arr) {
  const movie = arr[currentBackgroundIndex];
  currentMovieId = movie.id;
  hero.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;
  titleEl.innerText = movie.title || movie.original_title;
  overviewEl.innerText = movie.overview;
}

hero.addEventListener("click", (e) => {
  if (!e.target.closest(".nav") && currentMovieId) {
    window.location.href = `details.html?id=${currentMovieId}`;
  }
});

async function loadAllMovies(page = 1) {
  const { lang } = Storage.getGlobalSettings();
  const includeAdult = Auth.isAdult();
  
  const path = currentGenre ? `/discover/movie?with_genres=${currentGenre}` : "/discover/movie";
  
  const data = await API.getMovies(path, page, lang, includeAdult);
  
  const previewData = data.results.slice(0, 12);
  drawToHtml(allMovies, previewData, createMovieCard);
}

function renderGenres(genres) {
  if (!genreList) return;
  genreList.innerHTML = "";

  const allLi = document.createElement("li");
  allLi.textContent = "All";
  allLi.classList.add("active");
  allLi.addEventListener("click", () => {
    currentGenre = null;
    loadAllMovies(1);
    setActiveGenre(allLi);
  });
  genreList.appendChild(allLi);

  genres.forEach(({ id, name }) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("click", () => {
      currentGenre = id;
      loadAllMovies(1);
      setActiveGenre(li);
    });
    genreList.appendChild(li);
  });
}

function setActiveGenre(el) {
  document.querySelectorAll(".genre-Movies li").forEach(li => li.classList.remove("active"));
  el.classList.add("active");
}

async function renderFavoritesPreview() {
  const user = Auth.getCurrentUser();
  if (!user) return;

  const movieIds = Storage.getFavorites(user.email);
  if (movieIds.length === 0) return;

  const { lang } = Storage.getGlobalSettings();
  const moviePromises = movieIds.slice(0, 5).map(id => API.getMovieDetails(id, lang));
  const movies = await Promise.all(moviePromises);
  drawToHtml(document.getElementById("favoritesContainer"), movies, createMovieCard);
}

init();
