"use client";

import { useCallback, useEffect, useState } from "react";

import styles from "./CodeBlock.module.css";

type Props = {
  source: string;
};

export default function CopyButton({ source }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [source]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className={styles.copy}
      data-state={copied ? "copied" : "idle"}
      onClick={handleCopy}
      aria-label={copied ? "Скопировано" : "Скопировать код"}
    >
      <span className={styles.copyIconStack} aria-hidden="true">
        <CopyIcon />
        <CheckIcon />
      </span>
      <span className={styles.copyTooltip} aria-hidden="true">
        {copied ? "Скопировано" : "Скопировать"}
      </span>
      <span className={styles.copySrOnly} role="status" aria-live="polite">
        {copied ? "Скопировано" : ""}
      </span>
    </button>
  );
}

function CopyIcon() {
  return (
    <svg
      className={`${styles.copyIcon} ${styles.copyIconCopy}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5.25" y="5.25" width="7.5" height="7.5" rx="1.5" />
      <path d="M10.75 5.25V3.75A1.5 1.5 0 0 0 9.25 2.25h-4.5A1.5 1.5 0 0 0 3.25 3.75v4.5A1.5 1.5 0 0 0 4.75 9.75h1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className={`${styles.copyIcon} ${styles.copyIconCheck}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8.25 6.6 11.35 12.5 5.25" />
    </svg>
  );
}
