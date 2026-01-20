import React, { useState, useEffect, useRef } from 'react';
import { Play, Search, Home, Trophy, List, ChevronLeft, Star, Clock, Info, X, Film, AlertCircle, RefreshCw, Bug, SkipForward, SkipBack, Zap, LayoutGrid, Flame, ChevronDown, PlayCircle, Tv, Download, History, Trash2, Library, Eye } from 'lucide-react';

// --- API CONSTANTS ---
const API_BASE = "https://dramabos.asia/api/dramabox/api";

// --- THEME CONFIG (Dark Cinema Minimal) ---
const THEME = {
  bg: "bg-[#0E0E10]",       // Background Utama
  surface: "bg-[#16161A]",  // Card/Surface
  border: "border-[#242428]", // Border Halus
  textMain: "text-white",   // Teks Utama
  textSec: "text-[#A1A1AA]", // Teks Sekunder
  accent: "text-[#E50914]",  // Merah Cinema (Text)
  accentBg: "bg-[#E50914]",  // Merah Cinema (Bg)
};

// --- CATEGORY LIST ---
const CATEGORIES = [
  "Semua", "Manis", "Bayi", "Perjalanan Waktu", "Cinta Pahit", "Melawan Balik", 
  "Orang Kecil", "Identitas Tersembunyi", "Realitas", "Cinta Sejati", 
  "Ahli Turun Gunung", "Keluarga", "Nikah Dulu Cinta Belakangan", "Urban", 
  "Pernikahan Kilat", "Kembali Orang Kuat", "Kawin Kontrak", "Menantu Matrilineal", 
  "Wanita Tangguh", "Identitas Tertukar", "Salah Paham", "Kekuatan Super", 
  "Pengkhianatan", "Balas Dendam", "Orang Kuat", "Kebangkitan", 
  "Kebangkitan Warisan", "Romansa", "Kelahiran Kembali", "Identitas Rahasia", 
  "Cinta Segitiga"
];

// --- COMPONENTS ---

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#242428] rounded-lg ${className}`}></div>
);

// Modern Cinema Card
const DramaCard = ({ drama, onClick, className = "", aspect = "aspect-[2/3]" }) => (
  <div 
    onClick={() => onClick(drama)}
    className={`relative group cursor-pointer overflow-hidden rounded-lg ${THEME.surface} border border-transparent hover:border-[#333] transition-all ${className}`}
  >
    <div className={`relative w-full h-full ${aspect}`}>
      <img 
        src={drama.cover || drama.imageUrl || "https://via.placeholder.com/300x450?text=No+Image"} 
        alt={drama.title || drama.bookName}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        loading="lazy"
        onError={(e) => e.target.src = "https://via.placeholder.com/300x450?text=Error"}
      />
      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-transparent to-transparent opacity-80"></div>
      
      {/* Minimalist Info */}
      <div className="absolute bottom-0 left-0 w-full p-3">
         <h3 className={`text-white text-[11px] font-bold leading-tight line-clamp-1 mb-1 group-hover:${THEME.accent} transition-colors`}>
          {drama.title || drama.bookName}
         </h3>
         <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
            <span className={`${THEME.accentBg} text-white px-1 py-[1px] rounded-[2px] text-[8px] font-bold tracking-wider`}>HD</span>
            <span className="truncate">{drama.category || "Drama"}</span>
         </div>
      </div>

      {/* Score Badge */}
      {drama.score && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/5">
          <Star size={8} className="text-yellow-500" fill="currentColor" /> {drama.score}
        </div>
      )}
    </div>
  </div>
);

