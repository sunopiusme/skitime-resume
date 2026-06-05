"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import styles from "./ComposerInput.module.css";
import LcdMarquee, {
  type LcdAccessLevel,
  type LcdColorMode,
  type LcdTone,
  type PetMood,
} from "./LcdMarquee";
import { AttachmentTile } from "./attachments/AttachmentTile";
import { useAttachments } from "./attachments/useAttachments";
import { MentionPopover } from "./mentions/MentionPopover";
import { PLUGINS } from "./mentions/data";
import { PluginIcon } from "./mentions/PluginIcon";
import { useMentions } from "./mentions/useMentions";
import type { MentionItem } from "./mentions/types";
import { ModelPicker } from "./models/ModelPicker";
import { DEFAULT_SELECTION } from "./models/data";
import type { ModelSelection } from "./models/types";
import { PermissionPicker } from "./permissions/PermissionPicker";
import type { PermissionLevel } from "./permissions/types";
import { ProjectPicker } from "./projects/ProjectPicker";
import { DEFAULT_PROJECT } from "./projects/data";
import type { ProjectSelection } from "./projects/types";
import { EnvironmentPicker } from "./environment/EnvironmentPicker";
import type { EnvironmentMode } from "./environment/types";
import { BranchPicker } from "./branches/BranchPicker";
import { DEFAULT_BRANCH } from "./branches/data";
import { Tooltip } from "./Tooltip";
import { VoiceRecorder } from "./voice/VoiceRecorder";

/* ─────────────────────────────────────────
   Иконки. Все 1.5 px stroke, currentColor.
   Намеренно простые SVG — без зависимостей.
   ───────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M14 11V4.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M17 11V6.5a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2L6.5 14a1.5 1.5 0 0 1 2.4-1.8L11 14" />
      <path d="M11 11V8" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 19v3" />
    </svg>
  );
}

/* Pause-glyph для media-control в recording-state.
   Фактически это Stop (square) — Apple/OpenAI
   используют square-индикатор для «остановить
   запись». Pause (две черты) был бы про «пауза-
   возобновить», что в нашей модели не поддержи-
   вается. */
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
    </svg>
  );
}

/* Spinner для processing-state mic-кнопки.
   Круглая дуга 270° на тёмном track'е, крутится
   через CSS-rotate (см. .iconBtn[data-loading]).
   stroke-linecap round — концы дуги мягкие. */
function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" opacity="0.18" />
      <path d="M20 12a8 8 0 0 1-8 8" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function RepoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14H6.5a2.5 2.5 0 0 0 0 5H19" />
      <path d="M4 5.5V20a2.5 2.5 0 0 0 2.5 2.5" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8.5 21h7M12 17v4" />
    </svg>
  );
}

function BranchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="7" r="2" />
      <path d="M6 7v10" />
      <path d="M18 9c0 4-4 4-6 5" />
    </svg>
  );
}

/* Иконки dropdown-меню. */

function ClipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12.5 12.5 20a4.5 4.5 0 0 1-6.4-6.4l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.5 1.5 0 0 1-2.1-2.1l7-7" />
    </svg>
  );
}

function ListChecksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 6 1.5 1.5L8 5" />
      <path d="m4 13 1.5 1.5L8 11" />
      <path d="m4 20 1.5 1.5L8 18" />
      <path d="M11 6h10" />
      <path d="M11 13h10" />
      <path d="M11 20h10" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

/* Slash glyph для keycap'а в tooltip'е.
   ViewBox 24×24 — как у остальных icon'ок.
   Линия идёт от (8, 17) до (16, 7) — это
   центрально-симметричный slash с равными
   отступами от верхне-правого и нижне-левого
   углов окружности keycap'а. */
function SlashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M16 7 8 17" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Plus dropdown — отдельный компонент со
   своим состоянием. Открывается по клику,
   закрывается кликом вне или повторным
   нажатием на триггер. Toggles работают
   независимо: каждый держит boolean.
   ───────────────────────────────────────── */

