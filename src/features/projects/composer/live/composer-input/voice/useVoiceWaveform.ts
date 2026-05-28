"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────
   useVoiceWaveform

   Подключается к микрофону через
   MediaDevices.getUserMedia + Web Audio API,
   запускает AnalyserNode и стримит rolling-buffer
   нормализованных amplitude-значений (0..1).

   Принципиально:
   • Буфер живёт в ref'е (barsRef), НЕ в React state.
     Каждый sample-tick перезаписывает массив на
     месте — никаких .slice() и setState'ов на
     каждый кадр (раньше это вызывало full
     re-render и dimming-эффект на canvas
     waveform'е).
   • setState вызывается ТОЛЬКО при смене source
     (idle → live | fake). Этого хватает чтобы
     таймер VoiceRecorder понял когда стартовать.
   • Canvas внутри Waveform читает barsRef
     напрямую в своём rAF-loop'е.

   Если getUserMedia недоступен / отказан /
   небезопасный контекст — переходит в fake-mode
   и генерирует псевдо-сэмплы.
   ───────────────────────────────────────── */

const BARS = 110;
const FAKE_SPEED = 0.06;
/** Интервал между «тиками» waveform'а в ms.
 *  ≈ 14 bars/sec — плотность под референс
 *  Apple Voice Memos / OpenAI ChatGPT Voice. */
const SAMPLE_INTERVAL_MS = 70;

export type VoiceSource = "live" | "fake" | "idle";

export type VoiceWaveform = {
  barsRef: React.MutableRefObject<Float32Array>;
  /** performance.now() в момент последнего shift'а
   *  буфера. Render-loop использует это для
   *  sub-pixel time-based interpolation: envelope
   *  плавно скроллит влево по мере приближения
   *  следующего тика, а не шагает рывками. */
  lastSampleRef: React.MutableRefObject<number>;
  /** Длительность одного sample-tick'а в ms.
   *  Render использует для расчёта interpolation
   *  factor t ∈ [0, 1]. */
  sampleIntervalMs: number;
  source: VoiceSource;
};

export function useVoiceWaveform(active: boolean): VoiceWaveform {
  const barsRef = useRef<Float32Array>(new Float32Array(BARS));
  const [source, setSource] = useState<VoiceSource>("idle");

  // Refs нужны, потому что animation-loop читает
  // последнее значение без re-render'а.
  const sourceRef = useRef<VoiceSource>("idle");
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const fakePhaseRef = useRef(0);
  const lastSampleRef = useRef(0);
  /** Скользящий пиковый уровень для AGC. Decay
   *  0.965 при sample interval 70ms ≈ −1.5dB/sec.
   *  Тихий голос за 1-2 сек дотягивается до
   *  потолка → растягивается в полную амплитуду. */
  const peakRef = useRef(0);
  /** EMA-сглаживание выходного level. Стабилизирует
   *  одиночные «пилы» от breath-noise / клавиатуры,
   *  без потери реактивности. */
  const emaRef = useRef(0);
  /** Порог тишины. Двухуровневый noise gate:
   *  • абсолютный — RMS < SILENCE_RMS считаем
   *    тишиной (комнатный шум всегда отсекаем);
   *  • относительный — RMS < peak * SILENCE_RATIO
   *    тоже тишина. Это критично после речи: peak
   *    вырос, и без относительного порога обычный
   *    breath/room-noise рисовался бы как «толстый
   *    минимум» (level ≈ 10-15%) хотя визуально
   *    должен быть hairline.
   *  Гистерезис не нужен — sample-rate низкий
   *  (14/sec), bouncing практически не виден. */
  const SILENCE_RMS = 0.018;
  const SILENCE_RATIO = 0.09;
  const PEAK_DECAY = 0.965;
  const PEAK_FLOOR = 0.04;
  const EMA_ALPHA = 0.6;

  useEffect(() => {
    if (!active) {
      cleanup();
      barsRef.current = new Float32Array(BARS);
      sourceRef.current = "idle";
      setSource("idle");
      return;
    }

    let cancelled = false;

    const startLive = async () => {
      try {
        if (
          typeof window === "undefined" ||
          !navigator.mediaDevices?.getUserMedia
        ) {
          throw new Error("no-mediaDevices");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;

        const sourceNode = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.6;
        sourceNode.connect(analyser);
        analyserRef.current = analyser;
        dataRef.current = new Uint8Array<ArrayBuffer>(
          new ArrayBuffer(analyser.fftSize),
        );

        sourceRef.current = "live";
        setSource("live");
        loop(performance.now());
      } catch {
        if (cancelled) return;
        sourceRef.current = "fake";
        setSource("fake");
        loop(performance.now());
      }
    };

    const loop = (now: number) => {
      // Sample-throttling: shift буфера + sample
      // только раз в SAMPLE_INTERVAL_MS. Между
      // tick'ами rAF продолжает крутиться, но
      // ничего не делает. Canvas-rendering
      // независим — он рисует тот же буфер каждый
      // кадр.
      if (now - lastSampleRef.current >= SAMPLE_INTERVAL_MS) {
        lastSampleRef.current = now;
        const bars = barsRef.current;
        bars.copyWithin(0, 1);

        let level = 0;
        if (
          sourceRef.current === "live" &&
          analyserRef.current &&
          dataRef.current
        ) {
          const analyser = analyserRef.current;
          const data = dataRef.current;
          analyser.getByteTimeDomainData(data);

          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i]! - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);

          if (rms < SILENCE_RMS || rms < peakRef.current * SILENCE_RATIO) {
            // Тишина / комнатный шум / breath после
            // речи. Резко роняем EMA, чтобы хвост
            // от последнего громкого слова не
            // тянулся жирной линией. На втором
            // семпле тишины level уже < 5%, на
            // третьем — практически 0.
            emaRef.current = emaRef.current * 0.25;
            level = emaRef.current < 0.02 ? 0 : emaRef.current;
          } else {
            peakRef.current = Math.max(
              peakRef.current * PEAK_DECAY,
              PEAK_FLOOR,
              rms,
            );
            const norm = rms / peakRef.current;
            const compressed = Math.min(1, Math.pow(norm, 0.7));
            emaRef.current =
              EMA_ALPHA * compressed + (1 - EMA_ALPHA) * emaRef.current;
            level = emaRef.current;
          }
        } else {
          fakePhaseRef.current += FAKE_SPEED;
          const t = fakePhaseRef.current;
          const env = Math.max(0, 0.5 + 0.55 * Math.sin(t * 0.13));
          const noise = (Math.random() - 0.5) * 0.4;
          const wave =
            Math.sin(t * 1.7) * 0.45 +
            Math.sin(t * 0.6 + 1.2) * 0.35 +
            noise;
          level = Math.max(0, Math.min(1, env * Math.abs(wave)));
        }

        bars[BARS - 1] = level;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    void startLive();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const cleanup = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        /* noop */
      }
      analyserRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        void audioCtxRef.current.close();
      } catch {
        /* noop */
      }
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    dataRef.current = null;
  };

  return { barsRef, lastSampleRef, sampleIntervalMs: SAMPLE_INTERVAL_MS, source };
}

export const VOICE_BARS = BARS;
