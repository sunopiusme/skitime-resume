import styles from "./MenuItems.module.css";

/**
 * Секция «Пункты меню» — три iOS-подобные «папки» с сеткой 2×2
 * иконок внутри, под ними центрированные заголовок и подпись.
 * Ячейки смешанной формы: где круг, где скруглённый квадрат (r=24px).
 * Презентационный блок без интерактива (server component).
 */

/** Форма ячейки-иконки. */
type Shape = "circle" | "rounded";

/** Иконка ячейки: либо эмодзи, либо монетный бейдж XSYCOIN. */
type Cell =
  | { kind: "emoji"; glyph: string; label: string; shape: Shape }
  | { kind: "brand"; label: string; shape: Shape };

const bear = (shape: Shape): Cell => ({ kind: "emoji", glyph: "🧸", label: "Мишка", shape });
const hat = (shape: Shape): Cell => ({ kind: "emoji", glyph: "🎩", label: "Волшебная шляпа", shape });
const burger = (shape: Shape): Cell => ({ kind: "emoji", glyph: "🍔", label: "Бургер", shape });
const coin = (shape: Shape): Cell => ({ kind: "brand", label: "XSYCOIN", shape });

/** Три набора — те же иконки в разном порядке и с разной формой ячеек. */
const TILES: { id: string; cells: Cell[] }[] = [
  { id: "tile-1", cells: [bear("rounded"), coin("circle"), hat("circle"), burger("rounded")] },
  { id: "tile-2", cells: [bear("circle"), coin("circle"), burger("rounded"), hat("rounded")] },
  { id: "tile-3", cells: [hat("rounded"), burger("circle"), bear("circle"), coin("circle")] },
];

function Icon({ cell }: { cell: Cell }) {
  const shapeClass = cell.shape === "circle" ? styles.shapeCircle : styles.shapeRounded;

  if (cell.kind === "brand") {
    return (
      <span className={`${styles.cell} ${shapeClass}`} role="img" aria-label={cell.label}>
        <span className={styles.coin} aria-hidden="true">
          <img src="/xlogo.svg" alt="" className={styles.coinGlyph} />
        </span>
      </span>
    );
  }
  return (
    <span className={`${styles.cell} ${shapeClass}`} role="img" aria-label={cell.label}>
      <span className={styles.emoji} aria-hidden="true">
        {cell.glyph}
      </span>
    </span>
  );
}

export default function MenuItems() {
  return (
    <section className={styles.section} aria-labelledby="menu-items-title">
      <div className={styles.tiles}>
        {TILES.map((tile) => (
          <div key={tile.id} className={styles.tile}>
            {tile.cells.map((cell, i) => (
              <Icon key={`${tile.id}-${i}`} cell={cell} />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.caption}>
        <h2 id="menu-items-title" className={styles.title}>
          Пункты меню
        </h2>
        <p className={styles.subtitle}>
          Разберём раздел пунктов меню и что каждый из них делает
        </p>
      </div>
    </section>
  );
}
