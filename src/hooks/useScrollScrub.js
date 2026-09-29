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

    let raf = 0;
    let started = false;
    let startTimer = 0;

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

    const seekVideo = (progress) => {
      if (
        video.readyState < 2 ||
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

      if (video.seekable.length > 0) {
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
        Math.abs(time - lastTime) >
          0.012
      ) {
        try {
          video.currentTime = time;
          lastTime = time;
        } catch {}
      }
    };

    const tick = () => {
      current +=
        (target - current) * 0.14;

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

      video.pause();

      target = current =
        getProgress();

      onReady?.();

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
      if (startTimer) {
        clearTimeout(startTimer);
      }

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

      startTimer =
        window.setTimeout(
          start,
          150
        );
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

    const fallback =
      window.setTimeout(() => {
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
