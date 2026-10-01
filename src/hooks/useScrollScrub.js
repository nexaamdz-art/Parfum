import { useEffect } from "react";

const clamp = (v, a = 0, b = 1) =>
  Math.min(b, Math.max(a, v));

export function useScrollScrub({
  trackRef,
  videoRef,
  onFrame,
  endAt = 1.0
}) {
  useEffect(() => {
    const track = trackRef.current;
    const video = videoRef.current;

    if (!track || !video) {
      return;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let target = 0;
    let current = 0;
    let lastTime = -1;
    let lastSeekTimestamp = 0;
    let raf = 0;

    const getProgress = () => {
      const rect = track.getBoundingClientRect();
      const maxScroll = Math.max(1, rect.height - window.innerHeight);
      return clamp(-rect.top / maxScroll);
    };

    const onScroll = () => {
      target = getProgress();
    };

    const seekVideo = (progress, force = false) => {
      if (
        !video ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        return;
      }

      const maxTime = Math.max(0, video.duration - 0.001);
      const desired = clamp(progress / endAt) * maxTime;

      if (!Number.isFinite(desired)) {
        return;
      }

      const now = performance.now();
      if (force || (now - lastSeekTimestamp > 32 && Math.abs(desired - lastTime) > 0.012)) {
        try {
          video.currentTime = desired;
          lastTime = desired;
          lastSeekTimestamp = now;
        } catch {}
      }
    };

    const tick = () => {
      current += (target - current) * 0.16;

      const settled = Math.abs(target - current) < 0.0003;
      if (settled) {
        current = target;
      }

      seekVideo(current, settled);
      onFrame(current);

      raf = requestAnimationFrame(tick);
    };

    if (reduce) {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        try {
          video.currentTime = Math.max(0, video.duration - 0.05);
        } catch {}
      }
      onFrame(1);
      return;
    }

    try {
      video.pause();
    } catch {}

    // Initialize immediately on first frame
    target = current = getProgress();
    onFrame(current);

    // Listen to scroll events right away
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    raf = requestAnimationFrame(tick);

    const syncVideo = () => {
      seekVideo(current, true);
    };

    video.addEventListener("loadedmetadata", syncVideo);
    video.addEventListener("canplay", syncVideo);

    if (video.readyState >= 1) {
      syncVideo();
    } else {
      try {
        video.load();
      } catch {}
    }

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", syncVideo);
      video.removeEventListener("canplay", syncVideo);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [trackRef, videoRef, onFrame, endAt]);
}
