"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Container from "../../../../components/layout/Container";
import Button from "../../../../components/ui/Button";
import Link from "next/link";

export default function MovieWatchClient({ subjectId, initialSeason = 1, initialEpisode = 1, isSeries = false }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState("in_id"); // Default Indonesian
  const [subtitleBlobs, setSubtitleBlobs] = useState({}); // cached VTT blob URLs per language
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);

  const fetchStreamUrl = useCallback(async (directUrl) => {
    const res = await fetch(
      `https://dramabos.asia/api/moviebox/v1/stream?url=${encodeURIComponent(directUrl)}`
    );
    if (!res.ok) throw new Error("Gagal membuka stream");
    const json = await res.json();
    if (!json?.stream) throw new Error("Stream URL tidak tersedia");
    return json.stream;
  }, []);

  const fetchVideoData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = isSeries
        ? `https://dramabos.asia/api/moviebox/v1/watch/${subjectId}?s=${currentSeason}&e=${currentEpisode}`
        : `https://dramabos.asia/api/moviebox/v1/watch/${subjectId}`;

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch video");

      const data = await res.json();

      if (!data.hasResource) {
        throw new Error("Video tidak tersedia");
      }

      setVideoData(data);

      // Pick default subtitle (prefer Indonesian if available)
      const captions = data?.captions || [];
      if (captions.length > 0) {
        const preferred = captions.find((c) => c.lan === "in_id") || captions[0];
        setSelectedSubtitle(preferred.lan);
      }

      // Set default quality to highest available and prepare stream URL
      if (data.processedSources && data.processedSources.length > 0) {
        const highestQuality = data.processedSources.reduce((prev, current) =>
          prev.quality > current.quality ? prev : current
        );

        const streamUrl = await fetchStreamUrl(highestQuality.directUrl);
        setSelectedQuality({ ...highestQuality, streamUrl });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Gagal memuat video");
    } finally {
      setLoading(false);
    }
  }, [subjectId, currentSeason, currentEpisode, isSeries, fetchStreamUrl]);

  useEffect(() => {
    fetchVideoData();
  }, [fetchVideoData]);

  const srtToVtt = (srtText) => {
    const vttBody = srtText
      .replace(/\r\n/g, "\n")
      .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
    return `WEBVTT\n\n${vttBody}`;
  };

  const ensureSubtitleBlob = useCallback(async (caption) => {
    if (!caption?.lan || subtitleBlobs[caption.lan]) return;
    try {
      const res = await fetch(caption.url);
      if (!res.ok) throw new Error("Gagal memuat subtitle");
      const srt = await res.text();
      const vtt = srtToVtt(srt);
      const blobUrl = URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
      setSubtitleBlobs((prev) => ({ ...prev, [caption.lan]: blobUrl }));
    } catch (err) {
      console.error("Subtitle fetch error:", err);
    }
  }, [subtitleBlobs]);

  // Fetch and convert subtitle to VTT when selected subtitle changes
  useEffect(() => {
    if (!videoData?.captions) return;
    const target = videoData.captions.find((c) => c.lan === selectedSubtitle);
    if (target) {
      ensureSubtitleBlob(target);
    }
  }, [selectedSubtitle, videoData, ensureSubtitleBlob]);

  const changeQuality = async (source) => {
    const currentTime = videoRef.current?.currentTime || 0;

    try {
      const streamUrl = await fetchStreamUrl(source.directUrl);
      setSelectedQuality({ ...source, streamUrl });
    } catch (err) {
      console.error("Stream error:", err);
      setError(err.message || "Gagal memuat stream");
      return;
    }

    // Preserve playback position
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        videoRef.current.play();
      }
    }, 100);
  };

  const changeEpisode = (season, episode) => {
    if (!isSeries) return;
    setCurrentSeason(season);
    setCurrentEpisode(episode);
    router.push(`/movie/${subjectId}/watch?s=${season}&e=${episode}`);
  };

  if (loading) {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted">Memuat video...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-semibold">Video tidak tersedia</h1>
            <p className="mt-2 text-muted">{error}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link href={`/movie/${subjectId}`}>
                <Button>Kembali ke Detail</Button>
              </Link>
              <Link href="/movie/list">
                <Button variant="outline">Lihat Movie Lainnya</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-4">
        {/* Video Player */}
        <div className="ios-surface ios-ring overflow-hidden">
          <div className="relative aspect-video w-full bg-black">
            {selectedQuality && (
              <video
                ref={videoRef}
                className="h-full w-full"
                controls
                autoPlay
                crossOrigin="anonymous"
                key={`${selectedQuality.id}-${selectedSubtitle}`}
              >
                <source src={selectedQuality.streamUrl} type="video/mp4" />

                {/* Subtitles */}
                {videoData?.captions?.map((caption) => (
                  <track
                    key={caption.id}
                    kind="subtitles"
                    src={subtitleBlobs[caption.lan] ?? caption.url}
                    srcLang={caption.lan}
                    label={caption.lanName}
                    default={caption.lan === selectedSubtitle}
                  />
                ))}

                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Controls */}
          <div className="border-t border-black/5 p-4 dark:border-white/5">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Quality Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Kualitas:</span>
                <div className="flex gap-2">
                  {videoData?.processedSources?.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => changeQuality(source)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${selectedQuality?.id === source.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                        }`}
                    >
                      {source.quality}p
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Selector */}
              {videoData?.captions && videoData.captions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Subtitle:</span>
                  <select
                    value={selectedSubtitle}
                    onChange={(e) => setSelectedSubtitle(e.target.value)}
                    className="rounded-lg border border-black/10 bg-background px-3 py-1.5 text-sm dark:border-white/10"
                  >
                    {videoData.captions.map((caption) => (
                      <option key={caption.id} value={caption.lan}>
                        {caption.lanName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episode Navigation */}
        <div className="mt-4 flex gap-3">
          <Link href={`/movie/${subjectId}`} className="flex-1">
            <Button className="w-full">Kembali ke Detail</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
