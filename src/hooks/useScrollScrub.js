import { useEffect } from "react";

const clamp = (v, a = 0, b = 1) =>
  Math.min(b, Math.max(a, v));

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
    let started = false;

    const getProgress = () => {
      const rect =
        track.getBoundingClientRect();

      return clamp(
        -rect.top /
          Math.max(
            1,
            rect.height -
              window.innerHeight
          )
      );
    };

    const onScroll = () => {
      target = getProgress();
    };

    const seekVideo = (progress, force = false) => {
      if (
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        return;
      }

      const maxTime =
        Math.max(
          0,
          video.duration - 0.05
        );

      const desired =
        clamp(progress / endAt) *
        maxTime;

      if (!Number.isFinite(desired)) {
        return;
      }

      const now = performance.now();
      if (force || (now - lastSeekTimestamp > 25 && Math.abs(desired - lastTime) > 0.01)) {
        try {
          video.currentTime = desired;
          lastTime = desired;
          lastSeekTimestamp = now;
        } catch {}
      }
    };

    const tick = () => {
      current +=
        (target - current) * 0.14;

      const settled =
        Math.abs(target - current) < 0.0002;

      if (settled) {
        current = target;
      }

      seekVideo(current, settled);

      onFrame(current);

      raf =
        requestAnimationFrame(tick);
    };

    const start = () => {
      if (started) {
        return;
      }

      started = true;

      if (reduce) {
        if (
          Number.isFinite(
            video.duration
          ) &&
          video.duration > 0
        ) {
          try {
            video.currentTime =
              Math.max(
                0,
                video.duration - 0.05
              );
          } catch {}
        }

        onReady?.();
        onFrame(1);

        return;
      }

      try {
        video.pause();
      } catch {}

      target = current =
        getProgress();

      onReady?.();
      onFrame(current);
      seekVideo(current, true);

      window.addEventListener(
        "scroll",
        onScroll,
        { passive: true }
      );

      window.addEventListener(
        "resize",
        onScroll
      );

      raf =
        requestAnimationFrame(tick);
    };

    const onLoaded = () => {
      start();
    };

    const onVideoError = () => {
      start();
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
      "canplay",
      onLoaded
    );

    video.addEventListener(
      "canplaythrough",
      onLoaded
    );

    video.addEventListener(
      "error",
      onVideoError
    );

    if (video.readyState >= 1) {
      onLoaded();
    } else {
      try {
        video.load();
      } catch {}
    }

    const fallback =
      window.setTimeout(() => {
        start();
      }, 800);

    return () => {
      cancelAnimationFrame(raf);

      clearTimeout(fallback);

      video.removeEventListener(
        "loadedmetadata",
        onLoaded
      );

      video.removeEventListener(
        "loadeddata",
        onLoaded
      );

      video.removeEventListener(
        "canplay",
        onLoaded
      );

      video.removeEventListener(
        "canplaythrough",
        onLoaded
      );

      video.removeEventListener(
        "error",
        onVideoError
      );

      window.removeEventListener(
        "scroll",
        onScroll
      );

      window.removeEventListener(
        "resize",
        onScroll
      );
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
