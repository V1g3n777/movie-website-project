import { API } from "./api.js";
import { Storage } from "./storage.js";
import { 
  initTheme, 
  initLanguages, 
  drawToHtml, 
  createActorCard, 
  setupModals, 
  showTrailerModal,
  playTrailer,
  showAuthModal,
  initBurgerMenu
} from "./ui.js";
import { Auth } from "./auth.js";

const detailsContainer = document.getElementById("detailsContainer");
const castCarousel = document.getElementById("castCarousel");

async function init() {
  initTheme();
  initLanguages();
  setupModals();
  initBurgerMenu();

  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("id");

  if (!movieId) {
    detailsContainer.innerHTML = "<h1>Movie not found</h1>";
    return;
  }

  const { lang } = Storage.getGlobalSettings();

  try {
    const details = await API.getMovieDetails(movieId, lang);
    renderDetails(details);

    const credits = await API.getMovieCredits(movieId);
    drawToHtml(castCarousel, credits.cast.slice(0, 15), createActorCard);
    
  } catch (err) {
    console.error(err);
    detailsContainer.innerHTML = `<h1>Error loading details: ${err.message}</h1>`;
  }
}

function renderDetails(movie) {
  const backdrop = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "./navImage/hero banner.png";
    
  detailsContainer.innerHTML = `
    <div class="backdrop-container" style="background-image: url(${backdrop})">
      <div class="backdrop-overlay"></div>
    </div>
    <div class="details-content">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="poster-img animate-fade-in" alt="${movie.title}">
      <div class="info-text">
        <h1 class="animate-fade-in">${movie.title}</h1>
        <div class="rating-badge animate-fade-in">⭐ ${movie.vote_average.toFixed(1)} / 10</div>
        <p class="animate-fade-in" style="font-size: 1.1rem; line-height: 1.6; max-width: 800px;">${movie.overview}</p>
        
        <div style="margin-top: 30px; display: flex; gap: 15px;" class="animate-fade-in">
          <button id="trailerBtn" class="watch-trailer-btn">
            <i class="bi bi-play-fill"></i>
            <span data-translate="watchTrailer">Watch Trailer</span>
          </button>
          <button id="detailsFavBtn" class="watch-trailer-btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
            <i class="bi bi-heart"></i>
            <span>Favorite</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("trailerBtn").onclick = () => playTrailer(movie.id);

  const favBtn = document.getElementById("detailsFavBtn");
  const updateFavBtn = () => {
    const user = Auth.getCurrentUser();
    const favorites = Storage.getFavorites(user?.email);
    const isFav = favorites.includes(movie.id.toString());
    favBtn.querySelector("i").className = `bi ${isFav ? "bi-heart-fill" : "bi-heart"}`;
    favBtn.style.color = isFav ? "#ff4d4d" : "white";
    if (isFav) {
      favBtn.style.borderColor = "rgba(255, 77, 77, 0.5)";
      favBtn.style.background = "rgba(255, 77, 77, 0.1)";
    } else {
      favBtn.style.borderColor = "rgba(255, 255, 255, 0.2)";
      favBtn.style.background = "rgba(255, 255, 255, 0.1)";
    }
  };

  updateFavBtn();

  favBtn.onclick = () => {
    const user = Auth.getCurrentUser();
    if (!user) {
      showAuthModal();
      return;
    }
    Storage.toggleFavorite(user.email, movie.id.toString());
    updateFavBtn();
  };
}


init();
