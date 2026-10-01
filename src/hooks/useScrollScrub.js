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
    let pendingTime = null;

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

    const performSeek = (time) => {
      if (video.seeking) {
        pendingTime = time;
        return;
      }

      try {
        video.currentTime = time;
        lastTime = time;
        pendingTime = null;
      } catch {}
    };

    const onSeeked = () => {
      if (
        pendingTime !== null &&
        Math.abs(pendingTime - lastTime) > 0.015
      ) {
        const next = pendingTime;
        pendingTime = null;
        performSeek(next);
      }
    };

    const seekVideo = (progress) => {
      if (
        video.readyState < 1 ||
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

      let time = desired;

      /*
       * Protect mobile browsers from seeking
       * outside currently available ranges.
       */
      if (video.seekable && video.seekable.length > 0) {
        const first =
          video.seekable.start(0);

        const last =
          video.seekable.end(
            video.seekable.length - 1
          );

        time = Math.min(
          Math.max(desired, first),
          Math.max(first, last - 0.05)
        );
      }

      if (
        Number.isFinite(time) &&
        Math.abs(time - lastTime) > 0.015
      ) {
        performSeek(time);
      }
    };

    const tick = () => {
      current +=
        (target - current) * 0.16;

      if (
        Math.abs(target - current) <
        0.0002
      ) {
        current = target;
      }

      seekVideo(current);

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
          video.currentTime =
            Math.max(
              0,
              video.duration - 0.05
            );
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
      if (
        Number.isFinite(
          video.duration
        ) &&
        video.duration > 0
      ) {
        try {
          video.currentTime = 0;
        } catch {}
      }

      start();
    };

    const onVideoError = () => {
      // Graceful fallback: start animations even if video fails
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
      "seeked",
      onSeeked
    );

    video.addEventListener(
      "error",
      onVideoError
    );

    if (video.readyState >= 1) {
      onLoaded();
    }

    const fallback =
      window.setTimeout(() => {
        start();
      }, 1200);

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
        "seeked",
        onSeeked
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
