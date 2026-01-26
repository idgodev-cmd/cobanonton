"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Container from "../../../components/layout/Container";
import Button from "../../../components/ui/Button";
import Skeleton from "../../../components/ui/Skeleton";
import { checkBadges } from "../../../lib/Badges";

export default function WatchClient({ data, slug }) {
  const [activeServer, setActiveServer] = useState(0);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  // Advanced Player State
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [showNextPreview, setShowNextPreview] = useState(false);
  const [gestureStatus, setGestureStatus] = useState(null);
  const [brightness, setBrightness] = useState(1);
  const touchStartRef = useRef(null);

  useEffect(() => {
    async function fetchDownloads() {
      try {
        const res = await fetch(`https://dramabos.asia/api/tensei/stream/${slug}`);
        if (res.ok) {
          const json = await res.json();
          setDownloadLinks(json?.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch downloads:", e);
      } finally {
        setLoadingDownloads(false);
      }
    }

    fetchDownloads();

    // Track stats for badges
    const savedStats = JSON.parse(localStorage.getItem('cobanonton_stats') || '{"watchedCount":0}');
    savedStats.watchedCount += 1;
    localStorage.setItem('cobanonton_stats', JSON.stringify(savedStats));

    const currentBadges = JSON.parse(localStorage.getItem('cobanonton_badges') || '[]');
    const newBadges = checkBadges(savedStats, currentBadges);
    if (newBadges) {
      localStorage.setItem('cobanonton_badges', JSON.stringify(newBadges));
    }
  }, [slug]);

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      y: e.touches[0].clientY,
      x: e.touches[0].clientX,
      initialBrightness: brightness
    };
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const { y, x, initialBrightness } = touchStartRef.current;
    const deltaY = y - e.touches[0].clientY;
    const screenWidth = window.innerWidth;
    const sensitivity = 0.005;

    if (x < screenWidth / 2) {
      // Left side: Brightness
      const newBright = Math.max(0.3, Math.min(1.5, initialBrightness + (deltaY * sensitivity)));
      setBrightness(newBright);
      setGestureStatus({ type: 'brightness', value: Math.round(newBright * 100) });
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setTimeout(() => setGestureStatus(null), 1000);
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
    // Note: Playback speed for iframes is generally restricted by browser security policies
  };

  const servers = data.servers || [];
  const currentEmbed = servers[activeServer]?.embed;

  return (
    <div className="pb-12 pt-6 transition-all duration-300" style={{ filter: `brightness(${brightness})` }}>
      <Container>
        {/* Title and breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            {data.animeSlug && (
              <Link
                href={`/${data.animeSlug}`}
                className="text-xs font-bold text-primary uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Kembali
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{data.title}</h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSleepTimer(sleepTimer ? null : 30)}
              className={`p-2 rounded-full border border-white/10 transition-colors ${sleepTimer ? 'bg-primary text-white' : 'bg-transparent text-muted'}`}
              title="Sleep Timer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button
              onClick={toggleSpeed}
              className="px-3 py-1 rounded-md border border-white/10 text-xs font-bold text-muted hover:text-white"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>

        {/* Player Container */}
        <div
          className="netflix-surface overflow-hidden shadow-2xl relative group bg-black"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {gestureStatus && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-xl px-10 py-6 rounded-3xl text-white flex flex-col items-center border border-white/10 shadow-2xl scale-110">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-primary">System Control</span>
                <div className="flex items-center gap-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.929 7.929l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                  <span className="text-4xl font-black">{gestureStatus.value}%</span>
                </div>
              </div>
            </div>
          )}

          {showNextPreview && (
            <div className="absolute bottom-16 right-4 z-50 p-4 bg-zinc-900/90 border border-white/10 rounded-xl backdrop-blur-md shadow-2xl w-64">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Selanjutnya</span>
                <button onClick={() => setShowNextPreview(false)} className="text-muted hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <p className="text-sm font-bold text-white mb-4 line-clamp-1">Episode Selanjutnya</p>
              <Link href={`/watch/${data.next}`} className="block w-full text-center py-2 bg-white text-black text-xs font-bold rounded hover:bg-zinc-200 transition-colors">Putar Sekarang</Link>
            </div>
          )}

          {currentEmbed ? (
            <div className="aspect-video w-full">
              <iframe
                src={currentEmbed}
                className="w-full h-full border-0"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-zinc-900 flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-zinc-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Player tidak tersedia</p>
            </div>
          )}
        </div>

        {/* Episode navigation */}
        {(data.prev || data.next) && (
          <div className="mt-6 mb-12 flex flex-wrap justify-between items-center gap-3">
            {data.prev ? (
              <Link href={`/watch/${data.prev}`}>
                <Button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-md flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Sebelumnya
                </Button>
              </Link>
            ) : <div />}
            {data.next && (
              <Link href={`/watch/${data.next}`}>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-md flex items-center gap-2">
                  Selanjutnya
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Button>
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {servers.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-black uppercase tracking-tight">Pilih Server</h2>
                <div className="flex flex-wrap gap-2">
                  {servers.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveServer(idx)}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all border ${activeServer === idx
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : "bg-zinc-900 border-white/5 text-muted hover:border-white/20 hover:text-white"
                        }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="netflix-surface p-6 border border-white/5">
              <h2 className="mb-4 text-lg font-black uppercase tracking-tight">Download</h2>
              {loadingDownloads ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              ) : downloadLinks.length > 0 ? (
                <div className="space-y-2">
                  {downloadLinks.map((dl, idx) => (
                    <a
                      key={idx}
                      href={dl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md bg-zinc-900/50 border border-white/5 px-4 py-3 text-sm font-semibold transition-all hover:bg-zinc-800 hover:border-primary/50 group"
                    >
                      <span className="text-muted group-hover:text-white transition-colors">{dl.quality}</span>
                      <svg className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted italic">Belum ada link download</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