function PlusDropdown({
  planMode,
  onPlanModeChange,
  onAttach,
}: {
  planMode: boolean;
  onPlanModeChange: (next: boolean) => void;
  onAttach: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  // Закрытие при клике вне обёртки.
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <span ref={containerRef} className={styles.plusMenu}>
      <Tooltip
        label="Прикрепить файл и больше"
        shortcut={<SlashIcon />}
      >
        <button
          type="button"
          className={styles.iconBtn}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Прикрепить файл и больше"
          onClick={() => setOpen((prev) => !prev)}
        >
          <PlusIcon />
        </button>
      </Tooltip>
      {open ? (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownGroup}>
            <button
              type="button"
              className={styles.dropdownItem}
              role="menuitem"
              onClick={() => {
                onAttach();
                setOpen(false);
              }}
            >
              <span className={styles.dropdownIcon}>
                <ClipIcon />
              </span>
              <span className={styles.dropdownLabel}>Прикрепить файл</span>
            </button>
          </div>
          <div className={styles.dropdownDivider} />
          <div className={styles.dropdownGroup}>
            <button
              type="button"
              className={styles.dropdownItem}
              role="menuitemcheckbox"
              aria-checked={planMode}
              onClick={() => onPlanModeChange(!planMode)}
            >
              <span className={styles.dropdownIcon}>
                <ListChecksIcon />
              </span>
              <span className={styles.dropdownLabel}>Планирование</span>
              <span className={styles.toggle} data-on={planMode} />
            </button>
          </div>
          <div className={styles.dropdownDivider} />
          <div className={styles.dropdownGroup}>
            <PluginsSubmenuItem />
          </div>
        </div>
      ) : null}
    </span>
  );
}

/* Plugins-пункт с side submenu. Открывается по hover
   на саму строку, submenu рисуется справа от dropdown.
   submenuTrigger держит общий :hover-state через
   group-hover паттерн (через `.pluginsTrigger:hover` →
   соседний `.pluginsSubmenu` визибл). */
function PluginsSubmenuItem() {
  return (
    <div className={styles.pluginsTrigger}>
      <button type="button" className={styles.dropdownItem} role="menuitem">
        <span className={styles.dropdownIcon}>
          <GridIcon />
        </span>
        <span className={styles.dropdownLabel}>Плагины</span>
        <span className={styles.dropdownChevron}>
          <ChevronRightIcon />
        </span>
      </button>
      <div className={styles.pluginsSubmenu} role="menu">
        {PLUGINS.map((plugin) => {
          if (plugin.kind !== "plugin") return null;
          return (
            <button
              key={plugin.id}
              type="button"
                className={styles.pluginItem}
                role="menuitem"
            >
              <PluginIcon id={plugin.id} />
              <span className={styles.pluginItemMain}>
                <span className={styles.pluginItemLabel}>{plugin.label}</span>
                <span className={styles.pluginItemDesc}>{plugin.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Композиция. Статичная, читается как
   единый кадр интерфейса — повторяет
   референс Codex 1:1, но в нашей светлой
   монохромной палитре и на русском.
   ───────────────────────────────────────── */

function PromptInput({
  value,
  disabled,
  canSubmit,
  onValueChange,
  onFocusChange,
  onSubmit,
}: {
  value: string;
  disabled: boolean;
  canSubmit: boolean;
  onValueChange: (next: string) => void;
  onFocusChange: (focused: boolean) => void;
  onSubmit: () => void;
}) {
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow: высота поля подгоняется под содержимое.
  // Ограничено CSS-свойством max-height — после лимита
  // включается внутренний скролл, чтобы композиция не
  // распирала карточку при большом промпте.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const mentions = useMentions({ value, caret, focused });

  const updateCaret = () => {
    const el = ref.current;
    if (!el) return;
    setCaret(el.selectionStart ?? 0);
  };

  // После apply надо вернуть фокус и поставить
  // каретку в конец вставленного текста.
  const applyMention = (item: MentionItem) => {
    const result = mentions.apply(item);
    if (!result) return;
    onValueChange(result.nextValue);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.nextCaret, result.nextCaret);
      setCaret(result.nextCaret);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentions.open) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        mentions.setActiveIndex(
          (mentions.activeIndex + 1) % mentions.flatItems.length,
          "keyboard",
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const next =
          mentions.activeIndex - 1 < 0
            ? mentions.flatItems.length - 1
            : mentions.activeIndex - 1;
        mentions.setActiveIndex(next, "keyboard");
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        const item = mentions.flatItems[mentions.activeIndex];
        if (!item) return;
        event.preventDefault();
        applyMention(item);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        mentions.close();
        return;
      }
    }

    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      if (canSubmit) {
        onSubmit();
      }
    }
  };

  return (
    <div className={styles.inputWrap}>
      <textarea
        ref={ref}
        className={styles.input}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          updateCaret();
        }}
        onKeyUp={updateCaret}
        onClick={updateCaret}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFocused(true);
          onFocusChange(true);
        }}
        onBlur={() => {
          setFocused(false);
          onFocusChange(false);
        }}
        placeholder="Что агент должен изменить?"
        rows={1}
        aria-label="Промпт"
        disabled={disabled}
      />
      {mentions.open ? (
        <MentionPopover
          groups={mentions.groups}
          flatItems={mentions.flatItems}
          activeIndex={mentions.activeIndex}
          activeFromKeyboard={mentions.activeFromKeyboard}
          onHover={(idx) => mentions.setActiveIndex(idx, "mouse")}
          onPick={applyMention}
        />
      ) : null}
    </div>
  );
}

