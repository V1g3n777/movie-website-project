import { API } from "./api.js";
import { Storage } from "./storage.js";
import { Auth } from "./auth.js";
import { getTranslation } from "./translations.js";

const body = document.body;
const toggle = document.getElementById("themeToggle");
const toggleImg = document.getElementsByClassName("toggleImg");


export function initTheme() {
  const { theme } = Storage.getGlobalSettings();
  setTheme(theme);
  
  if (toggle) {
    toggle.addEventListener("click", () => {
      const newTheme = body.classList.contains("dark") ? "light" : "dark";
      setTheme(newTheme);
      Storage.saveGlobalSettings({ theme: newTheme });
    });
  }
}

function setTheme(theme) {
  if (theme === "light") {
    body.classList.remove("dark");
    body.classList.add("light");
    if (toggleImg[0]) toggleImg[0].src = "./navImage/moon.png";
  } else {
    body.classList.remove("light");
    body.classList.add("dark");
    if (toggleImg[0]) toggleImg[0].src = "./navImage/Union.png";
  }
}



export function initLanguages() {
  const selector = document.getElementById("langSelector");
  if (!selector) return;

  const { lang } = Storage.getGlobalSettings();
  
  const options = [
    { code: "en-US", name: "English (EN)" },
    { code: "ru-RU", name: "Русский (RU)" }
  ];

  selector.innerHTML = options
    .map(o => `<option value="${o.code}" ${lang === o.code ? "selected" : ""}>${o.name}</option>`)
    .join("");

  selector.addEventListener("change", (e) => {
    Storage.saveGlobalSettings({ lang: e.target.value });
    location.reload(); 
  });
  
  updateUITranslations();
}

export function updateUITranslations() {
  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    el.innerText = getTranslation(key);
  });
  
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.placeholder = getTranslation("searchPlaceholder");
  }
}

export function createMovieCard(movie) {
  const user = Auth.getCurrentUser();
  const favorites = Storage.getFavorites(user?.email);
  const movieId = movie.id.toString();
  const isFav = favorites.includes(movieId);

  const card = document.createElement("div");
  card.className = "card movie-card animate-fade-in";
  
  const img = document.createElement("img");
  img.src = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : "https://via.placeholder.com/342x513?text=No+Poster";
  
  const favBtn = document.createElement("button");
  favBtn.className = `fav-btn ${isFav ? "active" : ""}`;
  favBtn.innerHTML = `<i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>`;
  
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!Auth.isAuthenticated()) {
      showAuthModal();
      return;
    }
    const newFavs = Storage.toggleFavorite(user.email, movieId);
    const nowFav = newFavs.includes(movieId);
    favBtn.classList.toggle("active", nowFav);
    favBtn.innerHTML = `<i class="bi ${nowFav ? "bi-heart-fill" : "bi-heart"}"></i>`;
    updateFavoritesVisibility();
  });

  const overlay = document.createElement("div");
  overlay.className = "card-overlay";
  overlay.innerHTML = `
    <div class="card-info">
      <h3 class="card-title">${movie.title}</h3>
      <div class="card-meta">
        <span class="card-rating"><i class="bi bi-star-fill" style="color: #ffc107; font-size: 14px;"></i> ${movie.vote_average.toFixed(1)}</span>
        <span class="card-year">${movie.release_date ? movie.release_date.split("-")[0] : ""}</span>
      </div>
    </div>
  `;

  card.append(img, favBtn, overlay);
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    window.location.href = `details.html?id=${movie.id}`;
  });
  
  return card;
}

export function createActorCard(actor) {
  const user = Auth.getCurrentUser();
  const favorites = Storage.getFavoriteActors(user?.email);
  const actorId = actor.id.toString();
  const isFav = favorites.includes(actorId);

  const card = document.createElement("div");
  card.className = "card actor-card animate-fade-in";
  
  const img = document.createElement("img");
  img.src = actor.profile_path 
    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
    : "https://via.placeholder.com/185x278?text=No+Photo";
  
  const info = document.createElement("div");
  info.className = "card-overlay";
  info.innerHTML = `
    <div class="card-info">
      <h3 class="card-title" style="margin-bottom: 0;">${actor.name}</h3>
    </div>
  `;

  const favBtn = document.createElement("button");
  favBtn.className = `fav-btn ${isFav ? "active" : ""}`;
  favBtn.innerHTML = `<i class="bi ${isFav ? "bi-star-fill" : "bi-star"}"></i>`;
  
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!Auth.isAuthenticated()) {
      showAuthModal();
      return;
    }
    const newFavs = Storage.toggleFavoriteActor(user.email, actorId);
    const nowFav = newFavs.includes(actorId);
    favBtn.classList.toggle("active", nowFav);
    favBtn.innerHTML = `<i class="bi ${nowFav ? "bi-star-fill" : "bi-star"}"></i>`;
  });

  card.append(img, favBtn, info);
  return card;
}

export function drawToHtml(container, data, renderer) {
  if (!container) return;
  container.innerHTML = "";
  data.forEach(item => container.append(renderer(item)));
}

