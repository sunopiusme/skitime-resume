"use client";

import { useRef, useState, type PointerEvent } from "react";
import styles from "./MiniProfile.module.css";

/**
 * «Мини-профиль» — без рамки устройства. Основной экран приложения
 * (приглушён, отодвинут назад), а поверх него открывается shield-страница
 * мини-профиля в стиле sheet iOS 27: большие скругления, грабер-пилюля,
 * Close — часть самой карточки (единый элемент).
 *
 * Чистый минимализм, без визуального шума:
 *  • Персонажи — три одинаковых круглых пода (аватара) с overflow:hidden,
 *    спрайт жёстко вписан внутрь и центрирован → ровно, ничего не вылезает.
 *    Центр крупнее, выбран — тонкое нейтральное кольцо. Без цветных гало.
 *  • Пагинация-точки вместо имён (4 персонажа).
 *  • Прогресс-бары — тонкие, с подписью слева и нейтральной заливкой,
 *    без процентов-пузырей и knob'ов.
 *  • Планеты пока убраны — сначала персонажи.
 *
 * Масштаб — container-query-юниты (cqw/cqh) от .composition, без media.
 * Client component (состояние выбора персонажа).
 */

type Creature = {
  src: string;
  /** 0..1 — рост персонажа. */
  growth: number;
  /** 0..1 — энергия персонажа. */
  energy: number;
};

const CREATURES: Creature[] = [
  { src: "/projects/xsycoin/character4.png", growth: 0.22, energy: 0.34 },
  { src: "/projects/xsycoin/character3.png", growth: 0.62, energy: 0.78 },
  { src: "/projects/xsycoin/character2.png", growth: 0.84, energy: 0.5 },
  { src: "/projects/xsycoin/character1.png", growth: 0.46, energy: 0.66 },
];

/** Индекс по кольцу: -1 → последний, n → первый. */
const wrap = (i: number, n: number) => ((i % n) + n) % n;

/**
 * Резинка iOS: смещение асимптотически стремится к `limit` и никогда
 * его не переходит — это и есть «дисциплина», плашка не уходит за край.
 */
const rubber = (delta: number, dim: number, limit: number) => {
  if (!delta || limit <= 0) return 0;
  return Math.sign(delta) * limit * (1 - Math.exp(-Math.abs(delta) / (dim * 0.55)));
};

