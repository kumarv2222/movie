import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./index.css";
import Login from "./Login";
import Register from "./Register";
import Admin from "./Admin";

import { TMDB_API_KEY as API_KEY } from "./config";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/original/";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500/";

const requests = [
  { title: "Trending Now", url: `/trending/all/week?api_key=${API_KEY}&language=en-US` },
  { title: "Netflix Originals", url: `/discover/tv?api_key=${API_KEY}&with_networks=213` },
  { title: "Top Rated", url: `/movie/top_rated?api_key=${API_KEY}&language=en-US` },
  { title: "Action Movies", url: `/discover/movie?api_key=${API_KEY}&with_genres=28` },
  { title: "Comedy Movies", url: `/discover/movie?api_key=${API_KEY}&with_genres=35` },
  { title: "Horror Movies", url: `/discover/movie?api_key=${API_KEY}&with_genres=27` },
  { title: "Romance Movies", url: `/discover/movie?api_key=${API_KEY}&with_genres=10749` },
  { title: "Documentaries", url: `/discover/movie?api_key=${API_KEY}&with_genres=99` },
];

/* ─── Components ─────────────────────────────────── */

function Navbar({ onSearch }) {
  const [show, handleShow] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const scrollListener = () => {
      if (window.scrollY > 100) {
        handleShow(true);
      } else handleShow(false);
    };
    window.addEventListener("scroll", scrollListener);
    return () => window.removeEventListener("scroll", scrollListener);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <nav style={{
      position: "fixed", top: 0, width: "100%", height: "70px", padding: "0 4%",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      zIndex: 100, transition: "all 0.5s",
      background: show ? "#111" : "linear-gradient(to bottom, rgba(0,0,0,0.8) 10%, transparent)",
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', cursive", fontSize: "40px", color: "#e50914",
        letterSpacing: "2px", fontWeight: "bold", cursor: "pointer"
      }} onClick={() => navigate("/")}>
        NETFLOX
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: "10px", color: "#aaa" }}>🔍</span>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); onSearch(e.target.value) }}
            style={{
              background: "rgba(0,0,0,0.6)", border: "1px solid #444", borderRadius: "20px",
              padding: "7px 15px 7px 35px", color: "white", outline: "none", width: "200px"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <span style={{ color: "#fff", fontSize: "14px" }}>Hi, {userName || "User"}</span>
          <div
            onClick={handleLogout}
            style={{
              padding: "6px 12px", background: "#e50914", borderRadius: "4px", cursor: "pointer",
              fontSize: "12px", fontWeight: "bold"
            }}
          >Logout</div>
        </div>
      </div>
    </nav>
  );
}

function Row({ title, fetchUrl, results, isLargeRow, onSelect }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    if (results) {
      setMovies(results);
    } else if (fetchUrl) {
      async function fetchData() {
        const response = await fetch(`${BASE_URL}${fetchUrl}`);
        const data = await response.json();
        setMovies(data.results || []);
      }
      fetchData();
    }
  }, [fetchUrl, results]);

  return (
    <div style={{ marginLeft: "4%", color: "white", marginBottom: "40px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: "10px 0" }}>{title}</h2>
      <div style={{
        display: "flex", overflowY: "hidden", overflowX: "scroll", padding: "20px 0",
        msOverflowStyle: "none", scrollbarWidth: "none"
      }}>
        {movies.map((movie) => (
          <div key={movie.id} onClick={() => onSelect(movie)} style={{ width: isLargeRow ? "180px" : "250px", marginRight: "15px", flexShrink: 0, cursor: "pointer", transition: "transform 450ms" }}>
            <img src={`${POSTER_BASE}${isLargeRow ? movie.poster_path : movie.backdrop_path}`} alt="" style={{ width: "100%", height: isLargeRow ? "260px" : "140px", objectFit: "cover", borderRadius: "4px" }} />
            <p style={{ marginTop: "8px", fontSize: "13px", textAlign: "center", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{movie.title || movie.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MovieModal({ movie, onClose }) {
  const [trailerId, setTrailerId] = useState("");
  useEffect(() => {
    async function fetchTrailer() {
      if (!movie) return;
      const endpoints = [`movie/${movie.id}`, `tv/${movie.id}`];
      let foundKey = "";
      for (const endpoint of endpoints) {
        try {
          const r = await fetch(`${BASE_URL}/${endpoint}/videos?api_key=${API_KEY}`);
          const d = await r.json();
          const t = d.results?.find(v => v.type === "Trailer" && v.site === "YouTube") || d.results?.[0];
          if (t?.key) { foundKey = t.key; break; }
        } catch { }
      }
      setTrailerId(foundKey);
    }
    fetchTrailer();
  }, [movie]);

  if (!movie) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#181818", width: "95%", maxWidth: "800px", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}>
          {trailerId ? <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`} frameBorder="0" allowFullScreen></iframe> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>No Trailer Available</div>}
        </div>
        <div style={{ padding: "30px", color: "white" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "15px" }}>{movie.title || movie.name}</h2>
          <p style={{ lineHeight: "1.6", color: "#ddd" }}>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Protected HomePage ────────────────────────── */

function HomePage() {
  const [mainMovie, setMainMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function fetchBanner() {
      const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`);
      const data = await response.json();
      setMainMovie(data.results[Math.floor(Math.random() * 10)]);
    }
    fetchBanner();
  }, []);

  const handleSearch = async (term) => {
    if (term.length > 2) {
      setIsSearching(true);
      const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${term}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } else {
      setIsSearching(false);
    }
  };

  return (
    <div className="app">
      <Navbar onSearch={handleSearch} />
      {!isSearching ? (
        <>
          <header style={{ height: "80vh", backgroundSize: "cover", backgroundImage: `url("${IMG_BASE}${mainMovie?.backdrop_path}")`, backgroundPosition: "center center", position: "relative" }}>
            <div style={{ marginLeft: "4%", paddingTop: "200px" }}>
              <h1 style={{ fontSize: "3.5rem", fontWeight: "bold" }}>{mainMovie?.title || mainMovie?.name}</h1>
              <p style={{ maxWidth: "450px", marginTop: "20px" }}>{mainMovie?.overview?.substr(0, 150)}...</p>
            </div>
          </header>
          <div style={{ marginTop: "-120px", position: "relative", zIndex: 5 }}>
            {requests.map((row, idx) => <Row key={row.title} title={row.title} fetchUrl={row.url} isLargeRow={idx === 1} onSelect={setSelectedMovie} />)}
          </div>
        </>
      ) : (
        <div style={{ paddingTop: "100px" }}>
          <Row title="Search Results" results={searchResults.filter(m => m.poster_path || m.backdrop_path)} onSelect={setSelectedMovie} />
        </div>
      )}
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </div>
  );
}

/* ─── Main App Router ────────────────────────────── */

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    // Small delay to prevent layout shift during token check
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
      <Route
        path="/"
        element={localStorage.getItem("userToken") ? <HomePage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
