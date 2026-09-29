import { useEffect } from "react";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Maps the scroll position of `trackRef` to video.currentTime.
 * `onFrame(smoothedProgress)` is called every animation frame (no React state).
 * `onReady()` is called once the video can be scrubbed.
 */
export function useScrollScrub({ trackRef, videoRef, onFrame, onReady, endAt = 0.8 }) {
  useEffect(() => {
    const track = trackRef.current;
    const video = videoRef.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0, cur = 0, last = -1, raf = 0, started = false;

    const progress = () => {
      const r = track.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, r.height - innerHeight));
    };
    const onScroll = () => (target = progress());

    const tick = () => {
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0002) cur = target;
      const t = clamp(cur / endAt) * Math.max(0, (video.duration || 0) - 0.05);
      if (Math.abs(t - last) > 0.012) { video.currentTime = t; last = t; }
      onFrame(cur);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (started) return;
      started = true;
      video.pause();
      onReady?.();
      if (reduce) { onFrame(1); return; }
      target = cur = progress();
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll);
      raf = requestAnimationFrame(tick);
    };

    const onLoaded = () => { video.currentTime = 0; setTimeout(start, 400); };
    video.addEventListener("loadeddata", onLoaded);
    if (video.readyState >= 2) onLoaded();
    const fallback = setTimeout(start, 6000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      video.removeEventListener("loadeddata", onLoaded);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [trackRef, videoRef, onFrame, onReady, endAt]);
}
