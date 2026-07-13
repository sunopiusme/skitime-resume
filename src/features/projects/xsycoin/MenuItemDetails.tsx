import styles from "./MenuItemDetails.module.css";

/**
 * Список-расшифровка пунктов меню: иконка слева, жирный заголовок и
 * описание справа. Иконки совпадают с плитками секции «Пункты меню».
 * Презентационный блок без интерактива (server component).
 */

type Row =
  | { kind: "emoji"; glyph: string; name: string; title: string; body: string }
  | { kind: "brand"; name: string; title: string; body: string };

const ROWS: Row[] = [
  {
    kind: "emoji",
    glyph: "🧸",
    name: "Мишка",
    title: "Frenx",
    body:
      "Реферальная страница, чтобы звать друзей и зарабатывать больше токенов. Дизайн держится на простоте. Понятные шаги, спокойный путь, ничего лишнего.",
  },
  {
    kind: "brand",
    name: "XSYCOIN",
    title: "Earn",
    body:
      "Раздел с заданиями. Часть простые, часть приносит рекламу от партнёров XSYCOIN. Бывают и обучающие. Они дают не только токены, но и знания.",
  },
  {
    kind: "emoji",
    glyph: "🎩",
    name: "Волшебная шляпа",
    title: "Room",
    body:
      "Личная комната игрока. Здесь живёт бета того, как в будущем вы распорядитесь своими токенами. На отметке 25 тысяч приходит первая коллекция. Уровнем выше тут же открывается ваша экономика в игре.",
  },
  {
    kind: "emoji",
    glyph: "🍔",
    name: "Бургер",
    title: "Foost",
    body:
      "Раздел, чтобы держать пришельца в форме. Тут покупают еду, качают навыки и берут предметы. Скины на энергию и многое другое.",
  },
];

function RowIcon({ row }: { row: Row }) {
  if (row.kind === "brand") {
    return (
      <span className={`${styles.icon} ${styles.iconCircle}`} role="img" aria-label={row.name}>
        <span className={styles.coin} aria-hidden="true">
          <img src="/xlogo.svg" alt="" className={styles.coinGlyph} />
        </span>
      </span>
    );
  }
  return (
    <span className={`${styles.icon} ${styles.iconCircle}`} role="img" aria-label={row.name}>
      <span className={styles.emoji} aria-hidden="true">
        {row.glyph}
      </span>
    </span>
  );
}

export default function MenuItemDetails() {
  return (
    <section className={styles.section} aria-label="Описание пунктов меню">
      <ul className={styles.list}>
        {ROWS.map((row) => (
          <li key={row.title} className={styles.row}>
            <RowIcon row={row} />
            <div className={styles.text}>
              <h3 className={styles.title}>{row.title}</h3>
              <p className={styles.body}>{row.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
