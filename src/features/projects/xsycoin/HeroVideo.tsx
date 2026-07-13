"use client";

import { useEffect, useRef } from "react";

import styles from "./XsycoinHero.module.css";

/**
 * Персонажи XSYCOIN — фоновый boomerang-ролик (forward+reverse), нативный
 * loop даёт гладкий пинг-понг. Чёрный фон растворяется через
 * mix-blend-mode: screen.
 *
 * Баг: при уходе окна в фон (другой спейс/приложение macOS) браузер
 * троттлит проигрывание и оставляет видео на чёрном/пустом кадре — screen
 * делает его прозрачным, персонажи пропадают; при возврате видно мерцание.
 *
 * Лечение: перед уходом в фон НЕ оставляем видео играть, а ставим его на
 * паузу. Паузный кадр — это настоящий рендер <video> (та же яркость, тот же
 * чистый чёрный, идеально сливается со сценой) и он не зависит от декодера,
 * пока окно перекрыто. При возврате — play(). Никакого canvas и кросс-
 * фейдов, поэтому нет ни «серого» налёта от подложки, ни провала яркости.
 *
 * Ловим И вкладку (visibilitychange), И фокус окна (blur/focus): при
 * переключении спейсов macOS document.hidden остаётся false, и только
 * blur/focus сообщают об уходе.
 *
 * prefers-reduced-motion — видео просто на паузе (статичный кадр).
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      v.pause();
      return;
    }

    // Заморозить ролик на текущем живом кадре, пока окно в фоне.
    const hold = () => v.pause();
    // Оживить ролик при возврате.
    const resume = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const onVisibility = () => {
      if (document.hidden) hold();
      else resume();
    };

    document.addEventListener("visibilitychange", onVisibility);
    // blur/focus ловят то, что visibilitychange пропускает: переключение
    // спейсов macOS и уход на другое полноэкранное приложение.
    window.addEventListener("blur", hold);
    window.addEventListener("focus", resume);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", hold);
      window.removeEventListener("focus", resume);
    };
  }, []);

  return (
    <div className={styles.media}>
      <video
        ref={videoRef}
        className={styles.mediaVideo}
        src="/projects/xsycoin/herovideo-loop.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        disablePictureInPicture
      />
    </div>
  );
}
