import styles from "./CharacterGrid.module.css";

/**
 * Секция «Персонажи XSYCOIN» — bento-грид 2×2 героев игры.
 * Каждая ячейка: чёрная карточка со скруглением, внутри — персонаж
 * (PNG с прозрачным фоном) на радиальном свечении СВОИМ цветом, которое
 * растворяется в чистый чёрный фон сцены, как на референсе.
 *
 * Раскладка асимметричная (как в референсе): верхний ряд — узкая капсула
 * слева + широкая ячейка справа; нижний ряд — две широкие ячейки.
 * Цвет ячейки задаётся через CSS-переменную --c (rgb-каналы) на элементе
 * и переиспользуется и свечением, и тонкой обводкой/тенью. Презентационный
 * блок без интерактива (server component).
 */

type Character = {
  src: string;
  alt: string;
  /** rgb-каналы фирменного цвета персонажа — под rgb(var(--c) / a). */
  color: string;
  /** grid-template-area ячейки. */
  area: "capsule" | "purple" | "orange" | "green";
};

const CHARACTERS: Character[] = [
  {
    src: "/projects/xsycoin/character4.png",
    alt: "Зародыш XSY в капсуле",
    color: "173 182 214", // #ADB6D6 — холодный синий
    area: "capsule",
  },
  {
    src: "/projects/xsycoin/character1.png",
    alt: "Фиолетовый герой XSY",
    color: "94 0 235", // #5E00EB — фиолетовый
    area: "purple",
  },
  {
    src: "/projects/xsycoin/character3.png",
    alt: "Оранжевый герой XSY",
    color: "215 72 0", // #D74800 — оранжевый
    area: "orange",
  },
  {
    src: "/projects/xsycoin/character2.png",
    alt: "Зелёный герой XSY",
    color: "163 184 24", // #A3B818 — кислотно-зелёный
    area: "green",
  },
];

export default function CharacterGrid() {
  return (
    <section className={styles.section} aria-labelledby="characters-title">
      <div className={styles.caption}>
        <p className={styles.kicker}>Персонажи</p>
        <h2 id="characters-title" className={styles.title}>
          Четыре формы жизни
        </h2>
      </div>

      <div className={styles.grid}>
        {CHARACTERS.map((c) => (
          <figure
            key={c.area}
            className={`${styles.cell} ${styles[c.area]}`}
            style={{ ["--c" as string]: c.color }}
          >
            <div className={styles.glow} aria-hidden="true" />
            <img
              src={c.src}
              alt={c.alt}
              className={styles.character}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
