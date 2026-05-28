"use client";

import { useEffect, useState } from "react";

import styles from "./VoiceRecorder.module.css";
import { Waveform } from "./Waveform";
import { useVoiceWaveform } from "./useVoiceWaveform";

/* ─────────────────────────────────────────
   VoiceRecorder

   Inline-режим записи в toolbar композера.
   Управляется stage'ом извне:
   • "recording" — micro активен, waveform
     стримит, timer тикает;
   • "processing" — после нажатия Stop:
     waveform приглушается, timer заменяется
     на «Обработка…» с animated dots. Через
     ~1.2s родитель ComposerInput вернёт
     idle-state и покажет Toast «демо…».
   ───────────────────────────────────────── */

type Stage = "recording" | "processing";

type Props = {
  stage: Stage;
};

export function VoiceRecorder({ stage }: Props) {
  // Микрофон активен только в recording'е. В
  // processing'е waveform "замораживается" —
  // показывает последний снимок, audio-stream
  // остановлен ради экономии ресурсов и индика-
  // ции «обработки» в браузере.
  const { barsRef, lastSampleRef, sampleIntervalMs, source } =
    useVoiceWaveform(stage === "recording");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (stage !== "recording") return;
    if (source === "idle") return;
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage, source]);

  const mm = Math.floor(seconds / 60).toString();
  const ss = (seconds % 60).toString().padStart(2, "0");

  return (
    <div
      className={styles.recorder}
      data-stage={stage}
      role="status"
      aria-label={stage === "recording" ? "Запись голоса" : "Обработка записи"}
    >
      <Waveform
        barsRef={barsRef}
        lastSampleRef={lastSampleRef}
        sampleIntervalMs={sampleIntervalMs}
      />
      {stage === "recording" ? (
        <span className={styles.timer}>
          {mm}:{ss}
        </span>
      ) : null}
    </div>
  );
}
