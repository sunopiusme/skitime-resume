/* ─────────────────────────────────────────
   Liquid-glass refraction filter — порт алгоритма из
   archisvaze/liquid-glass (index.html, SVG-вариант).

   Идея: backdrop-filter: url(#id) с feDisplacementMap
   реально искривляет «подложку» (то, что нарисовано ЗА
   стеклом). У нас за стеклом — светящийся dot-matrix
   canvas, поэтому точки/текст по краям линзы «уходят»
   в стекло, как на референсе.

   Здесь только чистая математика построения карт смещения
   и зеркального блика + сборка строки SVG-фильтра. DOM-
   инъекция фильтра и ResizeObserver — на стороне LcdMarquee.

   Работает только в Chromium (backdrop-filter: url() не
   поддержан в Firefox/Safari) — там слой просто игнорится,
   а CSS-огранка стекла (.glass) остаётся как fallback.
   ───────────────────────────────────────── */

/** Профиль выпуклой кромки (convex squircle из референса). */
const surfaceFn = (x: number): number => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

export type GlassTuning = {
  /** Радиус скругления линзы, px. */
  radius: number;
  /** Ширина преломляющей фаски от края внутрь, px. */
  bezelWidth: number;
  /** «Толщина» стекла — масштабирует величину смещения. */
  glassThickness: number;
  /** Показатель преломления (как в референсе: 1.0–3.0). */
  ior: number;
  /** Доля смещения, попадающая в feDisplacementMap scale. */
  scaleRatio: number;
  /** Предразмытие подложки, stdDeviation (центр линзы). */
  blur: number;
  /** Доп. размытие ТОЛЬКО в зоне фаски — «оптическая толщина»
      кромки при резком центре. */
  bezelBlur: number;
  /** Прозрачность зеркального блика по фаске (0–1). */
  specOpacity: number;
  /** Насыщенность преломлённого края (feColorMatrix saturate). */
  specSaturation: number;
  /** Жёсткий потолок смещения в px — держит эффект сдержанным.
      Реальный пик сдвига ≈ maxShift/2 (карта кодирует 128±127). */
  maxShift: number;
  /** Дисперсия: per-channel смещение ±ca px (синий преломляется
      сильнее). 0 — выключено (один feDisplacementMap). */
  chromaticAberration: number;
  /** Направление ключевого света для блика фаски, рад. */
  lightAngle: number;
  /** Контровой свет на теневой кромке (0–1 от ключевого). */
  counterLight: number;
  /** Ширина зоны блика = bezelWidth × ratio. */
  specWidthRatio: number;
};

/* ── Профиль преломления вдоль фаски (Снелль) ──────────── */
function calculateRefractionProfile(
  glassThickness: number,
  bezelWidth: number,
  ior: number,
  samples: number,
): Float64Array {
  const eta = 1 / ior;
  const refract = (nx: number, ny: number): [number, number] | null => {
    const dot = ny;
    const k = 1 - eta * eta * (1 - dot * dot);
    if (k < 0) return null;
    const sq = Math.sqrt(k);
    return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
  };
  const profile = new Float64Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = i / samples;
    const y = surfaceFn(x);
    const dx = x < 1 ? 0.0001 : -0.0001;
    const y2 = surfaceFn(x + dx);
    const deriv = (y2 - y) / dx;
    const mag = Math.sqrt(deriv * deriv + 1);
    const ref = refract(-deriv / mag, -1 / mag);
    if (!ref) {
      profile[i] = 0;
      continue;
    }
    profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1]);
  }
  return profile;
}

