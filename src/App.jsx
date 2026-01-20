import React, { useState, useEffect, useRef } from 'react';
import { Play, Search, Home, Trophy, List, ChevronLeft, Star, Clock, Info, X, Film, AlertCircle, RefreshCw, Bug, SkipForward, SkipBack, Zap } from 'lucide-react';

// --- API CONSTANTS ---
const API_BASE = "https://dramabos.asia/api/dramabox/api";

// --- COMPONENTS ---

// 1. Loading Skeleton
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`}></div>
);

// 2. Movie Card
const DramaCard = ({ drama, onClick }) => (
  <div 
    onClick={() => onClick(drama)}
    className="relative group cursor-pointer flex-shrink-0 w-28 md:w-44 flex flex-col gap-2 transition-transform duration-300 hover:-translate-y-1"
  >
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-lg shadow-black/50">
      <img 
        src={drama.cover || drama.imageUrl || "https://via.placeholder.com/300x450?text=No+Image"} 
        alt={drama.title || drama.bookName}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={(e) => e.target.src = "https://via.placeholder.com/300x450?text=Error"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
      
      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white shadow-xl">
          <Play size={20} fill="currentColor" />
        </div>
      </div>

      {/* Score Badge */}
      {drama.score && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border border-white/10 text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star size={8} fill="currentColor" /> {drama.score}
        </div>
      )}
    </div>
    <div className="px-1">
      <h3 className="text-gray-100 text-sm font-semibold line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
        {drama.title || drama.bookName || "Judul Tidak Diketahui"}
      </h3>
      <span className="text-gray-500 text-xs mt-1 block">
        {drama.category || "Drama Seru"}
      </span>
    </div>
  </div>
);

// 3. Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [currentView, setCurrentView] = useState('main'); // main, detail, player
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
    loadRank();
  }, [activeTab]);

  // Search Logic
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await fetchData(`/search/${encodeURIComponent(searchQuery)}/1?lang=in&pageSize=20`);
      setSearchResults(res.data?.list || res.data || []);
    } catch (err) {
      setError("Gagal mencari drama.");
    } finally {
      setLoading(false);
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
    // Ensure index is correct. API usually expects 1-based index
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
    // Determine Nav State
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
          {/* Main Video Container */}
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
                
                {/* Desktop Floating Navigation */}
                {hasPrev && (
                   <button 
                     onClick={() => playEpisode(chapters[currentIdx - 1], currentIdx - 1)}
                     className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-red-600/80 p-3 rounded-full text-white backdrop-blur-sm transition-all"
                     title="Episode Sebelumnya"
                   >
                     <SkipBack size={24} />
                   </button>
                )}
                {hasNext && (
                   <button 
                     onClick={() => playEpisode(chapters[currentIdx + 1], currentIdx + 1)}
                     className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-red-600/80 p-3 rounded-full text-white backdrop-blur-sm transition-all"
                     title="Episode Selanjutnya"
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

        {/* Bottom Control Bar (Mobile Friendly) */}
        <div className="bg-[#0a0a0a] border-t border-white/5 p-4 pb-8 safe-area-pb z-30">
            {/* Nav Controls */}
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

            {/* Chapter Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {chapters.map((ch, idx) => (
                   <button
                      key={ch.id || idx}
                      onClick={() => playEpisode(ch, idx)}
                      className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all border ${
                         currentIdx === idx 
                         ? 'bg-white text-black border-white scale-110 shadow-lg z-10' 
                         : 'bg-gray-900 text-gray-500 border-gray-800 hover:bg-gray-800 hover:text-gray-300'
                      }`}
                   >
                     {idx + 1}
                   </button>
                ))}
            </div>
        </div>
      </div>
    );
  }

  if (currentView === 'detail') {
    return (
      <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
        {/* Hero Image with Gradient */}
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

        {/* Detail Content */}
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

          {/* Chapter Grid */}
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
            {chapters.length === 0 && !loading && (
               <div className="text-center py-10 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                  <p className="text-gray-500">Belum ada episode tersedia.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT (Home, Search, Rank) ---
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans selection:bg-red-500/30">
      {/* Top Bar Glass */}
      <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
           <div className="bg-gradient-to-br from-red-500 to-purple-600 p-1.5 rounded-lg">
              <Film size={20} className="text-white" />
           </div>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-black text-xl tracking-tighter">
             COBANONTON
           </span>
        </div>
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors">
            <Search size={18} className="text-gray-400" onClick={() => setActiveTab('search')}/>
          </button>
        </div>
      </div>

      {/* Error Toast */}
      {error && !videoUrl && currentView !== 'player' && (
        <div className="mx-4 mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl flex gap-3 text-red-200 text-sm items-start backdrop-blur-sm animate-in slide-in-from-top-2">
          <Bug className="flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-bold text-red-100 mb-1">Terjadi Kesalahan</p>
            <p className="text-white/70 text-xs leading-relaxed">{error}</p>
            {error.includes("CORS") && (
              <div className="mt-2 bg-black/40 p-2 rounded text-[10px] text-gray-400">
                ⚠️ Pasang ekstensi <b>Allow CORS</b> di browser kamu supaya lancar.
              </div>
            )}
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded"><X size={16} /></button>
        </div>
      )}

      {/* Content Area */}
      <div className="p-5 space-y-10">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* Featured Section */}
            <section className="animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-5">
                 <h2 className="text-lg font-bold flex items-center gap-2">
                   <span className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-purple-600 rounded-full"></span> 
                   Rekomendasi Spesial
                 </h2>
                 <span className="text-xs font-medium text-gray-500 hover:text-white cursor-pointer transition-colors">Lihat Semua</span>
               </div>
               
               <div className="flex overflow-x-auto gap-4 pb-4 -mx-5 px-5 no-scrollbar scroll-smooth">
                 {loading && homeData.length === 0 ? (
                    [...Array(4)].map((_,i) => <Skeleton key={i} className="w-32 h-52 flex-shrink-0 rounded-xl" />)
                 ) : (
                   homeData.map((drama, idx) => (
                     <DramaCard key={idx} drama={drama} onClick={openDrama} />
                   ))
                 )}
               </div>
            </section>

            {/* New Releases Grid */}
            <section className="animate-in fade-in duration-700 delay-100">
               <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></span> 
                 Baru Dirilis
               </h2>
               <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                 {loading && newData.length === 0 ? (
                    [...Array(6)].map((_,i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)
                 ) : (
                   newData.map((drama, idx) => (
                     <DramaCard key={idx} drama={drama} onClick={openDrama} />
                   ))
                 )}
               </div>
            </section>
          </>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div className="min-h-[60vh] animate-in slide-in-from-bottom-4">
            <form onSubmit={handleSearch} className="relative mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <input 
                type="text" 
                placeholder="Cari judul drama favoritmu..."
                className="relative w-full bg-[#111] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gray-600 transition-colors placeholder:text-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Search className="absolute left-4 top-4 text-gray-500 group-focus-within:text-red-500 transition-colors" size={22} />
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {loading ? (
                  [...Array(4)].map((_,i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)
               ) : searchResults.length > 0 ? (
                  searchResults.map((drama, idx) => (
                    <DramaCard key={idx} drama={drama} onClick={openDrama} />
                  ))
               ) : (
                 <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-600">
                    <Search size={48} className="mb-4 opacity-20"/>
                    <p className="text-sm font-medium">{searchQuery ? "Drama tidak ditemukan" : "Ketik judul drama di atas"}</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* RANK TAB */}
        {activeTab === 'rank' && (
          <div className="animate-in slide-in-from-right-4">
            <div className="text-center mb-8">
               <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 inline-flex items-center gap-2">
                 <Trophy className="text-yellow-500" fill="currentColor"/> TOP GLOBAL
               </h2>
               <p className="text-gray-500 text-xs mt-1">Drama paling banyak ditonton minggu ini</p>
            </div>
            
            <div className="space-y-4">
              {loading && rankData.length === 0 ? (
                 [...Array(5)].map((_,i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
              ) : (
                rankData.map((drama, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => openDrama(drama)}
                    className="group flex gap-4 bg-gray-900/40 p-3 rounded-2xl border border-white/5 hover:bg-gray-800 hover:border-white/10 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <div className="relative w-20 h-28 flex-shrink-0">
                      <img 
                        src={drama.cover || drama.imageUrl} 
                        className="w-full h-full object-cover rounded-xl shadow-lg"
                        alt={drama.title}
                      />
                      <div className={`absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center rounded-full font-black text-white shadow-xl border-2 border-[#050505] ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-600' : 
                        idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                        idx === 2 ? 'bg-gradient-to-br from-orange-600 to-red-700' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-center">
                      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-red-400 transition-colors">{drama.title || drama.bookName}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                         <span className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded"><Star size={10} fill="currentColor"/> {drama.score || "N/A"}</span>
                         <span>{drama.category || "Drama"}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {drama.introduction || "Drama populer minggu ini."}
                      </p>
                    </div>
                    <div className="flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                       <Play size={24} className="text-red-500" fill="currentColor"/>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 flex justify-around py-2 z-40 pb-safe">
        {[
          { id: 'home', icon: Home, label: 'Beranda' },
          { id: 'search', icon: Search, label: 'Cari' },
          { id: 'rank', icon: Trophy, label: 'Top Chart' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${activeTab === item.id ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            {activeTab === item.id && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-red-500 to-purple-600 rounded-b-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            )}
            <item.icon size={24} className={activeTab === item.id ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''} />
            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}