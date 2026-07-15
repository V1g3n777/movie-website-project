import { API } from "./api.js";
import { Storage } from "./storage.js";
import { Auth } from "./auth.js";
import { initTheme, initLanguages, drawToHtml, createMovieCard, createActorCard, initBurgerMenu } from "./ui.js";

async function init() {
  initTheme();
  initLanguages();
  initBurgerMenu();

  const user = Auth.getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userDisplayName = document.getElementById("userDisplayName");
  const userEmailLabel = document.getElementById("userEmailLabel");
  const logoutBtn = document.getElementById("logoutBtn");
  const editFirstName = document.getElementById("editFirstName");
  const editLastName = document.getElementById("editLastName");
  const editEmail = document.getElementById("editEmail");
  const editAge = document.getElementById("editAge");
  const avatarInput = document.getElementById("avatarInput");
  const settingsAvatarPreview = document.getElementById("settingsAvatarPreview");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const saveMessage = document.getElementById("saveMessage");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const openSettingsBtn = document.getElementById("openSettingsBtn");
  const headerSettingsIcon = document.getElementById("headerSettingsIcon");
  const closeSettings = document.getElementById("closeSettings");

  const updateGreeting = (u) => {
    const fullName = u.firstName ? `${u.firstName} ${u.lastName || ""}` : u.email.split("@")[0];
    if (userDisplayName) userDisplayName.innerText = `Hello, ${fullName}!`;
    if (userEmailLabel) userEmailLabel.innerText = u.email;
  };
  updateGreeting(user);

  const applyAvatar = (avatarUrl) => {
    if (!avatarUrl) return;
    if (settingsAvatarPreview) {
      settingsAvatarPreview.src = avatarUrl;
      settingsAvatarPreview.style.display = "block";
    }
    const userAvatarEl = document.querySelector(".user-avatar");
    if (userAvatarEl) {
      if (userAvatarEl.tagName === "I") {
        userAvatarEl.outerHTML = `<img src="${avatarUrl}" class="user-avatar" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; filter: drop-shadow(0 0 15px rgba(45, 140, 255, 0.5));">`;
      } else {
        userAvatarEl.src = avatarUrl;
      }
    }
  };
  applyAvatar(user.avatar);
  if (editFirstName) editFirstName.value = user.firstName || "";
  if (editLastName) editLastName.value = user.lastName || "";
  if (editEmail) editEmail.value = user.email;
  if (editAge) editAge.value = user.age || "";

  const toggleOverlay = (show) => {
    if (settingsOverlay) settingsOverlay.style.display = show ? "flex" : "none";
  };

  if (openSettingsBtn) openSettingsBtn.onclick = () => toggleOverlay(true);
  if (headerSettingsIcon) headerSettingsIcon.onclick = () => toggleOverlay(true);
  if (closeSettings) closeSettings.onclick = () => toggleOverlay(false);
  
  window.addEventListener("click", (e) => {
    if (e.target === settingsOverlay) toggleOverlay(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleOverlay(false);
  });

  if (avatarInput) {
    avatarInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          if (settingsAvatarPreview) {
            settingsAvatarPreview.src = base64;
            settingsAvatarPreview.style.display = "block";
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }

  if (saveProfileBtn) {
    saveProfileBtn.onclick = () => {
      const currentUserData = Auth.getCurrentUser(); 
      const updatedUser = {
        ...currentUserData,
        firstName: editFirstName.value,
        lastName: editLastName.value,
        age: editAge.value ? parseInt(editAge.value) : currentUserData.age,
        avatar: settingsAvatarPreview.src
      };
      
      Storage.updateUser(updatedUser);
      
      updateGreeting(updatedUser);
      applyAvatar(updatedUser.avatar);
      
      if (saveMessage) {
        saveMessage.style.display = "block";
        setTimeout(() => {
          saveMessage.style.display = "none";
          toggleOverlay(false); 
        }, 1500);
      }
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      Auth.logout();
      window.location.href = "index.html";
    };
  }

  const { lang } = Storage.getGlobalSettings();

  const favoriteMoviesList = document.getElementById("favoriteMoviesList");
  const favoriteActorsList = document.getElementById("favoriteActorsList");

  const favMovieIds = Storage.getFavorites(user.email);
  if (favMovieIds.length > 0) {
    const moviePromises = favMovieIds.map(id => API.getMovieDetails(id, lang));
    const movies = await Promise.all(moviePromises);
    drawToHtml(favoriteMoviesList, movies, createMovieCard);
  } else {
    favoriteMoviesList.innerHTML = "<p>No favorite movies yet.</p>";
  }

  const favActorIds = Storage.getFavoriteActors(user.email);
  if (favActorIds.length > 0) {
    const actorPromises = favActorIds.map(id => API.getPersonDetails(id, lang));
    const actors = await Promise.all(actorPromises);
    drawToHtml(favoriteActorsList, actors, createActorCard);
  } else {
    favoriteActorsList.innerHTML = "<p>No favorite actors yet.</p>";
  }
}

init();