function colorModeForModelLevel(levelId: string): LcdColorMode {
  if (levelId === "low") return "model-low";
  if (levelId === "medium") return "model-medium";
  if (levelId === "high" || levelId === "xhigh") return "model-high";
  if (levelId === "max") return "model-max";
  if (levelId === "ultracode") return "model-ultra";
  return "model-high";
}

export default function ComposerInput() {
  const [prompt, setPrompt] = useState("");
  const [planMode, setPlanMode] = useState(false);
  const [permission, setPermission] = useState<PermissionLevel>("standard");
  const [selection, setSelection] = useState<ModelSelection>(DEFAULT_SELECTION);
  const [project, setProject] = useState<ProjectSelection>(DEFAULT_PROJECT);
  const [environment, setEnvironment] = useState<EnvironmentMode>("local");
  const [branch, setBranch] = useState<string>(DEFAULT_BRANCH);
  const [voiceStage, setVoiceStage] = useState<"idle" | "recording" | "processing">(
    "idle",
  );
  const [dragOver, setDragOver] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const sendTimers = useRef<number[]>([]);
  const attachments = useAttachments();

  const recording = voiceStage === "recording";
  const typing = prompt.trim().length > 0 && voiceStage === "idle";
  const promptReady = prompt.trim().length > 0;

  /* ── LCD-статус ──────────────────────────
     Экран в верхней плашке — приборная панель агента.
     Статус выводится приоритетно из состояний инпута;
     смена модели/доступа/ветки/проекта/вложений даёт
     короткий transient (со своим текстом И настроением
     питомца), затем экран возвращается к покою. */
  const [transient, setTransient] = useState<{
    text: string;
    mood: PetMood;
    tone?: LcdTone;
    accessLevel?: LcdAccessLevel;
    colorMode?: LcdColorMode;
  } | null>(null);
  const firstRender = useRef(true);
  const attachCount = attachments.attachments.length;

  // Transient при смене конфигурации. Каждый эффект ставит
  // короткий статус + уникальное настроение питомца, и
  // сбрасывает их через таймер.
  // Тексты — без букв Ж/Щ/Ш/Ю/Ц (в 5×7 слипаются, см. lcdFont).
  useEffect(() => {
    if (firstRender.current) return;
    const model = selection.modelId.toUpperCase();
    setTransient({
      text: `СМЕНА МОДЕЛИ ${model} ${selection.levelId.toUpperCase()}`,
      mood: "model",
      colorMode: colorModeForModelLevel(selection.levelId),
    });
    const id = setTimeout(() => setTransient(null), 1700);
    return () => clearTimeout(id);
  }, [selection]);

  useEffect(() => {
    if (firstRender.current) return;
    const map: Record<PermissionLevel, string> = {
      standard: "ДОСТУП: СТАНДАРТ",
      review: "ДОСТУП: ПРОВЕРКА",
      full: "ДОСТУП: ПОЛНЫЙ",
    };
    setTransient({
      text: map[permission],
      mood: "access",
      accessLevel: permission,
      colorMode:
        permission === "full"
          ? "access-full"
          : permission === "review"
            ? "access-review"
            : "access-standard",
    });
    const id = setTimeout(() => setTransient(null), 1700);
    return () => clearTimeout(id);
  }, [permission]);

  useEffect(() => {
    if (firstRender.current) return;
    setTransient({
      text: `ПЕРЕХОД НА ВЕТКУ ${branch.toUpperCase()}`,
      mood: "branch",
      colorMode: "branch",
    });
    const id = setTimeout(() => setTransient(null), 1700);
    return () => clearTimeout(id);
  }, [branch]);

  useEffect(() => {
    if (firstRender.current) return;
    setTransient({
      text: planMode ? "ПЛАН: ВКЛ" : "ПЛАН: ВЫКЛ",
      mood: "plan",
      colorMode: "plan",
    });
    const id = setTimeout(() => setTransient(null), 1700);
    return () => clearTimeout(id);
  }, [planMode]);

  useEffect(() => {
    if (firstRender.current) return;
    if (attachCount === 0) return;
    // Склонение: 1 ФАЙЛ, 2-4 ФАЙЛА, 5+ ФАЙЛОВ.
    const mod10 = attachCount % 10;
    const mod100 = attachCount % 100;
    let noun = "ФАЙЛОВ";
    if (mod10 === 1 && mod100 !== 11) noun = "ФАЙЛ";
    else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) noun = "ФАЙЛА";
    setTransient({ text: `${attachCount} ${noun}`, mood: "files", colorMode: "files" });
    const id = setTimeout(() => setTransient(null), 1700);
    return () => clearTimeout(id);
  }, [attachCount]);

  useEffect(() => {
    if (firstRender.current) return;
    if (attachments.lastRejected.length === 0) return;
    setTransient({
      text: "ФАЙЛ НЕ ПРИНЯТ",
      mood: "cancel",
      tone: "danger",
      colorMode: "danger",
    });
    const id = setTimeout(() => setTransient(null), 2200);
    return () => clearTimeout(id);
  }, [attachments.lastRejected]);

  // Снимаем флаг первого рендера после монтирования, чтобы
  // эффекты выше не стреляли transient'ами на старте.
  useEffect(() => {
    firstRender.current = false;
  }, []);

  /* Итоговый статус (приоритет): голос → печать → transient → покой.
     При печати центр намеренно пуст — текст справа от питомца
     отвлекал от набора; «живость» дают сам питомец и «дыхание» в
     правом слоте, а центр молчит. */
  const lcdStatus = (() => {
    if (sending) return "ЗАДАЧА ПРИНЯТА";
    if (voiceStage === "recording") return "ЗАПИСЫВАЕМ...";
    if (voiceStage === "processing") return "РАСПОЗНАЕМ...";
    if (typing) return "";
    if (transient) return transient.text;
    return "ПРОВЕРЬТЕ ХУКИ";
  })();

  /* Настроение питомца — тот же приоритет, что у статуса.
     У каждого действия своя уникальная анимация (см. LcdMarquee):
     listen — слушает (запись), think — думает (обработка),
     type — следит за печатью, transient.mood — реакция на смену
     конкретной настройки, idle — покой. */
  const petMood: PetMood = (() => {
    if (sending) return "plan";
    if (voiceStage === "recording") return "listen";
    if (voiceStage === "processing") return "think";
    if (typing) return "type";
    if (transient) return transient.mood;
    return "idle";
  })();

  /* Тон LCD: transient несёт свой (напр. danger у ошибки голоса);
     иначе в покое горит оранжевое предупреждение «ПРОВЕРЬТЕ ХУКИ»,
     а при печати/голосе — обычный тон. */
  const resting =
    voiceStage === "idle" && !typing && !transient;
  const lcdTone: LcdTone = transient?.tone ?? (resting ? "warning" : "default");
  const lcdColorMode: LcdColorMode = (() => {
    if (voiceStage === "recording") return "voice";
    if (voiceStage === "processing") return "decode";
    if (sending) return "success";
    if (typing) return "typing";
    if (transient?.colorMode) return transient.colorMode;
    if (resting) return "warning";
    return "base";
  })();

  /* Кнопка отправки активна, когда есть, что отправлять:
     текст промпта, прикреплённые файлы или активная запись/обработка
     голоса. В остальных случаях неактивна. */
  const canSend =
    prompt.trim().length > 0 ||
    attachments.attachments.length > 0 ||
    voiceStage !== "idle";
  const canSubmit = canSend && !sending && voiceStage !== "processing";

  // Recording flow: tap mic → recording. Tap again
  // (or pause-glyph) → processing на ~1.2s → LCD-статус
  // «демо» → idle. Demo-only state machine, без
  // backend transcription.
  const handleMicToggle = () => {
    if (voiceStage === "idle") {
      setVoiceStage("recording");
    } else if (voiceStage === "recording") {
      setVoiceStage("processing");
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (voiceStage === "recording") {
      setVoiceStage("processing");
      return;
    }

    setSending(true);
    setTransient(null);
    sendTimers.current.forEach((id) => window.clearTimeout(id));
    sendTimers.current = [];
    const submitTimer = window.setTimeout(() => {
      setPrompt("");
      attachments.clear();
      setSending(false);
      setTransient({ text: "ГОТОВО К НОВОЙ ЗАДАЧЕ", mood: "idle" });
      const readyTimer = window.setTimeout(() => {
        setTransient((current) =>
          current?.text === "ГОТОВО К НОВОЙ ЗАДАЧЕ" ? null : current,
        );
      }, 1900);
      sendTimers.current = [readyTimer];
    }, 720);
    sendTimers.current = [submitTimer];
  };

  useEffect(() => {
    return () => {
      sendTimers.current.forEach((id) => window.clearTimeout(id));
      sendTimers.current = [];
    };
  }, []);

  useEffect(() => {
    if (voiceStage !== "processing") return;
    const id = window.setTimeout(() => {
      setVoiceStage("idle");
      setTransient({ text: "ГОЛОС НЕДОСТУПЕН", mood: "cancel", tone: "danger" });
      window.setTimeout(() => {
        setTransient((current) =>
          current?.text === "ГОЛОС НЕДОСТУПЕН" ? null : current,
        );
      }, 2200);
    }, 1200);
    return () => window.clearTimeout(id);
  }, [voiceStage]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    dragCounter.current += 1;
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragOver(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounter.current = 0;
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) {
      attachments.add(event.dataTransfer.files);
    }
  };

  return (
    <div className={styles.root} aria-label="Демонстрация composer input">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*"
        className={styles.hiddenFile}
        onChange={(event) => {
          if (event.target.files) attachments.add(event.target.files);
          // Сбрасываем value, чтобы можно было выбрать
          // тот же файл повторно (после remove → reattach).
          event.target.value = "";
        }}
      />
      <div className={styles.stack}>
        <div className={styles.warning} role="status">
          <LcdMarquee
            status={lcdStatus}
            mood={petMood}
            tone={lcdTone}
            accessLevel={transient?.accessLevel}
            colorMode={lcdColorMode}
          />
        </div>

        <div
          className={styles.card}
          data-drag={dragOver}
          data-focus={inputFocused}
          data-typing={promptReady}
          data-sending={sending}
          aria-busy={sending}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {attachments.attachments.length > 0 ? (
            <div className={styles.attachmentsRow}>
              {attachments.attachments.map((att) => (
                <AttachmentTile
                  key={att.id}
                  attachment={att}
                  onRemove={attachments.remove}
                  onReorder={attachments.reorder}
                />
              ))}
            </div>
          ) : null}
          <PromptInput
            value={prompt}
            disabled={sending}
            canSubmit={canSubmit}
            onValueChange={setPrompt}
            onFocusChange={setInputFocused}
            onSubmit={handleSubmit}
          />

          {dragOver ? (
            <div className={styles.dropOverlay} aria-hidden="true">
              <div className={styles.dropOverlayInner}>
                <span className={styles.dropOverlayIcon}>
                  <ClipIcon />
                </span>
                <span className={styles.dropOverlayCopy}>
                  <span className={styles.dropOverlayTitle}>
                    Отпустите, чтобы прикрепить
                  </span>
                  <span className={styles.dropOverlayHint}>
                    Изображение или аудио до 25 МБ
                  </span>
                </span>
              </div>
            </div>
          ) : null}

          <div className={styles.toolbar} data-recording={voiceStage !== "idle"}>
            <div className={styles.toolbarLeft}>
              <PlusDropdown
                planMode={planMode}
                onPlanModeChange={setPlanMode}
                onAttach={openFilePicker}
              />
              {voiceStage !== "idle" ? (
                <VoiceRecorder stage={voiceStage} />
              ) : (
                <>
                  <Tooltip label="Уровень доступа">
                    <PermissionPicker level={permission} onChange={setPermission} />
                  </Tooltip>
                  {planMode ? (
                    <span className={styles.modeChip}>
                      <span className={styles.modeChipIcon} aria-hidden="true">
                        <ListChecksIcon />
                      </span>
                      Планирование
                      <button
                        type="button"
                        className={styles.modeChipClose}
                        aria-label="Выключить планирование"
                        onClick={() => setPlanMode(false)}
                      >
                        <CloseIcon />
                      </button>
                    </span>
                  ) : null}
                </>
              )}
            </div>

            <div className={styles.toolbarRight}>
              {voiceStage !== "idle" ? null : (
                <Tooltip label="Выбрать модель">
                  <ModelPicker selection={selection} onChange={setSelection} />
                </Tooltip>
              )}
              <Tooltip
                label={
                  voiceStage === "recording"
                    ? "Остановить запись"
                    : voiceStage === "processing"
                      ? "Обработка"
                      : "Голосовой ввод"
                }
                shortcut={
                  voiceStage === "idle" ? (
                    <>
                      <span aria-hidden="true">⌃</span>
                      <span aria-hidden="true">M</span>
                    </>
                  ) : undefined
                }
              >
                <button
                  type="button"
                  className={styles.iconBtn}
                  data-active={recording}
                  data-loading={voiceStage === "processing"}
                  aria-label={
                    voiceStage === "recording"
                      ? "Остановить запись"
                      : "Голосовой ввод"
                  }
                  aria-pressed={recording}
                  disabled={voiceStage === "processing"}
                  onClick={handleMicToggle}
                >
                  {voiceStage === "processing" ? (
                    <SpinnerIcon />
                  ) : voiceStage === "recording" ? (
                    <PauseIcon />
                  ) : (
                    <MicIcon />
                  )}
                </button>
              </Tooltip>
              <Tooltip label="Отправить">
                <button
                  type="button"
                  className={styles.sendBtn}
                  aria-label="Отправить"
                  disabled={!canSubmit}
                  data-disabled={!canSubmit}
                  data-sending={sending}
                  onClick={handleSubmit}
                >
                  {sending ? <SpinnerIcon /> : <ArrowUpIcon />}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className={styles.context}>
          <ProjectPicker selection={project} onChange={setProject} />
          <EnvironmentPicker mode={environment} onChange={setEnvironment} />
          <BranchPicker branch={branch} onChange={setBranch} />
        </div>
      </div>
    </div>
  );
}