export default function MiniProfile() {
  const [sel, setSel] = useState(1);
  // Каждый клик меняет ключ → слой засветки перемонтируется и волна
  // проигрывается целиком, затем гаснет.
  const [pulse, setPulse] = useState(0);
  const n = CREATURES.length;

  /* `!` — noUncheckedIndexedAccess: массив непуст и статичен,
     wrap() гарантирует индекс в диапазоне 0..n-1. */
  const center = CREATURES[wrap(sel, n)]!;
  const left = CREATURES[wrap(sel - 1, n)]!;
  const right = CREATURES[wrap(sel + 1, n)]!;

  // Spotlight за курсором — как у карточек в списке проектов: пишем
  // координаты прямо в CSS-переменные на узле, минуя React-рендер.
  // Контент неподвижен, живёт только свет.
  const handlePodMove = (e: PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  // ─── Liquid-glass stretch ───
  // Тянем плашку как стекло на iOS 27: следует за пальцем с резиновым
  // сопротивлением, слегка растягиваясь по оси тяги, и не выходит за
  // края сцены. На отпускании пружиной возвращается на место (CSS-
  // transition). Координаты пишем прямо в стиль узла — без ре-рендера.
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    moved: false,
    px: 0,
    py: 0,
    left: 0,
    top: 0,
    w: 0,
    h: 0,
    limL: 0,
    limR: 0,
    limT: 0,
    limB: 0,
    pointerId: -1,
  });

  // Реальное перетаскивание подавляет клик-переключение персонажа,
  // чтобы тяга плашки не «пролистывала» карусель.
  const select = (i: number) => {
    if (drag.current.moved) return;
    setSel(i);
  };

  const onSheetDown = (e: PointerEvent<HTMLDivElement>) => {
    const sheet = sheetRef.current;
    const comp = sheet?.parentElement;
    if (!sheet || !comp) return;

    const sr = sheet.getBoundingClientRect();
    const cr = comp.getBoundingClientRect();
    const d = drag.current;
    d.active = true;
    d.moved = false;
    d.px = e.clientX;
    d.py = e.clientY;
    d.left = sr.left;
    d.top = sr.top;
    d.w = sr.width;
    d.h = sr.height;
    // Запас до краёв сцены × 0.8 — асимптота держит плашку внутри.
    d.limL = Math.max(0, sr.left - cr.left) * 0.8;
    d.limR = Math.max(0, cr.right - sr.right) * 0.8;
    d.limT = Math.max(0, sr.top - cr.top) * 0.8;
    d.limB = Math.max(0, cr.bottom - sr.bottom) * 0.8;
    d.pointerId = e.pointerId;

    sheet.setPointerCapture(e.pointerId);
    sheet.classList.add(styles.dragging!);
    // Точка клика (локальные координаты плашки) — центр расходящейся волны.
    sheet.style.setProperty("--gx", `${e.clientX - sr.left}px`);
    sheet.style.setProperty("--gy", `${e.clientY - sr.top}px`);
    setPulse((p) => p + 1);
  };

  const onSheetMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const sheet = sheetRef.current;
    if (!d.active || !sheet) return;

    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) > 5) d.moved = true;

    // Тянем грань к пальцу, противоположную грань держим как якорь
    // (transform-origin) → стекло удлиняется в сторону тяги и не уходит
    // за край: прирост ≤ запасу до края (и не более 34% своей стороны).
    let sx = 1;
    let sy = 1;
    let ox = "50%";
    let oy = "50%";

    if (dx) {
      const cap = Math.min(dx > 0 ? d.limR : d.limL, d.w * 0.34);
      sx = 1 + Math.abs(rubber(dx, d.w, cap)) / d.w;
      ox = dx > 0 ? "0%" : "100%";
    }
    if (dy) {
      const cap = Math.min(dy > 0 ? d.limB : d.limT, d.h * 0.34);
      sy = 1 + Math.abs(rubber(dy, d.h, cap)) / d.h;
      oy = dy > 0 ? "0%" : "100%";
    }

    sheet.style.transformOrigin = `${ox} ${oy}`;
    sheet.style.transform = `scale(${sx}, ${sy})`;
  };

  const onSheetUp = () => {
    const d = drag.current;
    const sheet = sheetRef.current;
    if (!d.active || !sheet) return;
    d.active = false;

    try {
      sheet.releasePointerCapture(d.pointerId);
    } catch {
      /* pointer уже отпущен */
    }
    sheet.classList.remove(styles.dragging!); // вернуть пружинный transition
    sheet.style.transform = ""; // → spring back к нейтральному
    // d.moved сбросится на следующем pointerdown — клик после драга подавлен.
  };

  return (
    <section className={styles.section} aria-labelledby="miniprofile-title">
      <div className={styles.caption}>
        <p className={styles.kicker}>Профиль</p>
        <h2 id="miniprofile-title" className={styles.title}>
          Мини-профиль поверх экрана
        </h2>
      </div>

      <div className={styles.composition}>
        {/* Основной экран приложения — приглушён, отодвинут назад. */}
        <div className={styles.mainScreen} aria-hidden="true">
          <img src="/xlogo.svg" alt="" className={styles.mainMark} />
          <span className={styles.scrim} />
        </div>

        {/* ── Shield-страница: мини-профиль поверх основного экрана ── */}
        <div
          ref={sheetRef}
          className={styles.sheet}
          role="dialog"
          aria-label="Mini-Profile"
          onPointerDown={onSheetDown}
          onPointerMove={onSheetMove}
          onPointerUp={onSheetUp}
          onPointerCancel={onSheetUp}
        >
          {/* Лёгкая волна света от точки клика по всему sheet (одноразово). */}
          {pulse > 0 && (
            <span key={pulse} className={styles.sheetGlow} aria-hidden="true" />
          )}
          <span className={styles.grabber} aria-hidden="true" />
          <p className={styles.sheetTitle}>Mini-Profile</p>

          {/* Карусель — три одинаковых пода, спрайт вписан внутрь */}
          <div className={styles.carousel}>
            <button
              type="button"
              className={`${styles.pod} ${styles.podSide}`}
              onPointerMove={handlePodMove}
              onClick={() => select(wrap(sel - 1, n))}
              aria-label={`Предыдущий персонаж`}
            >
              <img src={left.src} alt="" className={styles.podImg} />
              <span className={styles.podSheen} aria-hidden="true" />
              <span className={styles.podRing} aria-hidden="true" />
            </button>

            <div className={`${styles.pod} ${styles.podCenter}`}>
              <img
                key={center.src}
                src={center.src}
                alt="Выбранный персонаж"
                className={styles.podImg}
              />
            </div>

            <button
              type="button"
              className={`${styles.pod} ${styles.podSide}`}
              onPointerMove={handlePodMove}
              onClick={() => select(wrap(sel + 1, n))}
              aria-label={`Следующий персонаж`}
            >
              <img src={right.src} alt="" className={styles.podImg} />
              <span className={styles.podSheen} aria-hidden="true" />
              <span className={styles.podRing} aria-hidden="true" />
            </button>
          </div>

          {/* Пагинация */}
          <div className={styles.dots} role="tablist" aria-label="Персонажи">
            {CREATURES.map((c, i) => (
              <button
                key={c.src}
                type="button"
                className={`${styles.dot} ${i === sel ? styles.dotActive : ""}`}
                onClick={() => select(i)}
                aria-label={`Персонаж ${i + 1}`}
                aria-selected={i === sel}
                role="tab"
              />
            ))}
          </div>

          {/* Статы — тонкие чистые бары */}
          <div className={styles.stats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Growth</span>
              <span className={styles.bar}>
                <span className={styles.barFill} style={{ width: `${center.growth * 100}%` }} />
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Energy</span>
              <span className={styles.bar}>
                <span className={styles.barFill} style={{ width: `${center.energy * 100}%` }} />
              </span>
            </div>
          </div>

          {/* Close — часть единой карточки */}
          <button type="button" className={styles.closeBtn}>
            Close
          </button>
        </div>
      </div>
    </section>
  );
}
