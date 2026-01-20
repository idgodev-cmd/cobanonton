import React, { useState, useEffect, useRef } from 'react';
import { Play, Search, Home, Trophy, List, ChevronLeft, Star, Clock, Info, X, Film, AlertCircle, RefreshCw, Bug, SkipForward, SkipBack, Zap, LayoutGrid, Flame, ChevronDown } from 'lucide-react';

// --- API CONSTANTS ---
const API_BASE = "https://dramabos.asia/api/dramabox/api";

// --- CATEGORY LIST (UPDATED) ---
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
  <div className={`animate-pulse bg-white/10 rounded-xl ${className}`}></div>
);

// Modern Movie Card
const DramaCard = ({ drama, onClick, className = "", aspect = "aspect-[2/3]" }) => (
  <div 
    onClick={() => onClick(drama)}
    className={`relative group cursor-pointer overflow-hidden rounded-md bg-gray-900 ${className}`}
  >
    <div className={`relative w-full h-full ${aspect}`}>
      <img 
        src={drama.cover || drama.imageUrl || "https://via.placeholder.com/300x450?text=No+Image"} 
        alt={drama.title || drama.bookName}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        onError={(e) => e.target.src = "https://via.placeholder.com/300x450?text=Error"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
      
      {/* Overlay Info */}
      <div className="absolute bottom-0 left-0 w-full p-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
         <h3 className="text-white text-xs font-bold leading-tight line-clamp-1 drop-shadow-md mb-0.5">
          {drama.title || drama.bookName || "Judul Tidak Diketahui"}
         </h3>
         <div className="flex items-center gap-2 text-[9px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
            <span className="text-green-400 font-bold">{drama.score ? `${drama.score} Match` : 'New'}</span>
            <span className="border border-gray-500 px-1 rounded text-[8px]">HD</span>
         </div>
      </div>
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

  // Hero Drama (Random from Home Data)
  const heroDrama = homeData.length > 0 ? homeData[0] : null;
  const bentoGridData = homeData.slice(1, 7); // Items for Bento Grid

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

  // Load Home Data
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
        setError("Gagal memuat data. Kemungkinan masalah CORS.");
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'home') loadHome();
  }, [activeTab]);

  // Load Rank Data
  useEffect(() => {
    const loadRank = async () => {
      if (activeTab === 'rank' && rankData.length === 0) {
        setLoading(true);
        try {
          const res = await fetchData('/rank/1?lang=in');
          setRankData(res.data?.list || res.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    if (activeTab === 'rank') loadRank();
  }, [activeTab]);

  // Search Logic Helper
  const performSearch = async (query) => {
    if (!query) return;
    setLoading(true);
    setSearchQuery(query); 
    try {
      const res = await fetchData(`/search/${encodeURIComponent(query)}/1?lang=in&pageSize=20`);
      setSearchResults(res.data?.list || res.data || []);
    } catch (err) {
      setError("Gagal mencari drama.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab('search');
    performSearch(searchQuery);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setIsCategoryOpen(false); // Close modal
    if (categoryName === "Semua") {
      setActiveTab('home');
    } else {
      setActiveTab('search');
      setSearchQuery(categoryName); // Set search query to category name
      performSearch(categoryName);
    }
  };

  // Open Detail
  const openDrama = async (drama) => {
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
      console.error(err);
      setError("Gagal memuat detail drama.");
    } finally {
      setLoading(false);
    }
  };

  // Play Episode
  const playEpisode = async (chapter, index) => {
    if (!selectedDrama) return;
    setCurrentChapter(chapter);
    setCurrentView('player');
    setLoading(true);
    setVideoUrl(null);
    setError(null);

    const bookId = selectedDrama.bookId || selectedDrama.id;
    const chapterIdx = typeof index === 'number' ? index + 1 : chapter.index || 1; 

    try {
      console.log(`Fetching video for book: ${bookId}, index: ${chapterIdx}`);
      const res = await fetchData(`/watch/player?bookId=${bookId}&index=${chapterIdx}&lang=in`);
      
      let targetUrl = null;
      if (typeof res.data === 'string' && res.data.startsWith('http')) {
        targetUrl = res.data;
      } else if (res.data && typeof res.data === 'object') {
        const possibleKeys = ['url', 'm3u8', 'playUrl', 'videoUrl', 'streamUrl', 'link', 'src', 'ossUrl'];
        for (const key of possibleKeys) {
          if (res.data[key] && typeof res.data[key] === 'string' && res.data[key].startsWith('http')) {
            targetUrl = res.data[key];
            break;
          }
        }
      }

      if (targetUrl) {
        setVideoUrl(targetUrl);
      } else {
        const debugData = JSON.stringify(res, null, 2).substring(0, 300);
        setError(`Link tidak ditemukan. Respon API:\n${debugData}`);
      }
    } catch (err) {
      setError("Gagal memuat video player. Cek CORS atau koneksi.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  if (currentView === 'player') {
    // Player View (Unchanged Logic, updated styling slightly if needed)
    const currentIdx = chapters.findIndex(c => c === currentChapter);
    const hasNext = currentIdx < chapters.length - 1;
    const hasPrev = currentIdx > 0;

    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans">
        {/* Player Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent absolute top-0 w-full z-20 pointer-events-none">
          <button 
            onClick={() => setCurrentView('detail')}
            className="text-white p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/5 pointer-events-auto transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-white font-medium truncate px-4 pointer-events-auto drop-shadow-md">
             <span className="text-gray-400 text-sm block -mb-1">Sedang diputar</span>
             Ch. {currentIdx + 1} - {selectedDrama?.title}
          </div>
          <div className="w-10"></div>
        </div>

        {/* Video Area */}
        <div className="flex-1 flex flex-col relative bg-black justify-center overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {loading ? (
              <div className="text-white flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={16} className="text-red-500 animate-pulse" fill="currentColor"/>
                  </div>
                </div>
                <p className="text-sm font-medium tracking-wide animate-pulse">MEMUAT STREAM...</p>
              </div>
            ) : videoUrl ? (
              <>
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  playsInline
                  webkit-playsinline="true"
                  className="w-full h-full max-h-screen object-contain"
                  onError={(e) => {
                    setError("Format video tidak didukung atau link kadaluarsa.");
                    setVideoUrl(null);
                  }}
                />
                
                {hasPrev && (
                   <button 
                     onClick={() => playEpisode(chapters[currentIdx - 1], currentIdx - 1)}
                     className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-red-600/80 p-3 rounded-full text-white backdrop-blur-sm transition-all"
                   >
                     <SkipBack size={24} />
                   </button>
                )}
                {hasNext && (
                   <button 
                     onClick={() => playEpisode(chapters[currentIdx + 1], currentIdx + 1)}
                     className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-red-600/80 p-3 rounded-full text-white backdrop-blur-sm transition-all"
                   >
                     <SkipForward size={24} />
                   </button>
                )}
              </>
            ) : (
              <div className="text-center p-6 text-gray-400 max-w-md w-full">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Gagal Memutar</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-6 text-left max-h-40 overflow-y-auto">
                   <p className="text-xs text-red-300 font-mono break-all">{error}</p>
                </div>
                <div className="flex gap-3 justify-center">
                   <button 
                    onClick={() => setCurrentView('detail')}
                    className="px-6 py-2 bg-gray-800 text-white font-medium rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Kembali
                  </button>
                   {currentChapter && (
                     <button 
                      onClick={() => playEpisode(currentChapter, currentIdx)}
                      className="px-6 py-2 bg-gradient-to-r from-red-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2"
                     >
                       <RefreshCw size={16}/> Coba Lagi
                     </button>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Controls */}
        <div className="bg-[#0a0a0a] border-t border-white/5 p-4 pb-8 safe-area-pb z-30">
            <div className="flex items-center justify-between mb-4 max-w-md mx-auto">
               <button 
                 disabled={!hasPrev}
                 onClick={() => hasPrev && playEpisode(chapters[currentIdx - 1], currentIdx - 1)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${!hasPrev ? 'opacity-30 cursor-not-allowed text-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700 active:scale-95'}`}
               >
                 <SkipBack size={18} /> Prev
               </button>

               <div className="text-xs text-gray-500 font-mono">
                 {currentIdx + 1} / {chapters.length}
               </div>

               <button 
                 disabled={!hasNext}
                 onClick={() => hasNext && playEpisode(chapters[currentIdx + 1], currentIdx + 1)}
                 className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${!hasNext ? 'opacity-30 cursor-not-allowed text-gray-500' : 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg shadow-purple-900/20 active:scale-95'}`}
               >
                 Next Eps <SkipForward size={18} />
               </button>
            </div>
        </div>
      </div>
    );
  }

  if (currentView === 'detail') {
    return (
      <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
        {/* Detail View (Unchanged) */}
        <div className="relative h-[45vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505] z-10"></div>
          <img 
            src={dramaDetail?.cover || selectedDrama.cover || "https://via.placeholder.com/800x400"} 
            className="w-full h-full object-cover opacity-80"
            alt="Cover"
          />
          <button 
            onClick={() => setCurrentView('main')}
            className="absolute top-4 left-4 p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 z-20 hover:bg-black/40 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="px-6 -mt-12 relative z-20">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-black leading-none mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 max-w-[80%]">
              {dramaDetail?.title || selectedDrama.title}
            </h1>
            {dramaDetail?.score && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 backdrop-blur-md">
                 <Star size={14} fill="currentColor"/> {dramaDetail.score}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-6 font-medium">
             {dramaDetail?.category && <span className="bg-gray-800/80 px-2.5 py-1 rounded-md text-gray-200 border border-white/5">{dramaDetail.category}</span>}
             <span className="flex items-center gap-1"><List size={14}/> {chapters.length} Episode</span>
             <span className="flex items-center gap-1 text-green-400"><RefreshCw size={14}/> Update Baru</span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed mb-8 line-clamp-4 font-light">
            {dramaDetail?.introduction || dramaDetail?.desc || "Tidak ada deskripsi tersedia untuk drama ini. Nikmati ceritanya sekarang juga!"}
          </p>

          <button 
            onClick={() => chapters.length > 0 && playEpisode(chapters[0], 0)}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 mb-10 shadow-lg shadow-purple-900/30 transition-transform active:scale-95 hover:shadow-purple-900/50"
          >
            <Play fill="currentColor" size={22} /> MULAI NONTON
          </button>

          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <span className="w-1 h-6 bg-red-600 rounded-full"></span> Daftar Episode
            </h2>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {loading ? (
                [...Array(8)].map((_,i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
              ) : (
                chapters.map((ch, idx) => (
                  <button 
                    key={ch.id || idx}
                    onClick={() => playEpisode(ch, idx)}
                    className="bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl py-3 text-sm font-bold text-gray-400 hover:text-white transition-all"
                  >
                    {idx + 1}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT (Home, Search, Rank) ---
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans selection:bg-red-500/30">
      {/* HEADER: Netflix Style (Sticky, Transparent/Blur) */}
      <div className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 px-4 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent`}>
        <div className="flex items-center gap-4">
           {/* LOGO */}
           <span className="text-red-600 font-black text-2xl tracking-tighter drop-shadow-lg cursor-pointer" onClick={() => setActiveTab('home')}>
             COBANONTON
           </span>
           
           {/* CATEGORY DROPDOWN TRIGGER */}
           <button 
             onClick={() => setIsCategoryOpen(true)}
             className="hidden md:flex items-center gap-1 text-white text-sm font-medium hover:text-gray-300 transition-colors"
           >
             Kategori <ChevronDown size={14} />
           </button>
           <button 
             onClick={() => setIsCategoryOpen(true)}
             className="md:hidden text-white text-sm font-medium hover:text-gray-300 transition-colors"
           >
             Kategori
           </button>
        </div>

        <div className="flex gap-4">
           <Search size={24} className="text-white drop-shadow-md cursor-pointer hover:text-gray-300" onClick={() => setActiveTab('search')}/>
        </div>
      </div>

      {/* CATEGORY OVERLAY MODAL */}
      {isCategoryOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md pt-20 px-6 animate-in fade-in slide-in-from-top-4 duration-300">
           {/* Close Button */}
           <button 
             onClick={() => setIsCategoryOpen(false)}
             className="absolute bottom-10 left-1/2 -translate-x-1/2 md:top-6 md:right-6 md:left-auto md:translate-x-0 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-all"
           >
             <X size={24}/>
           </button>

           <div className="text-center mb-8">
             <h2 className="text-2xl font-bold text-gray-300">Pilih Genre</h2>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto h-[70vh] overflow-y-auto pb-20 no-scrollbar">
             {CATEGORIES.map((cat, idx) => (
               <button 
                 key={idx}
                 onClick={() => handleCategoryClick(cat)}
                 className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Error Toast */}
      {error && !videoUrl && currentView !== 'player' && (
        <div className="fixed top-20 left-4 right-4 z-50 p-4 bg-red-900/90 border border-red-500/30 rounded-2xl flex gap-3 text-red-200 text-sm items-start backdrop-blur-md animate-in slide-in-from-top-2 shadow-2xl">
          <Bug className="flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-bold text-red-100 mb-1">Terjadi Kesalahan</p>
            <p className="text-white/80 text-xs leading-relaxed">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded"><X size={16} /></button>
        </div>
      )}

      {/* Content Area */}
      <div className="pb-10">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* HERO SECTION (Netflix Style) */}
            {heroDrama && !loading && (
              <div className="relative w-full h-[70vh] mb-6">
                <img 
                  src={heroDrama.cover || heroDrama.imageUrl} 
                  className="w-full h-full object-cover"
                  alt="Hero"
                />
                {/* Gradient Overlays for cleaner look */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#050505]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 pb-10 flex flex-col items-center text-center">
                  <div className="mb-4 flex flex-wrap justify-center gap-2 animate-in slide-in-from-bottom-4 duration-700">
                     {heroDrama.category && <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 text-gray-200">
                       <span className="w-1 h-1 bg-red-500 rounded-full"></span> {heroDrama.category}
                     </span>}
                  </div>
                  <h1 className="text-4xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-none tracking-tight max-w-3xl animate-in slide-in-from-bottom-2 duration-700 delay-100">
                    {heroDrama.title}
                  </h1>
                  <div className="flex gap-3 w-full max-w-sm animate-in slide-in-from-bottom-2 duration-700 delay-200">
                     <button 
                       onClick={() => openDrama(heroDrama)}
                       className="flex-1 bg-white text-black py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                     >
                       <Play fill="black" size={20} /> Putar
                     </button>
                     <button 
                       onClick={() => openDrama(heroDrama)}
                       className="flex-1 bg-gray-500/40 backdrop-blur-md text-white py-3 rounded-[4px] font-bold flex items-center justify-center gap-2 hover:bg-gray-500/50 transition-colors"
                     >
                       <Info size={20} /> Info Lengkap
                     </button>
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 space-y-10 mt-[-40px] relative z-10">
              {/* SECTION: SEDANG HANGAT */}
              <section className="animate-in fade-in duration-500">
                 <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    Sedang Hangat
                 </h2>
                 
                 {loading && homeData.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-96">
                       <Skeleton className="col-span-2 row-span-2 h-full" />
                       <Skeleton className="h-full" />
                       <Skeleton className="h-full" />
                    </div>
                 ) : (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {homeData.slice(0, 10).map((drama, idx) => (
                        <DramaCard key={idx} drama={drama} onClick={openDrama} />
                      ))}
                   </div>
                 )}
              </section>

              {/* SECTION: BARU DITAMBAHKAN */}
              <section>
                 <h2 className="text-lg font-bold text-white mb-3">Baru Ditambahkan</h2>
                 <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 no-scrollbar">
                   {loading && newData.length === 0 ? (
                      [...Array(5)].map((_,i) => <Skeleton key={i} className="w-28 h-40 flex-shrink-0" />)
                   ) : (
                     newData.map((drama, idx) => (
                       <DramaCard key={idx} drama={drama} onClick={openDrama} className="w-28 flex-shrink-0" />
                     ))
                   )}
                 </div>
              </section>
            </div>
          </>
        )}

        {/* SEARCH TAB (Shows when category clicked) */}
        {activeTab === 'search' && (
          <div className="p-5 min-h-[80vh] pt-24">
            <form onSubmit={handleSearchSubmit} className="relative mb-8">
              <input 
                type="text" 
                placeholder="Cari judul drama..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-none py-3 pl-12 pr-4 text-white focus:border-white transition-all placeholder:text-gray-500 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
            </form>

            <h2 className="text-lg font-bold mb-4 text-gray-400">
              {searchQuery ? `Hasil: "${searchQuery}"` : "Jelajahi"}
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
               {loading ? (
                  [...Array(6)].map((_,i) => <Skeleton key={i} className="aspect-[2/3]" />)
               ) : searchResults.length > 0 ? (
                  searchResults.map((drama, idx) => (
                    <DramaCard key={idx} drama={drama} onClick={openDrama} />
                  ))
               ) : (
                 <div className="col-span-full py-20 text-center">
                    <p className="text-gray-500">Tidak ada drama ditemukan.</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* RANK TAB */}
        {activeTab === 'rank' && (
          <div className="p-5 pt-24">
            <div className="text-center mb-8">
               <h2 className="text-2xl font-black text-white">TOP 10 INDONESIA</h2>
               <p className="text-gray-500 text-xs mt-1">Update Harian</p>
            </div>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              {loading && rankData.length === 0 ? (
                 [...Array(5)].map((_,i) => <Skeleton key={i} className="h-28 w-full" />)
              ) : (
                rankData.map((drama, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => openDrama(drama)}
                    className="flex gap-4 items-center group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
                  >
                    <span className="text-5xl font-black text-gray-800 w-16 text-center group-hover:text-red-600 transition-colors drop-shadow-sm">
                      {idx + 1}
                    </span>
                    <div className="relative w-28 aspect-video flex-shrink-0 overflow-hidden rounded-lg">
                      <img 
                        src={drama.cover || drama.imageUrl} 
                        className="w-full h-full object-cover"
                        alt={drama.title}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Play fill="white" size={24} className="text-white"/>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-white truncate">{drama.title || drama.bookName}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                         <span className="bg-white/10 px-1 rounded text-[10px]">{drama.category || "Drama"}</span>
                         <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500"/> {drama.score || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#121212] border-t border-white/10 flex justify-around py-2 z-50 pb-safe">
        {[
          { id: 'home', icon: Home, label: 'Beranda' },
          { id: 'search', icon: Search, label: 'Cari' },
          { id: 'rank', icon: Trophy, label: 'Top Chart' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if(item.id === 'home') setSelectedCategory("Semua");
            }}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}