/* ── Карта смещения (R=dx, G=dy в [0..255], 128=ноль) ──── */
function generateDisplacementMap(
  w: number,
  h: number,
  radius: number,
  bezelWidth: number,
  profile: Float64Array,
  maxDisp: number,
): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 128;
    d[i + 1] = 128;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }

  const r = radius;
  const rSq = r * r;
  const r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2;
  const hB = h - r * 2;
  const S = profile.length;

  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op =
        dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
      if (op <= 0 || dist === 0) continue;
      const cos = x / dist;
      const sin = y / dist;
      const bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1);
      const disp = profile[bi] || 0;
      const dX = (-cos * disp) / maxDisp;
      const dY = (-sin * disp) / maxDisp;
      const idx = (y1 * w + x1) * 4;
      d[idx] = (128 + dX * 127 * op + 0.5) | 0;
      d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/* ── Карта зеркального блика по фаске ───────────────────
   Асимметричная: реальная линза освещена СВЕРХУ — рим-каустика
   горит у верхней кромки, на теневой стороне остаётся лишь
   слабый контровой отблеск (counter), как у материалов visionOS.
   Сплошное |dot| прежней версии зажигало обе кромки одинаково —
   «симметричная бижутерия», а не освещённый объект. Кривая
   спада: быстрый ramp в первых 15% фаски (анти-алиас рима),
   затем квадратичное затухание внутрь — каустика чуть ВНУТРИ
   физической кромки, фирменный признак выпуклого стекла. */
function generateSpecularMap(
  w: number,
  h: number,
  radius: number,
  bezelWidth: number,
  angle: number,
  counter: number,
): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  d.fill(0);

  const r = radius;
  const r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2;
  const hB = h - r * 2;
  const sv = [Math.cos(angle), Math.sin(angle)];

  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op =
        dSq < r * r ? 1 : 1 - (dist - Math.sqrt(r * r)) / (Math.sqrt(r1Sq) - Math.sqrt(r * r));
      if (op <= 0 || dist === 0) continue;
      const cos = x / dist;
      const sin = -y / dist;
      const dotRaw = cos * sv[0]! + sin * sv[1]!;
      const lit = Math.max(0, dotRaw) + counter * Math.max(0, -dotRaw);
      const t = Math.min(1, fromSide / bezelWidth);
      const edge = Math.min(1, t / 0.15) * (1 - t) * (1 - t);
      const coeff = lit * edge;
      const col = (255 * coeff) | 0;
      const alpha = (col * coeff * op) | 0;
      const idx = (y1 * w + x1) * 4;
      d[idx] = col;
      d[idx + 1] = col;
      d[idx + 2] = col;
      d[idx + 3] = alpha;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/* ── Маска фаски для bezel-blur ─────────────────────────
   Белый альфа-градиент: максимум у самой кромки, квадратично
   гаснет к внутренней границе фаски. Через неё к подложке
   подмешивается «толстое» размытие — стекло резкое по центру
   и оптически плотное на загибе. */
