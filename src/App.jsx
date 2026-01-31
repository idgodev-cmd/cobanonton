import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Search, Home, Trophy, ChevronLeft, Star, Info, X, Film,
  AlertCircle, Bug, SkipForward, SkipBack, Zap, Flame, ChevronDown,
  PlayCircle, Tv, Download, History, Trash2, Library, Eye, RefreshCw,
  Heart, Moon, Clock, FastForward, Rewind, Volume2, Sun, Award, HandMetal,
  Compass, Globe, WifiOff, Shuffle, Loader
} from 'lucide-react';
import api from './services/api';

// --- ERROR BOUNDARY COMPONENT ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0E0E10] text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan Tampilan</h2>
          <p className="text-gray-400 mb-6 text-sm">Silakan muat ulang halaman.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200"
          >
            Muat Ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- THEME CONFIG (Dark Cinema Minimal) ---
const THEME = {
  bg: "bg-[#0E0E10]",
  surface: "bg-[#16161A]",
  border: "border-[#242428]",
  textMain: "text-white",
  textSec: "text-[#A1A1AA]",
  accent: "text-[#E50914]",
  accentBg: "bg-[#E50914]",
};

// --- CATEGORY LIST (Mapped to API methods vaguely) ---
const CATEGORIES = [
  "Semua", "Indonesian Movie", "Indonesian Drama", "K-Drama", "Short TV", "Anime"
];

// --- BADGES LIST ---
const BADGES = [
  { id: 'newbie', name: 'Pendatang Baru', icon: '🌱', desc: 'Nonton episode pertama' },
  { id: 'marathon', name: 'Marathon', icon: '🏃', desc: 'Nonton 5 episode' },
  { id: 'nightowl', name: 'Begadang', icon: '🦉', desc: 'Nonton lewat jam 12 malam' },
  { id: 'collector', name: 'Kolektor', icon: '📚', desc: 'Simpan 3 drama ke daftar' }
];

// --- COMPONENTS ---

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#242428] rounded-lg ${className}`}></div>
);

