import { useEffect } from "react";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function useScrollScrub({
  trackRef,
  videoRef,
  onFrame,
  onReady,
  onError,
  endAt = 0.8
}) {
  useEffect(() => {
    const track = trackRef.current;
    const video = videoRef.current;

    if (!track || !video) return;

    const reduce = matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let target = 0;
    let cur = 0;
    let last = -1;
    let raf = 0;
    let started = false;
    let startTimer = 0;

    const progress = () => {
      const r = track.getBoundingClientRect();

      return clamp(
        -r.top / Math.max(1, r.height - innerHeight)
      );
    };

    const onScroll = () => {
      target = progress();
    };

    const tick = () => {
      cur += (target - cur) * 0.14;

      if (Math.abs(target - cur) < 0.0002) {
        cur = target;
      }

      const maxTime = Math.max(
        0,
        (video.duration || 0) - 0.05
      );

      const t = clamp(cur / endAt) * maxTime;

      if (
        video.readyState >= 2 &&
        Number.isFinite(t) &&
        Math.abs(t - last) > 0.012
      ) {
        try {
          video.currentTime = t;
          last = t;
        } catch {}
      }

      onFrame(cur);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (started) return;

      started = true;

      if (reduce) {
        if (
          Number.isFinite(video.duration) &&
          video.duration > 0
        ) {
          video.currentTime = Math.max(
            0,
            video.duration - 0.05
          );
        }

        onReady?.();
        onFrame(1);
        return;
      }

      video.pause();

      target = cur = progress();

      onReady?.();

      addEventListener("scroll", onScroll, {
        passive: true
      });

      addEventListener("resize", onScroll);

      raf = requestAnimationFrame(tick);
    };

    const onLoaded = () => {
      if (startTimer) {
        clearTimeout(startTimer);
      }

      if (
        video.duration &&
        Number.isFinite(video.duration)
      ) {
        video.currentTime = 0;
      }

      startTimer = setTimeout(start, 150);
    };

    const onVideoError = () => {
      if (startTimer) {
        clearTimeout(startTimer);
      }

      onError?.();
    };

    video.addEventListener(
      "loadedmetadata",
      onLoaded
    );

    video.addEventListener(
      "loadeddata",
      onLoaded
    );

    video.addEventListener(
      "error",
      onVideoError
    );

    if (video.readyState >= 2) {
      onLoaded();
    }

    const fallback = setTimeout(() => {
      if (video.readyState >= 1) {
        start();
      } else {
        onError?.();
      }
    }, 8000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      clearTimeout(startTimer);

      video.removeEventListener(
        "loadedmetadata",
        onLoaded
      );

      video.removeEventListener(
        "loadeddata",
        onLoaded
      );

      video.removeEventListener(
        "error",
        onVideoError
      );

      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [
    trackRef,
    videoRef,
    onFrame,
    onReady,
    onError,
    endAt
  ]);
}