function generateBezelMask(
  w: number,
  h: number,
  radius: number,
  bezelWidth: number,
): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  d.fill(0);

  const r = radius;
  const r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2;
  const hB = h - r * 2;

  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op =
        dSq < r * r ? 1 : 1 - (dist - Math.sqrt(r * r)) / (Math.sqrt(r1Sq) - Math.sqrt(r * r));
      if (op <= 0) continue;
      const t = Math.min(1, fromSide / bezelWidth);
      const a = (255 * (1 - t) * (1 - t) * op) | 0;
      const idx = (y1 * w + x1) * 4;
      d[idx] = 255;
      d[idx + 1] = 255;
      d[idx + 2] = 255;
      d[idx + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/**
 * Строит innerHTML SVG-фильтра liquid glass под размер w×h.
 * Возвращает null, если элемент ещё не измерен.
 *
 * Цепочка: резкий центр + bezel-blur по маске фаски →
 * преломление (при chromaticAberration > 0 — три feDisplacementMap
 * с разным scale на канал: дисперсия следует геометрии линзы,
 * нулевая в центре, warm-наружу/cool-внутрь у кромки) →
 * рим-сатурация + асимметричный блик → контраст-гард (saturate
 * 1.05 + slope 1.04 / intercept −0.02 прижимает чёрный обратно —
 * «убийца молока» над тёмным полем точек).
 */
export function buildGlassFilterMarkup(
  w: number,
  h: number,
  t: GlassTuning,
): string | null {
  if (w < 2 || h < 2) return null;

  const clampedBezel = Math.min(t.bezelWidth, t.radius - 1, Math.min(w, h) / 2 - 1);
  const profile = calculateRefractionProfile(t.glassThickness, clampedBezel, t.ior, 128);
  const maxDisp = Math.max(...Array.from(profile).map(Math.abs)) || 1;
  const dispUrl = generateDisplacementMap(w, h, t.radius, clampedBezel, profile, maxDisp);
  const specUrl = generateSpecularMap(
    w,
    h,
    t.radius,
    clampedBezel * t.specWidthRatio,
    t.lightAngle,
    t.counterLight,
  );
  const bezelMaskUrl = generateBezelMask(w, h, t.radius, clampedBezel);
  const scale = Math.min(maxDisp, t.maxShift) * t.scaleRatio;
  const ca = t.chromaticAberration;

  // Подложка: общий лёгкий blur + «толстый» blur только в фаске.
  const prepared = [
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${t.blur}" result="base"/>`,
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${t.bezelBlur}" result="soft"/>`,
    `<feImage href="${bezelMaskUrl}" x="0" y="0" width="${w}" height="${h}" result="bmask"/>`,
    `<feComposite in="soft" in2="bmask" operator="in" result="soft_edge"/>`,
    `<feComposite in="soft_edge" in2="base" operator="over" result="prepared"/>`,
    `<feImage href="${dispUrl}" x="0" y="0" width="${w}" height="${h}" result="disp_map"/>`,
  ];

  // Преломление: одно смещение или дисперсия по каналам (синий
  // сильнее красного; screen-смешение легально — каналы дизъюнктны,
  // подложка непрозрачна).
  const displaced =
    ca > 0
      ? [
          `<feDisplacementMap in="prepared" in2="disp_map" scale="${scale - ca}" xChannelSelector="R" yChannelSelector="G" result="d_r"/>`,
          `<feDisplacementMap in="prepared" in2="disp_map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d_g"/>`,
          `<feDisplacementMap in="prepared" in2="disp_map" scale="${scale + ca}" xChannelSelector="R" yChannelSelector="G" result="d_b"/>`,
          `<feColorMatrix in="d_r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="ch_r"/>`,
          `<feColorMatrix in="d_g" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="ch_g"/>`,
          `<feColorMatrix in="d_b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="ch_b"/>`,
          `<feBlend in="ch_r" in2="ch_g" mode="screen" result="rg"/>`,
          `<feBlend in="rg" in2="ch_b" mode="screen" result="displaced"/>`,
        ]
      : [
          `<feDisplacementMap in="prepared" in2="disp_map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="displaced"/>`,
        ];

  const lit = [
    `<feColorMatrix in="displaced" type="saturate" values="${t.specSaturation}" result="displaced_sat"/>`,
    `<feImage href="${specUrl}" x="0" y="0" width="${w}" height="${h}" result="spec_layer"/>`,
    `<feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked"/>`,
    `<feComponentTransfer in="spec_layer" result="spec_faded"><feFuncA type="linear" slope="${t.specOpacity}"/></feComponentTransfer>`,
    `<feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat"/>`,
    `<feBlend in="spec_faded" in2="with_sat" mode="normal" result="lit"/>`,
    // Контраст-гард: blur и блик слегка поднимали чёрную точку и
    // разбавляли хрому — возвращаем панч LED и ночной чёрный.
    `<feColorMatrix in="lit" type="saturate" values="1.05" result="lit_sat"/>`,
    `<feComponentTransfer in="lit_sat"><feFuncR type="linear" slope="1.04" intercept="-0.02"/><feFuncG type="linear" slope="1.04" intercept="-0.02"/><feFuncB type="linear" slope="1.04" intercept="-0.02"/></feComponentTransfer>`,
  ];

  return [...prepared, ...displaced, ...lit].join("");
}
