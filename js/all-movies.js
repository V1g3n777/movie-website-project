import { API } from "./api.js";
import { Storage } from "./storage.js";
import { Auth } from "./auth.js";

import { 
  initTheme, 
  initLanguages, 
  setupModals, 
  setupSearch, 
  updateUserInfo,
  setupAuthListeners,
  createMovieCard,
  showLoading,
  hideLoading,
  initBurgerMenu
} from "./ui.js";


let currentTmdbPage = 1;
let currentGenre = null;
const BATCH_SIZE = 5; 


const movieGrid = document.getElementById("allMoviesGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const genreList = document.querySelector(".genre-Movies");


async function init() {
  initTheme();
  initLanguages();
  setupModals();
  setupAuthListeners();
  setupSearch();
  updateUserInfo();
  initBurgerMenu();

  const genresData = await API.getGenres(Storage.getGlobalSettings().lang);
  renderGenres(genresData.genres);


  loadMoviesBatch();
}


async function loadMoviesBatch() {
  const { lang } = Storage.getGlobalSettings();
  const includeAdult = Auth.isAdult();
  
  showLoading("loadingBatches");
  loadMoreBtn.disabled = true;

  try {
    const fetchPromises = [];
    const path = currentGenre ? `/discover/movie?with_genres=${currentGenre}` : "/discover/movie";


    for (let i = 0; i < BATCH_SIZE; i++) {
      fetchPromises.push(API.getMovies(path, currentTmdbPage + i, lang, includeAdult));
    }

    const results = await Promise.all(fetchPromises);
    const allBatchedMovies = results.flatMap(data => data.results);


    const uniqueMovies = Array.from(new Set(allBatchedMovies.map(m => m.id)))
      .map(id => allBatchedMovies.find(m => m.id === id));

    renderMovies(uniqueMovies);
    
    currentTmdbPage += BATCH_SIZE;
    

    if (results[0].total_pages < currentTmdbPage) {
      loadMoreBtn.style.display = "none";
    }

  } catch (err) {
    console.error("Failed to load batch:", err);
  } finally {
    hideLoading("loadingBatches");
    loadMoreBtn.disabled = false;
  }
}

function renderMovies(movies) {
  movies.forEach(movie => {
    const card = createMovieCard(movie);
    movieGrid.appendChild(card);
  });
}

function renderGenres(genres) {
  if (!genreList) return;
  genreList.innerHTML = "";

  const allLi = document.createElement("li");
  allLi.textContent = "All";
  allLi.classList.add("active");
  allLi.addEventListener("click", () => {
    currentGenre = null;
    resetAndLoad();
    setActiveGenre(allLi);
  });
  genreList.appendChild(allLi);

  genres.forEach(({ id, name }) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("click", () => {
      currentGenre = id;
      resetAndLoad();
      setActiveGenre(li);
    });
    genreList.appendChild(li);
  });
}

function resetAndLoad() {
  movieGrid.innerHTML = "";
  currentTmdbPage = 1;
  loadMoviesBatch();
}

function setActiveGenre(el) {
  document.querySelectorAll(".genre-Movies li").forEach(li => li.classList.remove("active"));
  el.classList.add("active");
}


if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", loadMoviesBatch);
}

document.addEventListener("DOMContentLoaded", init);
