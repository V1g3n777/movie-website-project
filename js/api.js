const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNGM4NjNiZjI5MWY1NjUxOTAyYmIzYWY4MjI1NmUwMiIsIm5iZiI6MTYzMzAzODA3MC4xODksInN1YiI6IjYxNTYyZWY2ZTE4Yjk3MDA2MjkyODgzMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tWdMFrwBFk5nv9F9lMxrlIRw1vmaj0eIf4F1wjNztd8";
const BASE_URL = "https://api.themoviedb.org/3";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
  },
};

async function fetchData(url) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export const API = {
  // Movies
  getMovies: (path, page = 1, lang = "en-US", includeAdult = false) => {
    const url = `${BASE_URL}${path}?page=${page}&language=${lang}&include_adult=${includeAdult}`;
    return fetchData(url);
  },
  
  searchMovies: (query, page = 1, lang = "en-US", includeAdult = false) => {
    const url = `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&language=${lang}&include_adult=${includeAdult}`;
    return fetchData(url);
  },
  
  getMovieDetails: (id, lang = "en-US") => {
    return fetchData(`${BASE_URL}/movie/${id}?language=${lang}`);
  },
  
  getMovieCredits: (id) => {
    return fetchData(`${BASE_URL}/movie/${id}/credits`);
  },
  
  getMovieVideos: (id, lang = "en-US") => {
    return fetchData(`${BASE_URL}/movie/${id}/videos?language=${lang}`);
  },
  
  getPopularPeople: (page = 1, lang = "en-US") => {
    return fetchData(`${BASE_URL}/person/popular?page=${page}&language=${lang}`);
  },

  getPersonDetails: (id, lang = "en-US") => {
    return fetchData(`${BASE_URL}/person/${id}?language=${lang}`);
  },

  getPersonMovieCredits: (id, lang = "en-US") => {
    return fetchData(`${BASE_URL}/person/${id}/movie_credits?language=${lang}`);
  },
  
  getGenres: (lang = "en-US") => {
    return fetchData(`${BASE_URL}/genre/movie/list?language=${lang}`);
  },
  
  getLanguages: () => {
    return fetchData(`${BASE_URL}/configuration/languages`);
  }
};