// Modern Cinema Card with Progress & Watchlist
const DramaCard = ({ drama, onClick, className = "", aspect = "aspect-[2/3]", progress, onRemove }) => {
  const title = drama.title || "Judul Tidak Diketahui";
  const category = drama.genre || "Drama";
  const score = drama.rating || "New";
  const cover = drama.poster || "https://via.placeholder.com/300x450?text=No+Image";

  return (
    <div
      onClick={() => onClick(drama)}
      className={`relative group cursor-pointer overflow-hidden rounded-lg ${THEME.surface} border border-transparent hover:border-[#333] transition-all ${className}`}
    >
      <div className={`relative w-full h-full ${aspect}`}>
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => e.target.src = "https://via.placeholder.com/300x450?text=Error"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-transparent to-transparent opacity-80"></div>

        {progress && progress.duration > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
            <div
              className="h-full bg-red-600"
              style={{ width: `${Math.min((progress.time / progress.duration) * 100, 100)}%` }}
            ></div>
          </div>
        )}

        <div className={`absolute bottom-0 left-0 w-full p-3 ${progress ? 'mb-1' : ''}`}>
          <h3 className={`text-white text-[11px] font-bold leading-tight line-clamp-1 mb-1 group-hover:${THEME.accent} transition-colors`}>
            {title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
            {progress ? (
              <span className="text-[9px] text-red-400 font-medium">Lanjut Eps {progress.episodeIdx + 1}</span>
            ) : (
              <>
                <span className={`${THEME.accentBg} text-white px-1 py-[1px] rounded-[2px] text-[8px] font-bold tracking-wider`}>
                  HD
                </span>
                <span className="truncate">{category}</span>
              </>
            )}
          </div>
        </div>

        {score && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/5">
              <Star size={8} className="text-yellow-500" fill="currentColor" /> {score}
            </div>
          </div>
        )}

        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 left-2 bg-black/60 p-1.5 rounded-full text-white/70 hover:text-red-500 hover:bg-white/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

// 3. Main App Component Logic
function DramaStreamApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [subTab, setSubTab] = useState('history');
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [currentView, setCurrentView] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Infinite Scroll State
  const [explorePage, setExplorePage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // --- PERSISTED STATE ---
  const getPersistedState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error parsing ${key}`, e);
      return defaultValue;
    }
  };

  const [history, setHistory] = useState(() => getPersistedState('cobanonton_history', []));
  const [watchlist, setWatchlist] = useState(() => getPersistedState('cobanonton_watchlist', []));
  const [watchedEpisodes, setWatchedEpisodes] = useState(() => getPersistedState('cobanonton_watched', {}));
  const [playbackProgress, setPlaybackProgress] = useState(() => getPersistedState('cobanonton_progress', {}));
  const [earnedBadges, setEarnedBadges] = useState(() => getPersistedState('cobanonton_badges', []));

  // --- PLAYER STATE ---
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVideoIframe, setIsVideoIframe] = useState(false); // New state to handle iframe vs video
  const [dramaDetail, setDramaDetail] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [showControls, setShowControls] = useState(true);

  // Gesture & Hint State
  const [gestureStatus, setGestureStatus] = useState(null);
  const [playerVolume, setPlayerVolume] = useState(1);
  const [playerBrightness, setPlayerBrightness] = useState(1);
  const [showGestureHint, setShowGestureHint] = useState(false);
  const touchStartRef = useRef(null);
  const videoRef = useRef(null);

  // Next Episode Preview State
  const [showNextPreview, setShowNextPreview] = useState(false);
  const [nextPreviewDismissed, setNextPreviewDismissed] = useState(false);

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Data States
  const [homeData, setHomeData] = useState([]);
  const [newData, setNewData] = useState([]);
  const [rankData, setRankData] = useState([]);
  const [exploreData, setExploreData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const heroDrama = homeData.length > 0 ? homeData[0] : null;

  // --- HELPER: Normalize Data ---
  // Maps Zeldvorik response items to our internal schema
  const normalizeDrama = (item) => {
    if (!item) return null;

    // Normalize episodes if they exist in various formats
    let eps = item.episodes || [];
    if (!eps.length && item.seasons) {
      eps = item.seasons.flatMap(s => s.episodes || []);
    }

    return {
      // Keep original data first so we can override
      ...item,
      id: item.detailPath || item.endpoint || item.cur_url, // Unique ID for detail fetch
      title: item.title,
      poster: item.poster || item.img || item.image,
      genre: item.genre,
      rating: item.rating || item.score || "New",
      year: item.year,
      // For details
      description: item.description || "Sinopsis belum tersedia.",
      // Override episodes with our normalized list
      episodes: eps,
      seasons: item.seasons || []
    };
  };

  // --- EFFECT: System Setup ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- GAMIFICATION LOGIC ---
  useEffect(() => {
    const checkBadges = () => {
      const newBadges = [...earnedBadges];
      let updated = false;
      const totalWatched = Object.values(watchedEpisodes).flat().length;
      if (totalWatched >= 1 && !newBadges.includes('newbie')) { newBadges.push('newbie'); updated = true; }
      if (totalWatched >= 5 && !newBadges.includes('marathon')) { newBadges.push('marathon'); updated = true; }
      if (watchlist.length >= 3 && !newBadges.includes('collector')) { newBadges.push('collector'); updated = true; }
      if (updated) {
        setEarnedBadges(newBadges);
        localStorage.setItem('cobanonton_badges', JSON.stringify(newBadges));
      }
    };
    checkBadges();
  }, [watchedEpisodes, watchlist]);

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    const loadHome = async () => {
      setLoading(true);
      setError(null);

      try {
        const [trendingRes, indoMoviesRes] = await Promise.all([
          api.fetchTrending(1),
          api.fetchIndonesianMovies(1)
        ]);

        if (trendingRes.items) {
          setHomeData(trendingRes.items.map(normalizeDrama));
        }

        if (indoMoviesRes.items) {
          setNewData(indoMoviesRes.items.map(normalizeDrama));
        }

      } catch (err) {
        console.error("Home Load Error", err);
        setError("Gagal memuat data dari server. Cek koneksi Anda.");
      }

      setLoading(false);
    };

    if (activeTab === 'home') loadHome();
  }, [activeTab]);

  // --- EXPLORE LOADING ---
  useEffect(() => {
    const initExplore = async () => {
      if (activeTab === 'explore' && exploreData.length === 0) {
        setLoading(true);
        try {
          // Initial explore data - mix of different categories potentially
          const res = await api.fetchIndonesianDrama(1);
          if (res.items) {
            setExploreData(res.items.map(normalizeDrama));
            setExplorePage(2);
          }
        } catch (e) {
          console.error(e);
          setError("Gagal memuat jelajah.");
        } finally {
          setLoading(false);
        }
      }
    };
    if (activeTab === 'explore') initExplore();
  }, [activeTab, exploreData.length]);

  // Infinite Scroll Listener
  useEffect(() => {
    if (activeTab !== 'explore') return;

    const handleScroll = async () => {
      if (isFetchingMore || loading) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setIsFetchingMore(true);
        try {
          // Simple logic: keep fetching Indonesian Drama for explore, or rotate
          const data = await api.fetchIndonesianDrama(explorePage);
          if (data.items && data.items.length > 0) {
            setExploreData(prev => {
              const combined = [...prev, ...data.items.map(normalizeDrama)];
              // Dedupe by id
              const unique = combined.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);
              return unique;
            });
            setExplorePage(prev => prev + 1);
          }
        } catch (e) {
          console.log("End of stream or error");
        } finally {
          setIsFetchingMore(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, explorePage, isFetchingMore, loading]);

  // Rank Data - let's use Top Rated or similar if available, or just reuse Trending
  useEffect(() => {
    const loadRank = async () => {
      if (activeTab === 'rank' && rankData.length === 0) {
        setLoading(true);
        try {
          const res = await api.fetchTrending(1); // Reusing trending for Rank
          if (res.items) {
            setRankData(res.items.map(normalizeDrama));
          }
        } catch (e) { } finally { setLoading(false); }
      }
    };
    if (activeTab === 'rank') loadRank();
  }, [activeTab]);

  const performSearch = async (query) => {
    if (!query) return;
    setLoading(true);
    setSearchQuery(query);

    try {
      const res = await api.search(query);
      if (res.items) {
        setSearchResults(res.items.map(normalizeDrama));
      } else if (res.data) {
        setSearchResults(res.data.map(normalizeDrama));
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.error("Search error", e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab('search');
    performSearch(searchQuery);
  };

  const openDrama = async (drama) => {
    saveToHistory(drama);
    setSelectedDrama(drama);
    setCurrentView('detail');
    setLoading(true);
    setDramaDetail(null);
    setChapters([]);

    const id = drama.id || drama.detailPath;

    try {
      const res = await api.fetchDetail(id);

      // Handle response structure variations
      const rawData = res.data || res;
      if (rawData) {
        const detail = normalizeDrama(rawData);
        setDramaDetail(detail);

        // Extract chapters/episodes
        let eps = detail.episodes || [];

        // Zeldvorik sometimes returns episodes in 'chapters' or 'list_episode'
        if (eps.length === 0 && rawData.chapters) eps = rawData.chapters;
        if (eps.length === 0 && rawData.list_episode) eps = rawData.list_episode;

        // Normalize episodes structure
        const normalizedChapters = eps.map((ep, idx) => ({
          id: ep.id || `ep_${idx}`,
          index: idx + 1,
          title: ep.title || `Episode ${idx + 1}`,
          playerUrl: ep.playerUrl || ep.url || ep.link || ep.stream_url, // Try various fields
          ...ep
        }));

        setChapters(normalizedChapters);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat detail.");
    } finally {
      setLoading(false);
    }
  };

  const playEpisode = async (chapter, index) => {
    if (!selectedDrama) return;
    const dramaId = selectedDrama.id;

    // Gamification
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4 && !earnedBadges.includes('nightowl')) {
      const newBadges = [...earnedBadges, 'nightowl'];
      setEarnedBadges(newBadges);
      localStorage.setItem('cobanonton_badges', JSON.stringify(newBadges));
    }

    saveToHistory(selectedDrama);
    markEpisodeWatched(dramaId, index);

    setCurrentChapter(chapter);
    setCurrentView('player');
    setLoading(true);
    setVideoUrl(null);
    setError(null);
    setPlaybackSpeed(1);
    setShowNextPreview(false);
    setNextPreviewDismissed(false);
    setIsVideoIframe(false);

    try {
      const targetUrl = chapter.playerUrl;

      if (targetUrl) {
        setVideoUrl(targetUrl);
        // Robust check for iframes:
        // 1. Zeldvorik player.php is a PAGE, so it must be an iframe.
        // 2. /embed/ URLs are iframes.
        // 3. .html URLs are iframes.
        // 4. If it doesn't end in .mp4/.m3u8, default to iframe.
        const isEmbed = targetUrl.includes('player.php') || targetUrl.includes('embed') || targetUrl.includes('.html') || !targetUrl.match(/\.(mp4|m3u8)(\?.*)?$/i);
        setIsVideoIframe(isEmbed);
      } else {
        setError(`Link episode tidak ditemukan.`);
      }
    } catch (err) {
      setError("Gagal memuat video.");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (drama) => {
    if (!drama) return;
    setHistory(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const filtered = safePrev.filter(h => h.id !== drama.id);
      const updated = [drama, ...filtered].slice(0, 50);
      localStorage.setItem('cobanonton_history', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleWatchlist = (drama) => {
    const id = drama.id;
    setWatchlist(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const exists = safePrev.find(w => w.id === id);
      let updated;
      if (exists) {
        updated = safePrev.filter(w => w.id !== id);
      } else {
        updated = [drama, ...safePrev];
      }
      localStorage.setItem('cobanonton_watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProgress = (dramaId, episodeIdx, time, duration) => {
    setPlaybackProgress(prev => {
      const updated = { ...prev, [dramaId]: { episodeIdx, time, duration, lastUpdated: Date.now() } };
      localStorage.setItem('cobanonton_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const markEpisodeWatched = (dramaId, episodeIndex) => {
    setWatchedEpisodes(prev => {
      const current = prev[dramaId] || [];
      if (current.includes(episodeIndex)) return prev;
      const updated = { ...prev, [dramaId]: [...current, episodeIndex] };
      localStorage.setItem('cobanonton_watched', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    if (window.confirm("Hapus semua riwayat tontonan?")) {
      setHistory([]); localStorage.removeItem('cobanonton_history');
    }
  };

  const handleCategoryClick = async (categoryName) => {
    setSelectedCategory(categoryName);
    setIsCategoryOpen(false);
    if (categoryName === "Semua") {
      setActiveTab('home');
    } else {
      setActiveTab('search'); // Use search view for category for now, or implement category fetch

      // Map category name to API call if possible, else search
      setLoading(true);
      setSearchQuery(categoryName);
      let res;
      try {
        // Mapping text to API calls
        if (categoryName === "Indonesian Movie") res = await api.fetchIndonesianMovies(1);
        else if (categoryName === "Indonesian Drama") res = await api.fetchIndonesianDrama(1);
        else if (categoryName === "K-Drama") res = await api.fetchKDrama(1);
        else if (categoryName === "Short TV") res = await api.fetchShortTV(1);
        else if (categoryName === "Anime") res = await api.fetchAnime(1);
        else res = await api.search(categoryName);

        if (res.items) {
          setSearchResults(res.items.map(normalizeDrama));
        } else {
          setSearchResults([]);
        }
      } catch (e) {
        console.error(e);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const dismissGestureHint = () => {
    setShowGestureHint(false);
    localStorage.setItem('gesture_hint_seen', 'true');
  };

  const handleDoubleTap = (side) => {
    if (videoRef.current) {
      const skipAmount = 10;
      videoRef.current.currentTime += side === 'right' ? skipAmount : -skipAmount;
    }
  };

  const handleTouchStart = (e) => {
    if (isVideoIframe) return; // Disable gestures for iframe
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      valVol: playerVolume,
      valBright: playerBrightness
    };
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current || !videoRef.current || isVideoIframe) return;

    const deltaY = touchStartRef.current.y - e.touches[0].clientY;
    const screenWidth = window.innerWidth;
    const touchX = e.touches[0].clientX;
    const sensitivity = 0.005;

    if (touchX < screenWidth / 2) {
      let newBright = touchStartRef.current.valBright + (deltaY * sensitivity);
      newBright = Math.max(0.3, Math.min(1, newBright));
      setPlayerBrightness(newBright);
      setGestureStatus({ type: 'brightness', value: newBright });
    } else {
      let newVol = touchStartRef.current.valVol + (deltaY * sensitivity);
      newVol = Math.max(0, Math.min(1, newVol));
      videoRef.current.volume = newVol;
      setPlayerVolume(newVol);
      setGestureStatus({ type: 'volume', value: newVol });
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setTimeout(() => setGestureStatus(null), 1000);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && selectedDrama && !isVideoIframe) {
      const dramaId = selectedDrama.id;
      const currentIdx = chapters.findIndex(c => c === currentChapter);
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      updateProgress(dramaId, currentIdx, currentTime, duration);
      const timeLeft = duration - currentTime;
      const hasNext = currentIdx < chapters.length - 1;
      if (timeLeft < 20 && timeLeft > 0 && hasNext && !showNextPreview && !nextPreviewDismissed) {
        setShowNextPreview(true);
      }
      if (timeLeft <= 0.5) setShowNextPreview(false);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current && selectedDrama && !isVideoIframe) {
      const dramaId = selectedDrama.id;
      const saved = playbackProgress[dramaId];
      const currentIdx = chapters.findIndex(c => c === currentChapter);
      if (saved && saved.episodeIdx === currentIdx && saved.time > 5) {
        videoRef.current.currentTime = saved.time;
      }
      setPlayerVolume(videoRef.current.volume);
    }
  };

  const toggleSleepTimer = () => {
    if (sleepTimer) setSleepTimer(null);
    else setSleepTimer(30);
  };

  useEffect(() => {
    if (sleepTimer !== null) {
      if (sleepTimer <= 0) {
        if (videoRef.current) {
          videoRef.current.pause();
          setSleepTimer(null);
          alert("Sleep Timer: Video dihentikan.");
        }
      } else {
        const id = setTimeout(() => setSleepTimer(prev => prev - 1), 60000);
        return () => clearTimeout(id);
      }
    }
  }, [sleepTimer]);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('pwa_dismissed')) setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  // --- UI RENDER ---

  if (currentView === 'player') {
    const currentIdx = chapters.findIndex(c => c === currentChapter);
    const hasNext = currentIdx < chapters.length - 1;
    const hasPrev = currentIdx > 0;

    return (
      <div className={`fixed inset-0 z-[999] bg-black font-sans`}>
        {isLightsOff && <div className="absolute inset-0 bg-black z-40 pointer-events-none"></div>}

        {/* GESTURE HINT OVERLAY (ONBOARDING) - Only show if not iframe */}
        {showGestureHint && !isVideoIframe && (
          <div className="absolute inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center text-white" onClick={dismissGestureHint}>
            <div className="flex w-full max-w-md px-10 justify-between">
              <div className="flex flex-col items-center gap-4">
                <div className="w-1 bg-white/20 h-32 rounded-full relative overflow-hidden">
                  <div className="absolute bottom-0 w-full h-1/2 bg-white animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center">
                  <Sun size={32} />
                  <span className="text-xs font-bold text-center mt-2">Geser Kiri<br />Kecerahan</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-1 bg-white/20 h-32 rounded-full relative overflow-hidden">
                  <div className="absolute bottom-0 w-full h-1/2 bg-white animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center">
                  <Volume2 size={32} />
                  <span className="text-xs font-bold text-center mt-2">Geser Kanan<br />Volume</span>
                </div>
              </div>
            </div>
            <div className="mt-12 animate-bounce bg-white/10 px-6 py-2 rounded-full text-sm font-bold">
              Ketuk layar untuk mulai
            </div>
          </div>
        )}

        {gestureStatus && !isVideoIframe && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md p-4 rounded-full text-white flex flex-col items-center">
              {gestureStatus.type === 'volume' ? <Volume2 size={32} /> : <Sun size={32} />}
              <span className="font-bold mt-1">{Math.round(gestureStatus.value * 100)}%</span>
            </div>
          </div>
        )}

        {showNextPreview && !isVideoIframe && (
          <div className="absolute bottom-24 right-4 z-[60] bg-[#16161A] border border-[#242428] p-4 rounded-xl shadow-2xl animate-in slide-in-from-right-10 w-64">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Selanjutnya</span>
              <button onClick={() => { setShowNextPreview(false); setNextPreviewDismissed(true); }} className="text-white hover:text-red-500"><X size={14} /></button>
            </div>
            <h4 className="text-white font-bold text-sm mb-3 line-clamp-1">Episode {currentIdx + 2}</h4>
            <div className="flex gap-2">
              <button
                onClick={() => playEpisode(chapters[currentIdx + 1], currentIdx + 1)}
                className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-gray-200"
              >
                Putar Sekarang
              </button>
              <button
                onClick={() => { setShowNextPreview(false); setNextPreviewDismissed(true); }}
                className="px-3 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        <div className={`absolute top-0 left-0 w-full p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-50 transition-opacity duration-300 pointer-events-none`}>
          <button onClick={() => setCurrentView('detail')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 pointer-events-auto"><ChevronLeft size={24} /></button>

          {/* Custom Header info only for native player */}
          {!isVideoIframe && (
            <>
              <div className="text-white/90 text-sm font-bold tracking-wider drop-shadow-md flex flex-col items-center pointer-events-auto">
                <span>Eps {currentIdx + 1}</span>
                {sleepTimer && <span className="text-[10px] text-red-400 flex items-center gap-1"><Clock size={10} /> {sleepTimer}m</span>}
              </div>
              <div className="flex gap-3 pointer-events-auto">
                <button onClick={toggleSleepTimer} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${sleepTimer ? 'bg-red-600 text-white' : 'bg-white/10 text-white'}`}><Moon size={18} /></button>
                <button onClick={() => setIsLightsOff(!isLightsOff)} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${isLightsOff ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}><Zap size={18} fill={isLightsOff ? "currentColor" : "none"} /></button>
              </div>
            </>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black z-0"
          onClick={() => !isVideoIframe && setShowControls(!showControls)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}>

          {/* Gestures only on video element */}
          {!isVideoIframe && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-[30%] z-20" onDoubleClick={(e) => { e.stopPropagation(); handleDoubleTap('left'); }}></div>
              <div className="absolute right-0 top-0 bottom-0 w-[30%] z-20" onDoubleClick={(e) => { e.stopPropagation(); handleDoubleTap('right'); }}></div>
            </>
          )}

          {loading ? (
            <div className="flex flex-col items-center gap-4 relative z-30">
              <div className={`w-12 h-12 border-4 border-[#242428] border-t-[${THEME.accentBg}] rounded-full animate-spin border-t-red-600`}></div>
              <p className="text-[#A1A1AA] text-xs font-bold tracking-[0.2em]">MEMUAT...</p>
            </div>
          ) : videoUrl ? (
            isVideoIframe ? (
              <iframe
                src={videoUrl}
                className="w-full h-full relative z-10"
                frameBorder="0"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="origin"
              ></iframe>
            ) : (
              <video
                ref={videoRef} src={videoUrl} controls={false} controlsList="nodownload" autoPlay playsInline webkit-playsinline="true"
                className="w-full h-full max-h-screen object-contain"
                style={{ filter: `brightness(${playerBrightness})` }}
                onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleVideoLoaded} onError={() => setError("Gagal memuat stream.")}
                onRateChange={(e) => setPlaybackSpeed(e.target.playbackRate)}
              />
            )
          ) : (
            <div className="text-center p-6 relative z-30"><AlertCircle className="mx-auto mb-3 text-red-600" size={32} /><p className="text-[#A1A1AA] text-sm mb-4">Video tidak tersedia.</p><button onClick={() => setCurrentView('detail')} className="px-6 py-2 bg-[#242428] rounded-full text-white text-xs font-bold hover:bg-[#333]">KEMBALI</button></div>
          )}
        </div>

        {/* Custom Controls Bar - HIDDEN for iframe to avoid blocking native controls */}
        {!isVideoIframe && (
          <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-10 z-50 transition-transform duration-300 ${!showControls ? 'translate-y-full' : 'translate-y-0'}`}>
            {/* Native controls for our custom video player only */}
            {videoRef.current && !isVideoIframe && (
              <div className="flex items-center justify-between text-white mb-6 px-2">
                <div className="flex gap-4 items-center">
                  <button onClick={(e) => { e.stopPropagation(); if (videoRef.current.paused) videoRef.current.play(); else videoRef.current.pause(); }}>
                    {videoRef.current?.paused ? <Play fill="currentColor" size={28} /> : <div className="w-6 h-6 bg-white rounded-sm"></div>}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const speeds = [1, 1.25, 1.5, 2];
                      const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                      const nextSpeed = speeds[nextIdx];
                      videoRef.current.playbackRate = nextSpeed;
                      setPlaybackSpeed(nextSpeed);
                    }}
                    className="text-xs font-bold border border-white/30 px-2.5 py-1 rounded hover:bg-white/20"
                  >
                    {playbackSpeed}x
                  </button>
                </div>
                <div className="flex gap-6 text-xs text-gray-400 font-medium">
                  <button onClick={(e) => { e.stopPropagation(); videoRef.current.currentTime -= 10; }} className="flex items-center gap-1 hover:text-white"><Rewind size={14} /> -10s</button>
                  <button onClick={(e) => { e.stopPropagation(); videoRef.current.currentTime += 10; }} className="flex items-center gap-1 hover:text-white">+10s <FastForward size={14} /></button>
                </div>
              </div>
            )}

            <div className={`flex items-center justify-between gap-4 ${isVideoIframe ? 'opacity-80' : ''}`}>
              <button disabled={!hasPrev} onClick={() => hasPrev && playEpisode(chapters[currentIdx - 1], currentIdx - 1)} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${!hasPrev ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}`}><SkipBack size={18} /> Prev</button>
              <button disabled={!hasNext} onClick={() => hasNext && playEpisode(chapters[currentIdx + 1], currentIdx + 1)} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${!hasNext ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/30'}`}>Next <SkipForward size={18} /></button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'detail') {
    const dramaId = dramaDetail?.id || selectedDrama?.id;
    const watchedList = watchedEpisodes[dramaId] || [];
    const isSaved = watchlist.some(w => w.id === dramaId);
    const progress = playbackProgress[dramaId];
    // For progress logic, if we have stored progress, use it.
    const resumeIdx = progress ? progress.episodeIdx : 0;

    return (
      <div className={`min-h-screen ${THEME.bg} text-white pb-20 font-sans`}>
        <div className="relative h-[55vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0E10]/60 to-[#0E0E10] z-10"></div>
          <img src={dramaDetail?.poster || selectedDrama.poster || "https://via.placeholder.com/800x400"} className="w-full h-full object-cover" alt="Cover" />
          <button onClick={() => setCurrentView('main')} className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/5 z-20 hover:bg-black/60"><ChevronLeft size={24} /></button>
        </div>

        <div className="px-5 -mt-20 relative z-20">
          <h1 className="text-3xl md:text-4xl font-black leading-tight text-white mb-3 drop-shadow-xl">{dramaDetail?.title || selectedDrama.title}</h1>
          <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mb-6 font-medium">
            <span className={`${THEME.accent} font-bold`}>{dramaDetail?.rating ? `${dramaDetail.rating} Match` : 'New'}</span>
            <span>•</span>
            <span>{dramaDetail?.genre || selectedDrama.genre || "Drama"}</span>
            <span>•</span>
            <span className={`border border-[#333] px-1 rounded text-[10px]`}>HD</span>
          </div>

          <div className="flex gap-3 mb-6">
            <button onClick={() => chapters.length > 0 && playEpisode(chapters[resumeIdx], resumeIdx)} className={`flex-1 py-4 bg-white text-black font-bold rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg`}>
              <Play fill="black" size={20} /> {progress ? `Lanjut Eps ${resumeIdx + 1}` : 'Putar'}
            </button>
            <button onClick={() => toggleWatchlist(selectedDrama)} className="px-4 bg-[#16161A] border border-[#333] rounded flex items-center justify-center hover:bg-[#242428] transition-colors"><Heart size={24} fill={isSaved ? "#E50914" : "none"} className={isSaved ? "text-[#E50914]" : "text-white"} /></button>
          </div>

          <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8 line-clamp-4">{dramaDetail?.description || selectedDrama.description || "Sinopsis tidak tersedia."}</p>

          <div className="border-t border-[#242428] pt-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex justify-between items-center">Episode <span className="text-[10px] text-[#555] normal-case tracking-normal">{watchedList.length} / {chapters.length}</span></h3>

            {chapters.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {chapters.map((ch, idx) => {
                  const isWatched = watchedList.includes(idx);
                  return (
                    <button key={ch.id || idx} onClick={() => playEpisode(ch, idx)} className={`relative bg-[#16161A] hover:bg-[#242428] border border-[#242428] rounded py-3 text-xs font-bold transition-colors ${isWatched ? 'text-[#555]' : 'text-white'} ${currentChapter === ch ? 'border-red-600 text-red-500' : ''}`}>
                      {ch.index || idx + 1}
                      {isWatched && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full shadow-sm"></div>}
                    </button>
                  );
                })
                }
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">Memuat episode...</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.textMain} pb-24 font-sans relative`}>
      {/* HEADER NAVBAR */}
      <div className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 px-4 py-3 flex items-center justify-between ${scrolled ? 'bg-[#0E0E10]/95 backdrop-blur-md border-b border-[#242428]' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
        <div className="flex items-center gap-6">
          <div className="cursor-pointer block" onClick={() => setActiveTab('home')}>
            <div className="flex items-center gap-1">
              <Tv size={22} className={THEME.accent} strokeWidth={2.5} />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 font-black text-lg tracking-tighter">COBANONTON</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {['home', 'explore', 'search', 'rank', 'history'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'home') setSelectedCategory('Semua') }} className={`hover:text-white transition-colors capitalize ${activeTab === tab ? 'text-white font-bold' : 'text-[#A1A1AA]'}`}>{tab}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsCategoryOpen(true)} className="text-xs font-bold text-white/80 hover:text-white border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors flex items-center gap-1">Genre <ChevronDown size={10} /></button>
          <button onClick={() => setActiveTab('search')} className="md:hidden p-1 rounded-full hover:bg-white/10 transition-colors"><Search size={22} className="text-white" /></button>
        </div>
      </div>

      {/* CATEGORY MODAL */}
      {isCategoryOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0E0E10]/98 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col pt-24 px-6">
          <button onClick={() => setIsCategoryOpen(false)} className="absolute top-6 right-6 p-2 bg-[#242428] rounded-full text-white hover:bg-[#333]"><X size={24} /></button>
          <h2 className="text-2xl font-black text-white mb-8 text-center">Pilih Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto pb-20 no-scrollbar">
            {CATEGORIES.map((cat, idx) => (
              <button key={idx} onClick={() => handleCategoryClick(cat)} className={`py-4 px-4 text-center text-sm font-medium rounded-lg transition-all ${selectedCategory === cat ? 'bg-[#E50914] text-white' : 'bg-[#16161A] text-[#A1A1AA] hover:bg-[#242428] hover:text-white'}`}>{cat}</button>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="pb-10 pt-16">
        {activeTab === 'home' && (
          <>
            {heroDrama && !loading ? (
              <div className="relative w-full h-[70vh] mb-8 mt-[-64px]">
                <img src={heroDrama.poster} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E10]/30 via-transparent to-[#0E0E10]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 pb-12 flex flex-col items-center text-center z-10">
                  <div className="mb-4 flex gap-2"><span className={`text-[9px] font-bold uppercase tracking-widest text-white/90 px-2 py-1 rounded bg-white/10 backdrop-blur`}>{heroDrama.genre}</span></div>
                  <h1 className="text-4xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-none max-w-4xl tracking-tight">{heroDrama.title}</h1>
                  <div className="flex gap-3 w-full max-w-sm">
                    <button onClick={() => openDrama(heroDrama)} className="flex-1 bg-white text-black py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"><Play fill="black" size={18} /> Putar</button>
                    <button onClick={() => openDrama(heroDrama)} className="flex-1 bg-[#242428]/80 backdrop-blur-md text-white py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 hover:bg-[#333] transition-all active:scale-95"><Info size={18} /> Info</button>
                  </div>
                </div>
              </div>
            ) : <div className="h-[70vh] w-full bg-[#16161A] animate-pulse mb-8 mt-[-64px]"></div>}

            <div className="px-5 space-y-10 -mt-6 relative z-10">
              <section>
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider"><Globe size={16} className={THEME.accent} /> Discover All</h2>
                {loading && homeData.length === 0 ? <div className="grid grid-cols-3 gap-2"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : (
                  homeData.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {homeData.slice(0, 15).map((drama, idx) => {
                        const progress = playbackProgress[drama.id];
                        return <DramaCard key={idx} drama={drama} onClick={openDrama} progress={progress} />;
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                      <WifiOff size={48} className="mb-2" />
                      <p className="text-xs">Gagal memuat konten</p>
                    </div>
                  )
                )}
              </section>
              {newData.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Baru Ditambahkan</h2>
                  <div className="flex overflow-x-auto gap-3 pb-4 -mx-5 px-5 no-scrollbar">
                    {newData.map((drama, idx) => <DramaCard key={idx} drama={drama} onClick={openDrama} className="w-28 flex-shrink-0" />)}
                  </div>
                </section>
              )}
            </div>
          </>
        )}

        {/* EXPLORE TAB */}
        {activeTab === 'explore' && (
          <div className="p-5 min-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2"><Compass className="text-red-600" /> Jelajah</h2>
              <button onClick={() => { setExploreData([]); setExplorePage(1); }} className="text-[#A1A1AA] hover:text-white transition-colors"><RefreshCw size={18} /></button>
            </div>

            {loading && exploreData.length === 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
              </div>
            ) : exploreData.length > 0 ? (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                  {exploreData.map((drama, idx) => <DramaCard key={`${drama.id}-${idx}`} drama={drama} onClick={openDrama} />)}
                </div>
                {isFetchingMore && (
                  <div className="flex justify-center py-4">
                    <Loader className="animate-spin text-red-600" size={24} />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
                <Compass size={48} className="mb-4 opacity-20" />
                <p className="text-sm mb-4">Tidak dapat memuat jelajah.</p>
                <button onClick={() => { setExploreData([]); setExplorePage(1); setActiveTab('explore'); }} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full">Coba Lagi</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="p-5 min-h-[90vh]">
            <form onSubmit={handleSearchSubmit} className="relative mb-8">
              <input type="text" placeholder="Cari judul, genre..." className="w-full bg-[#16161A] border-none rounded-sm py-4 pl-12 pr-4 text-white text-sm focus:ring-1 focus:ring-white/20 transition-all placeholder:text-[#555] font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              <button type="submit" className="absolute left-4 top-4 text-[#555]"><Search size={20} /></button>
            </form>
            <h2 className="text-sm font-bold mb-4 text-[#A1A1AA] uppercase tracking-wider">{searchQuery ? `Hasil Pencarian` : "Jelajahi"}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {loading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />) : searchResults.length > 0 ? searchResults.map((drama, idx) => <DramaCard key={idx} drama={drama} onClick={openDrama} />) : <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-30"><Film size={48} className="mb-4" /><p className="text-sm">Tidak ada drama ditemukan.</p></div>}
            </div>
          </div>
        )}

        {/* RANK TAB */}
        {activeTab === 'rank' && (
          <div className="p-5 min-h-[90vh]">
            <h2 className="text-2xl font-black text-white mb-1 text-center">TOP 10</h2>
            <p className="text-center text-[10px] text-[#A1A1AA] mb-8 font-bold tracking-[0.2em] uppercase">Indonesia Hari Ini</p>
            <div className="space-y-2 max-w-xl mx-auto">
              {rankData.map((drama, idx) => (
                <div key={idx} onClick={() => openDrama(drama)} className="flex items-center gap-4 bg-[#16161A] hover:bg-[#242428] p-3 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-[#333]">
                  <span className={`text-4xl font-black w-10 text-center ${idx < 3 ? THEME.accent : 'text-[#333]'} tracking-tighter`}>{idx + 1}</span>
                  <img src={drama.poster} className="w-16 h-20 object-cover rounded-sm" alt={drama.title} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate mb-1">{drama.title}</h3>
                    <div className="flex items-center gap-2"><span className="text-[9px] bg-[#242428] px-1.5 py-0.5 rounded text-[#A1A1AA]">{drama.genre}</span><span className="text-[9px] text-[#46d369] font-bold flex items-center gap-0.5"><Star size={8} fill="currentColor" /> {drama.rating}</span></div>
                  </div>
                  <PlayCircle size={24} className="text-[#333] group-hover:text-white transition-colors mr-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="p-5 min-h-[90vh]">
            <div className="flex items-center gap-4 mb-6 border-b border-[#242428] pb-2">
              <button onClick={() => setSubTab('history')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${subTab === 'history' ? 'text-white border-red-600' : 'text-[#555] border-transparent'}`}>Riwayat</button>
              <button onClick={() => setSubTab('watchlist')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${subTab === 'watchlist' ? 'text-white border-red-600' : 'text-[#555] border-transparent'}`}>Daftar Saya</button>
              <button onClick={() => setSubTab('badges')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${subTab === 'badges' ? 'text-white border-red-600' : 'text-[#555] border-transparent'}`}>Pencapaian</button>
            </div>
            {subTab === 'history' && (
              <>
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-[#A1A1AA]">Terakhir Ditonton</h3>{history.length > 0 && <button onClick={clearHistory} className="text-[#A1A1AA] text-xs hover:text-white flex items-center gap-1"><Trash2 size={12} /> Hapus</button>}</div>
                {history.length > 0 ? <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{history.map((drama, idx) => { const progress = playbackProgress[drama.id]; return <DramaCard key={idx} drama={drama} onClick={openDrama} progress={progress} />; })}</div> : <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]"><History size={48} className="mb-4 opacity-20" /><p className="text-sm">Belum ada riwayat tontonan.</p></div>}
              </>
            )}
            {subTab === 'watchlist' && (
              <>
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-[#A1A1AA]">Disimpan</h3></div>
                {watchlist.length > 0 ? <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{watchlist.map((drama, idx) => <DramaCard key={idx} drama={drama} onClick={openDrama} onRemove={() => toggleWatchlist(drama)} />)}</div> : <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]"><Heart size={48} className="mb-4 opacity-20" /><p className="text-sm">Belum ada drama favorit.</p></div>}
              </>
            )}
            {subTab === 'badges' && (
              <div className="grid grid-cols-2 gap-4">
                {BADGES.map((badge) => {
                  const isUnlocked = earnedBadges.includes(badge.id);
                  return <div key={badge.id} className={`p-4 rounded-xl border ${isUnlocked ? 'bg-[#1a1a1a] border-yellow-500/50' : 'bg-[#111] border-[#222] opacity-50'} flex flex-col items-center text-center gap-2`}><div className="text-3xl mb-1">{badge.icon}</div><div><h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{badge.name}</h4><p className="text-[10px] text-gray-400">{badge.desc}</p></div>{isUnlocked ? <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded font-bold">TERBUKA</span> : <span className="text-[9px] text-gray-600 font-bold">TERKUNCI</span>}</div>
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PWA INSTALL PROMPT (Bento Style) */}
      {showInstallBanner && (
        <div className="fixed bottom-20 left-4 right-4 z-[55] animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-[#16161A]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg">
                <Tv size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm leading-tight">Install App</h4>
                <p className="text-[#A1A1AA] text-[10px] font-medium">Akses lebih cepat & hemat kuota</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowInstallBanner(false); localStorage.setItem('pwa_dismissed', 'true'); }} className="p-2 rounded-full hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"><X size={18} /></button>
              <button onClick={handleInstallClick} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors shadow-lg active:scale-95">Install</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVBAR */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0E0E10]/95 backdrop-blur-md border-t border-[#242428] flex justify-around py-3 z-50 pb-safe">
        {[
          { id: 'home', icon: Home, label: 'Beranda' },
          { id: 'explore', icon: Compass, label: 'Jelajah' },
          { id: 'search', icon: Search, label: 'Cari' },
          { id: 'rank', icon: Trophy, label: 'Top' },
          { id: 'history', icon: Library, label: 'Pustaka' }
        ].map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); if (item.id === 'home') setSelectedCategory("Semua"); window.scrollTo(0, 0); }} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === item.id ? 'text-white' : 'text-[#555] hover:text-[#999]'}`}>
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} fill={activeTab === item.id && item.id !== 'search' && item.id !== 'explore' ? "currentColor" : "none"} />
            <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Export the App wrapped in ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary>
      <DramaStreamApp />
    </ErrorBoundary>
  );
}
