const STORAGE_KEYS = {
  USERS: "movie_app_users",
  CURRENT_USER: "movie_app_current_user",
  FAVORITES: "movie_app_favorites_", 
  FAVORITE_ACTORS: "movie_app_fav_actors_", 
  GLOBAL_SETTINGS: "movie_app_global_settings" 
};

export const Storage = {
  getUsers: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [],
  saveUser: (user) => {
    const users = Storage.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  updateUser: (updatedUser) => {
    const users = Storage.getUsers();
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const currentUser = Storage.getCurrentUser();
      if (currentUser && currentUser.email === updatedUser.email) {
        Storage.setCurrentUser(users[index]);
      }
    }
  },
  
  getCurrentUser: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)),
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },
  
  getGlobalSettings: () => {
    const defaults = { theme: "dark", lang: "en-US" };
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GLOBAL_SETTINGS)) || defaults;
  },
  saveGlobalSettings: (settings) => {
    const current = Storage.getGlobalSettings();
    localStorage.setItem(STORAGE_KEYS.GLOBAL_SETTINGS, JSON.stringify({ ...current, ...settings }));
  },
  
  getFavorites: (email) => {
    if (!email) return [];
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES + email));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },
  toggleFavorite: (email, movieId) => {
    if (!email) return [];
    let favorites = Storage.getFavorites(email);
    if (favorites.includes(movieId)) {
      favorites = favorites.filter(id => id !== movieId);
    } else {
      favorites.push(movieId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES + email, JSON.stringify(favorites));
    return favorites;
  },

  getFavoriteActors: (email) => {
    if (!email) return [];
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_ACTORS + email));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },
  toggleFavoriteActor: (email, actorId) => {
    if (!email) return [];
    let actors = Storage.getFavoriteActors(email);
    if (actors.includes(actorId)) {
      actors = actors.filter(id => id !== actorId);
    } else {
      actors.push(actorId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITE_ACTORS + email, JSON.stringify(actors));
    return actors;
  }
};
