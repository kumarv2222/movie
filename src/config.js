export const API_BASE_URL = import.meta.env.PROD
    ? ''
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_KEY || '79d581c6cd5a27d3fbd2162e3f3b0ca9';