// 3. Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [currentView, setCurrentView] = useState('main'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // History State
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('cobanonton_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Watched Episodes State
  const [watchedEpisodes, setWatchedEpisodes] = useState(() => {
    const saved = localStorage.getItem('cobanonton_watched');
    return saved ? JSON.parse(saved) : {}; 
  });

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Data States
  const [homeData, setHomeData] = useState([]);
  const [newData, setNewData] = useState([]);
  const [rankData, setRankData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail & Player States
  const [dramaDetail, setDramaDetail] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const heroDrama = homeData.length > 0 ? homeData[0] : null;

  // --- EFFECT: Inject Meta Tags & Scroll Listener ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const head = document.head;
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = "theme-color";
      head.appendChild(metaTheme);
    }
    metaTheme.content = "#0E0E10";

    let linkManifest = document.querySelector('link[rel="manifest"]');
    if (!linkManifest) {
      linkManifest = document.createElement('link');
      linkManifest.rel = "manifest";
      linkManifest.href = "/manifest.json";
      head.appendChild(linkManifest);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- PWA LOGIC ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('pwa_dismissed')) setShowInstallBanner(true);
    };
    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if(outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
    }
  };

  // --- HISTORY & WATCHED LOGIC ---
  const addToHistory = (drama) => {
    if (!drama) return;
    const newHistory = [drama, ...history.filter(h => (h.bookId || h.id) !== (drama.bookId || drama.id))].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('cobanonton_history', JSON.stringify(newHistory));
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
    if(confirm("Hapus semua riwayat tontonan?")) {
      setHistory([]);
      localStorage.removeItem('cobanonton_history');
    }
  };

  // --- FETCHING LOGIC ---
  const fetchData = async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("Fetch Error:", err);
      throw err;
    }
  };

  // Load Data
  useEffect(() => {
    const loadHome = async () => {
      setLoading(true);
      setError(null);
      try {
        const [foryou, fresh] = await Promise.all([
          fetchData('/foryou/1?lang=in'),
          fetchData('/new/1?lang=in')
        ]);
        setHomeData(foryou.data?.list || foryou.data || []);
        setNewData(fresh.data?.list || fresh.data || []);
      } catch (err) {
        setError("Gagal memuat data. Cek koneksi internet.");
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'home') loadHome();
  }, [activeTab]);

  useEffect(() => {
    const loadRank = async () => {
      if (activeTab === 'rank' && rankData.length === 0) {
        setLoading(true);
        try {
          const res = await fetchData('/rank/1?lang=in');
          setRankData(res.data?.list || res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
      }
    };
    if (activeTab === 'rank') loadRank();
  }, [activeTab]);

  // Search Logic
  const performSearch = async (query) => {
    if (!query) return;
    setLoading(true);
    setSearchQuery(query); 
    try {
      const res = await fetchData(`/search/${encodeURIComponent(query)}/1?lang=in&pageSize=20`);
      setSearchResults(res.data?.list || res.data || []);
    } catch (err) { setError("Gagal mencari drama."); } finally { setLoading(false); }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab('search');
    performSearch(searchQuery);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setIsCategoryOpen(false);
    if (categoryName === "Semua") {
      setActiveTab('home');
    } else {
      setActiveTab('search');
      setSearchQuery(categoryName);
      performSearch(categoryName);
    }
  };

  // Open Detail
  const openDrama = async (drama) => {
    addToHistory(drama);
    setSelectedDrama(drama);
    setCurrentView('detail');
    setLoading(true);
    setDramaDetail(null);
    setChapters([]);
    
    const id = drama.bookId || drama.id;

    try {
      const [detailRes, chaptersRes] = await Promise.all([
        fetchData(`/drama/${id}?lang=in`),
        fetchData(`/chapters/${id}?lang=in`)
      ]);
      setDramaDetail(detailRes.data);
      setChapters(chaptersRes.data?.chapterList || chaptersRes.data || []);
    } catch (err) {
      setError("Gagal memuat detail.");
    } finally {
      setLoading(false);
    }
  };

  // Play Episode
  const playEpisode = async (chapter, index) => {
    if (!selectedDrama) return;
    const dramaId = selectedDrama.bookId || selectedDrama.id;
    
    addToHistory(selectedDrama); 
    markEpisodeWatched(dramaId, index);

    setCurrentChapter(chapter);
    setCurrentView('player');
    setLoading(true);
    setVideoUrl(null);
    setError(null);

    const bookId = selectedDrama.bookId || selectedDrama.id;
    const chapterIdx = typeof index === 'number' ? index + 1 : chapter.index || 1; 

    try {
      const res = await fetchData(`/watch/player?bookId=${bookId}&index=${chapterIdx}&lang=in`);
      let targetUrl = null;
      if (typeof res.data === 'string' && res.data.startsWith('http')) targetUrl = res.data;
      else if (res.data && typeof res.data === 'object') {
        const keys = ['url', 'm3u8', 'playUrl', 'videoUrl', 'streamUrl', 'link', 'src'];
        for (const key of keys) {
          if (res.data[key] && typeof res.data[key] === 'string' && res.data[key].startsWith('http')) {
            targetUrl = res.data[key]; break;
          }
        }
      }
      if (targetUrl) setVideoUrl(targetUrl);
      else setError(`Link tidak ditemukan.`);
    } catch (err) {
      setError("Gagal memuat video.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  if (currentView === 'player') {
    const currentIdx = chapters.findIndex(c => c === currentChapter);
    const hasNext = currentIdx < chapters.length - 1;
    const hasPrev = currentIdx > 0;

    return (
      <div className="fixed inset-0 bg-black z-[999] flex flex-col font-sans">
        {/* Cinematic Player Header */}
        <div className="absolute top-0 w-full p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-20 pointer-events-none">
          <button 
            onClick={() => setCurrentView('detail')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all pointer-events-auto"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-white/80 text-sm font-bold tracking-wider drop-shadow-md">
             EPISODE {currentIdx + 1}
          </div>
          <div className="w-10"></div>
        </div>

        {/* Video Area */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          {loading ? (
             <div className="flex flex-col items-center gap-4">
               <div className={`w-12 h-12 border-4 border-[#242428] border-t-[${THEME.accentBg}] rounded-full animate-spin border-t-red-600`}></div>
               <p className="text-[#A1A1AA] text-xs font-bold tracking-[0.2em]">MEMUAT...</p>
             </div>
          ) : videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              playsInline
              webkit-playsinline="true"
              className="w-full h-full max-h-screen object-contain"
              onError={() => setError("Format video tidak didukung.")}
            />
          ) : (
            <div className="text-center p-6">
              <AlertCircle className="mx-auto mb-3 text-red-600" size={32} />
              <p className="text-[#A1A1AA] text-sm mb-4">Video tidak tersedia saat ini.</p>
              <button onClick={() => setCurrentView('detail')} className="px-6 py-2 bg-[#242428] rounded-full text-white text-xs font-bold hover:bg-[#333]">KEMBALI</button>
            </div>
          )}
        </div>

        {/* Controls - Fixed at Bottom with Z-Index */}
        <div className="bg-[#0E0E10] border-t border-[#242428] p-4 pb-8 safe-area-pb z-50 relative w-full">
            <div className="flex items-center justify-between max-w-md mx-auto gap-4">
               <button 
                 disabled={!hasPrev}
                 onClick={() => hasPrev && playEpisode(chapters[currentIdx - 1], currentIdx - 1)}
                 className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${!hasPrev ? 'bg-[#16161A] text-[#333] cursor-not-allowed' : 'bg-[#16161A] text-white hover:bg-[#242428]'}`}
               >
                 <SkipBack size={16} /> Prev
               </button>
               
               <button 
                 disabled={!hasNext}
                 onClick={() => hasNext && playEpisode(chapters[currentIdx + 1], currentIdx + 1)}
                 className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${!hasNext ? 'bg-[#16161A] text-[#333] cursor-not-allowed' : `${THEME.accentBg} text-white hover:opacity-90 shadow-lg shadow-red-900/20`}`}
               >
                 Next Eps <SkipForward size={16} />
               </button>
            </div>
        </div>
      </div>
    );
  }

  if (currentView === 'detail') {
    const dramaId = dramaDetail?.bookId || dramaDetail?.id || selectedDrama?.bookId || selectedDrama?.id;
    const watchedList = watchedEpisodes[dramaId] || [];

    return (
      <div className={`min-h-screen ${THEME.bg} text-white pb-20 font-sans`}>
        <div className="relative h-[55vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0E10]/60 to-[#0E0E10] z-10"></div>
          <img 
            src={dramaDetail?.cover || selectedDrama.cover || "https://via.placeholder.com/800x400"} 
            className="w-full h-full object-cover"
            alt="Cover"
          />
          <button 
            onClick={() => setCurrentView('main')}
            className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/5 z-20 hover:bg-black/60"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="px-5 -mt-20 relative z-20">
          <h1 className="text-3xl md:text-4xl font-black leading-tight text-white mb-3 drop-shadow-xl">
            {dramaDetail?.title || selectedDrama.title}
          </h1>
          
          <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mb-6 font-medium">
             <span className={`${THEME.accent} font-bold`}>{dramaDetail?.score ? `${dramaDetail.score} Match` : '98% Match'}</span>
             <span>•</span>
             <span>{dramaDetail?.category || "Drama"}</span>
             <span>•</span>
             <span className="border border-[#333] px-1 rounded text-[10px]">HD</span>
          </div>

          <button 
            onClick={() => chapters.length > 0 && playEpisode(chapters[0], 0)}
            className={`w-full py-4 bg-white text-black font-bold rounded flex items-center justify-center gap-2 mb-6 hover:bg-gray-200 transition-colors shadow-lg`}
          >
            <Play fill="black" size={22} /> Putar
          </button>

          <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8 line-clamp-4">
            {dramaDetail?.introduction || dramaDetail?.desc || "Saksikan drama seru ini dengan kualitas terbaik hanya di COBANONTON."}
          </p>

          <div className="border-t border-[#242428] pt-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex justify-between items-center">
              Episode 
              <span className="text-[10px] text-[#555] normal-case tracking-normal">
                {watchedList.length} / {chapters.length} Ditonton
              </span>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {loading ? (
                [...Array(8)].map((_,i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : (
                chapters.map((ch, idx) => {
                  const isWatched = watchedList.includes(idx);
                  return (
                    <button 
                      key={ch.id || idx}
                      onClick={() => playEpisode(ch, idx)}
                      className={`
                        relative bg-[#16161A] hover:bg-[#242428] border border-[#242428] rounded py-3 text-xs font-bold transition-colors
                        ${isWatched ? 'text-[#A1A1AA]' : 'text-white'}
                      `}
                    >
                      {idx + 1}
                      {/* TITIK MERAH untuk Episode Ditonton */}
                      {isWatched && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full shadow-sm"></div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.textMain} pb-24 font-sans relative`}>
      
      {/* HEADER NAVBAR (With Text Links) */}
      <div className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 px-4 py-3 flex items-center justify-between ${scrolled ? 'bg-[#0E0E10]/95 backdrop-blur-md border-b border-[#242428]' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
        <div className="flex items-center gap-6">
           <div className="cursor-pointer group mr-2" onClick={() => setActiveTab('home')}>
              <img 
                src="/logo.png" 
                alt="COBANONTON" 
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center gap-1">
                <Tv size={22} className={THEME.accent} strokeWidth={2.5} />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 font-black text-lg tracking-tighter">
                  COBANONTON
                </span>
              </div>
           </div>
           
           {/* HEADER LINKS (Menu disebelah logo) */}
           <div className="hidden md:flex items-center gap-6 text-sm font-medium">
             <button onClick={() => {setActiveTab('home'); setSelectedCategory('Semua')}} className={`hover:text-white transition-colors ${activeTab === 'home' ? 'text-white font-bold' : 'text-[#A1A1AA]'}`}>Beranda</button>
             <button onClick={() => setActiveTab('search')} className={`hover:text-white transition-colors ${activeTab === 'search' ? 'text-white font-bold' : 'text-[#A1A1AA]'}`}>Search</button>
             <button onClick={() => setActiveTab('rank')} className={`hover:text-white transition-colors ${activeTab === 'rank' ? 'text-white font-bold' : 'text-[#A1A1AA]'}`}>Top Chart</button>
             <button onClick={() => setActiveTab('history')} className={`hover:text-white transition-colors ${activeTab === 'history' ? 'text-white font-bold' : 'text-[#A1A1AA]'}`}>Perpustakaan</button>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsCategoryOpen(true)}
             className="text-xs font-bold text-white/80 hover:text-white border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors flex items-center gap-1"
           >
             Genre <ChevronDown size={10} />
           </button>
           
           {/* Mobile Search Icon (Since text links are hidden on mobile) */}
           <button onClick={() => setActiveTab('search')} className="md:hidden p-1 rounded-full hover:bg-white/10 transition-colors">
             <Search size={22} className="text-white" />
           </button>
        </div>
      </div>

      {/* CATEGORY MODAL */}
      {isCategoryOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0E0E10]/98 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col pt-24 px-6">
           <button 
             onClick={() => setIsCategoryOpen(false)}
             className="absolute top-6 right-6 p-2 bg-[#242428] rounded-full text-white hover:bg-[#333]"
           >
             <X size={24}/>
           </button>
           <h2 className="text-2xl font-black text-white mb-8 text-center">Pilih Genre</h2>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto pb-20 no-scrollbar">
             {CATEGORIES.map((cat, idx) => (
               <button 
                 key={idx}
                 onClick={() => handleCategoryClick(cat)}
                 className={`py-4 px-4 text-center text-sm font-medium rounded-lg transition-all ${selectedCategory === cat ? 'bg-[#E50914] text-white' : 'bg-[#16161A] text-[#A1A1AA] hover:bg-[#242428] hover:text-white'}`}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>
      )}

      {/* PWA INSTALL BANNER */}
      {showInstallBanner && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#16161A] border border-[#242428] rounded-lg p-4 shadow-2xl flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                   <img src="/pwa-192x192.png" className="w-8 h-8 rounded-md" alt="App Icon" />
                </div>
                <div>
                   <h4 className="text-white font-bold text-sm">Install App</h4>
                   <p className="text-[#A1A1AA] text-xs">Akses lebih cepat & hemat kuota</p>
                </div>
             </div>
             <button 
                onClick={handleInstallClick}
                className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-gray-200 transition-colors"
             >
                Install
             </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="pb-10 pt-16">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* CINEMATIC HERO */}
            {heroDrama && !loading ? (
              <div className="relative w-full h-[70vh] mb-8 mt-[-64px]">
                <img 
                  src={heroDrama.cover || heroDrama.imageUrl} 
                  className="w-full h-full object-cover animate-in fade-in duration-1000"
                  alt="Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E10]/30 via-transparent to-[#0E0E10]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 pb-12 flex flex-col items-center text-center z-10">
                  <div className="mb-4 flex gap-2">
                     <span className={`text-[9px] font-bold uppercase tracking-widest text-white/90 px-2 py-1 rounded bg-white/10 backdrop-blur`}>
                       {heroDrama.category || "Trending"}
                     </span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-none max-w-4xl tracking-tight">
                    {heroDrama.title}
                  </h1>
                  <div className="flex gap-3 w-full max-w-sm">
                     <button 
                       onClick={() => openDrama(heroDrama)}
                       className="flex-1 bg-white text-black py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
                     >
                       <Play fill="black" size={18} /> Putar
                     </button>
                     <button 
                       onClick={() => openDrama(heroDrama)}
                       className="flex-1 bg-[#242428]/80 backdrop-blur-md text-white py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 hover:bg-[#333] transition-all active:scale-95"
                     >
                       <Info size={18} /> Info
                     </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[70vh] w-full bg-[#16161A] animate-pulse mb-8 mt-[-64px]"></div>
            )}

            <div className="px-5 space-y-10 -mt-6 relative z-10">
              {/* HOT */}
              <section>
                 <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Flame size={16} className={THEME.accent} fill="currentColor"/> Sedang Hangat
                 </h2>
                 {loading && homeData.length === 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                       <Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" />
                    </div>
                 ) : (
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {homeData.slice(0, 9).map((drama, idx) => (
                        <DramaCard key={idx} drama={drama} onClick={openDrama} />
                      ))}
                   </div>
                 )}
              </section>

              {/* NEW */}
              <section>
                 <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Baru Ditambahkan</h2>
                 <div className="flex overflow-x-auto gap-3 pb-4 -mx-5 px-5 no-scrollbar">
                   {newData.map((drama, idx) => (
                     <DramaCard key={idx} drama={drama} onClick={openDrama} className="w-28 flex-shrink-0" />
                   ))}
                 </div>
              </section>
            </div>
          </>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div className="p-5 min-h-[90vh]">
            <div className="relative mb-8">
              <input 
                type="text" 
                placeholder="Cari judul, genre..."
                className="w-full bg-[#16161A] border-none rounded-sm py-4 pl-12 pr-4 text-white text-sm focus:ring-1 focus:ring-white/20 transition-all placeholder:text-[#555] font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Search className="absolute left-4 top-4 text-[#555]" size={20} />
            </div>

            <h2 className="text-sm font-bold mb-4 text-[#A1A1AA] uppercase tracking-wider">
              {searchQuery ? `Hasil Pencarian` : "Jelajahi"}
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
               {loading ? (
                  [...Array(6)].map((_,i) => <Skeleton key={i} className="aspect-[2/3]" />)
               ) : searchResults.length > 0 ? (
                  searchResults.map((drama, idx) => (
                    <DramaCard key={idx} drama={drama} onClick={openDrama} />
                  ))
               ) : (
                 <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-30">
                    <Film size={48} className="mb-4"/>
                    <p className="text-sm">Tidak ada drama ditemukan.</p>
                 </div>
               )}
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
                <div 
                  key={idx} 
                  onClick={() => openDrama(drama)}
                  className="flex items-center gap-4 bg-[#16161A] hover:bg-[#242428] p-3 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-[#333]"
                >
                  <span className={`text-4xl font-black w-10 text-center ${idx < 3 ? THEME.accent : 'text-[#333]'} tracking-tighter`}>
                    {idx + 1}
                  </span>
                  <img 
                    src={drama.cover || drama.imageUrl} 
                    className="w-16 h-20 object-cover rounded-sm"
                    alt={drama.title}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate mb-1">{drama.title || drama.bookName}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] bg-[#242428] px-1.5 py-0.5 rounded text-[#A1A1AA]">{drama.category}</span>
                       <span className="text-[9px] text-[#46d369] font-bold flex items-center gap-0.5"><Star size={8} fill="currentColor"/> {drama.score}</span>
                    </div>
                  </div>
                  <PlayCircle size={24} className="text-[#333] group-hover:text-white transition-colors mr-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB (PUSTAKA) */}
        {activeTab === 'history' && (
          <div className="p-5 min-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-white">Pustaka Saya</h2>
               {history.length > 0 && (
                 <button onClick={clearHistory} className="text-[#A1A1AA] text-xs hover:text-white flex items-center gap-1">
                   <Trash2 size={14}/> Hapus
                 </button>
               )}
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {history.map((drama, idx) => (
                  <DramaCard key={idx} drama={drama} onClick={openDrama} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
                 <History size={48} className="mb-4 opacity-20"/>
                 <p className="text-sm">Belum ada riwayat tontonan.</p>
                 <button onClick={() => setActiveTab('home')} className={`mt-4 ${THEME.accent} text-sm font-bold`}>
                   Mulai Nonton
                 </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* BOTTOM NAVBAR (Mobile Navigation) */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0E0E10]/95 backdrop-blur-md border-t border-[#242428] flex justify-around py-3 z-50 pb-safe">
        {[
          { id: 'home', icon: Home, label: 'Beranda' },
          { id: 'search', icon: Search, label: 'Cari' },
          { id: 'rank', icon: Trophy, label: 'Top' },
          { id: 'history', icon: Library, label: 'Pustaka' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if(item.id === 'home') setSelectedCategory("Semua");
              window.scrollTo(0,0);
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === item.id ? 'text-white' : 'text-[#555] hover:text-[#999]'}`}
          >
            <item.icon 
              size={20} 
              strokeWidth={activeTab === item.id ? 2.5 : 2} 
              fill={activeTab === item.id && item.id !== 'search' ? "currentColor" : "none"}
            />
            <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}