export function setupModals() {
  const authModal = document.getElementById("authModal");
  const videoModal = document.getElementById("videoModal");
  const searchOverlay = document.getElementById("searchOverlay");
  
  if (!authModal && !videoModal && !searchOverlay) return;

  const closes = document.querySelectorAll(".close, .close-overlay");
  closes.forEach(c => {
    c.onclick = () => {
      if (authModal) authModal.style.display = "none";
      if (videoModal) {
        videoModal.style.display = "none";
        document.getElementById("trailerFrame").src = ""; 
      }
      if (searchOverlay) closeSearchOverlay();
    };
  });

  window.onclick = (event) => {
    if (event.target == authModal) authModal.style.display = "none";
    if (event.target == videoModal) {
      videoModal.style.display = "none";
      document.getElementById("trailerFrame").src = "";
    }
    if (event.target == searchOverlay) closeSearchOverlay();
  };
}

export function openSearchOverlay() {
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("overlaySearchInput");
  if (overlay) {
    overlay.style.display = "flex";
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
  }
}

export function closeSearchOverlay() {
  const overlay = document.getElementById("searchOverlay");
  if (overlay) overlay.style.display = "none";
}

export function showAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.style.display = "flex";
}

export function showTrailerModal(videoKey) {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("trailerFrame");
  if (!modal || !frame) return;

  frame.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1`;
  modal.style.display = "flex";
}

export async function playTrailer(id) {
  try {
    const { lang } = Storage.getGlobalSettings();
    let data = await API.getMovieVideos(id, lang);
    let trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");

    if (!trailer && lang !== "en-US") {
      data = await API.getMovieVideos(id, "en-US");
      trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
    }

    if (trailer) {
      const heroVideo = document.getElementById("heroVideoContainer");
      if (heroVideo) {
        playInlineTrailer(trailer.key);
      } else {
        showTrailerModal(trailer.key);
      }
    } else {
      alert("No trailer found.");
    }
  } catch (e) {
    console.error("Trailer error:", e);
  }
}

export function playInlineTrailer(videoKey) {
  const container = document.getElementById("heroVideoContainer");
  const wrapper = container.querySelector(".video-wrapper");
  const heroContent = document.querySelector(".section-content");
  const closeBtn = document.getElementById("closeHeroVideo");

  if (!container || !wrapper) return;

  wrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoKey}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
  container.style.display = "block";
  if (heroContent) heroContent.style.opacity = "0";
  
  closeBtn.onclick = () => {
    wrapper.innerHTML = "";
    container.style.display = "none";
    if (heroContent) heroContent.style.opacity = "1";
  };
}


export function showLoading(containerId) {
  const loader = document.getElementById(containerId);
  if (loader) loader.style.display = "block";
}

export function hideLoading(containerId) {
  const loader = document.getElementById(containerId);
  if (loader) loader.style.display = "none";
}

export function showNoResults(show, targetId = "noResults") {
  const el = document.getElementById(targetId);
  if (el) el.style.display = show ? "block" : "none";
}

export function initCarousel(containerId, autoScrollDelay = 3000) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const wrapper = container.parentElement;
  const prevBtn = wrapper.querySelector(".prev-btn");
  const nextBtn = wrapper.querySelector(".next-btn");

  if (!prevBtn || !nextBtn) return;

  const scrollAmount = 400; 
  let autoScrollInterval;

  const startAutoScroll = () => {
    autoScrollInterval = setInterval(() => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, autoScrollDelay);
  };

  const stopAutoScroll = () => clearInterval(autoScrollInterval);

  nextBtn.onclick = () => {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    stopAutoScroll(); 
  };

  prevBtn.onclick = () => {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    stopAutoScroll();
  };

  wrapper.onmouseenter = stopAutoScroll;
  wrapper.onmouseleave = startAutoScroll;

  container.onscroll = () => {
    prevBtn.style.display = container.scrollLeft <= 0 ? "none" : "flex";
    nextBtn.style.display = 
      container.scrollLeft + container.clientWidth >= container.scrollWidth - 10 
      ? "none" : "flex";
  };
  
  container.onscroll();
  startAutoScroll();
}

export function initLiveCarousel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const children = Array.from(container.children);
  children.forEach(child => {
    const clone = child.cloneNode(true);
    container.appendChild(clone);
  });

  container.classList.add("live-container");
  const wrapper = container.parentElement;
  if (wrapper && wrapper.classList.contains("carousel-wrapper")) {
    const btns = wrapper.querySelectorAll(".carousel-btn");
    btns.forEach(btn => btn.style.display = "none");
  }
}

export function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

export function updateUserInfo() {
  const userName = document.getElementById("userName");
  const navUser = document.getElementById("navUser");
  if (!userName || !navUser) return;

  const user = Auth.getCurrentUser();
  if (user) {
    userName.innerText = user.firstName ? `${user.firstName}` : user.email.split("@")[0];
    userName.style.display = "block";
    const userImg = navUser.querySelector("img");
    if (user.avatar) {
      userImg.src = user.avatar;
      userImg.style.borderRadius = "50%";
      userImg.style.width = "30px";
      userImg.style.height = "30px";
      userImg.style.objectFit = "cover";
    } else {
      userImg.style.filter = "sepia(1) saturate(5) hue-rotate(180deg)";
    }
  } else {
    userName.style.display = "none";
    navUser.querySelector("img").style.filter = "";
  }
  updateFavoritesVisibility();
}

export function updateFavoritesVisibility() {
  const user = Auth.getCurrentUser();
  const email = user ? user.email : "guest";
  const favorites = Storage.getFavorites(email);
  
  const favLinks = document.querySelectorAll('[data-translate="favorites"]');
  favLinks.forEach(link => {
    const parentLi = link.closest('li');
    if (parentLi) {
      parentLi.style.display = (favorites.length > 0) ? "block" : "none";
    }
  });
}

export async function performOverlaySearch(query) {
  const { lang } = Storage.getGlobalSettings();
  const includeAdult = Auth.isAdult();
  const resultsContainer = document.getElementById("overlayResults");
  
  showLoading("overlayLoading");
  showNoResults(false, "overlayNoResults");
  if (resultsContainer) resultsContainer.innerHTML = "";
  
  try {
    const data = await API.searchMovies(query, 1, lang, includeAdult);
    hideLoading("overlayLoading");
    
    if (data.results.length > 0) {
      drawToHtml(resultsContainer, data.results, createMovieCard);
    } else {
      showNoResults(true, "overlayNoResults");
    }
  } catch (err) {
    hideLoading("overlayLoading");
    console.error(err);
  }
}

export function setupSearch() {
  const navSearch = document.getElementById("navSearch");
  const overlaySearchInput = document.getElementById("overlaySearchInput");
  if (!navSearch || !overlaySearchInput) return;

  navSearch.addEventListener("click", () => {
    openSearchOverlay();
  });

  let searchTimeout;
  overlaySearchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    if (query.length === 0) {
      const results = document.getElementById("overlayResults");
      if (results) results.innerHTML = "";
      showNoResults(false, "overlayNoResults");
      return;
    }
    searchTimeout = setTimeout(() => {
      if (query.length > 2) {
        performOverlaySearch(query);
      }
    }, 400);
  });

  overlaySearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearchOverlay();
    if (e.key === "Enter") {
      const query = e.target.value.trim();
      if (query.length > 2) performOverlaySearch(query);
    }
  });
}

export function setupAuthListeners() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const toRegister = document.getElementById("toRegister");
  const toLogin = document.getElementById("toLogin");
  const navUser = document.getElementById("navUser");
  const userName = document.getElementById("userName");

  if (!loginForm) return;

  if (toRegister) {
    toRegister.onclick = (e) => {
      e.preventDefault();
      loginForm.style.display = "none";
      registerForm.style.display = "flex";
      registerForm.style.flexDirection = "column";
    };
  }

  if (toLogin) {
    toLogin.onclick = (e) => {
      e.preventDefault();
      registerForm.style.display = "none";
      loginForm.style.display = "flex";
      loginForm.style.flexDirection = "column";
    };
  }

  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPass").value;
    try {
      Auth.login(email, pass);
      location.reload(); 
    } catch (err) {
      alert(err.message);
    }
  };

  registerForm.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPass").value;
    const firstName = document.getElementById("regFirstName").value;
    const lastName = document.getElementById("regLastName").value;
    const age = document.getElementById("regAge") ? document.getElementById("regAge").value : 18;
    try {
      Auth.register(email, pass, age, firstName, lastName);
      alert("Registration successful! Please login.");
      if (toLogin) toLogin.click();
    } catch (err) {
      alert(err.message);
    }
  };

  if (navUser) {
    navUser.addEventListener("click", () => {
      if (Auth.isAuthenticated()) {
        window.location.href = "user.html";
      } else {
        showAuthModal();
      }
    });
  }

  if (userName) {
    userName.addEventListener("click", () => {
      window.location.href = "user.html";
    });
  }
}

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  });
}

export function initFAQ() {
  const faqQuestions = document.querySelectorAll(".faq-question");
  
  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.parentElement;
      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach(el => el.classList.remove("active"));
      
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}

/* ================= BURGER MENU ================= */

export function initBurgerMenu() {
  const burgerBtn = document.getElementById("burgerBtn");
  const navList = document.querySelector(".nav-list");
  const navLinks = document.querySelectorAll(".nav-links li a");

  if (!burgerBtn || !navList) return;

  burgerBtn.addEventListener("click", () => {
    burgerBtn.classList.toggle("active");
    navList.classList.toggle("active");
    document.body.style.overflow = navList.classList.contains("active") ? "hidden" : "";
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      burgerBtn.classList.remove("active");
      navList.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!navList.contains(e.target) && !burgerBtn.contains(e.target) && navList.classList.contains("active")) {
      burgerBtn.classList.remove("active");
      navList.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}
