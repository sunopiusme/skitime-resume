import Link from "next/link";

import caseStyles from "@/features/projects/composer/case.module.css";
import WalletHome from "@/features/projects/telegram-wallet/live/wallet-home/WalletHome";

/* Конкурсный кейс: редизайн главного экрана Wallet в Telegram.
   Нарратив повторяет каркас Composer: hero → TL;DR (задача, подход,
   факты) → контекст конкурса → бриф (четыре направления) → решения →
   закрытие. Research (бриф) идёт до решений: направления конкурса
   читаются как требования, а секция решений — как ответы на них. */
export default function TelegramWalletCase() {
  return (
    <main id="main" tabIndex={-1} className={caseStyles.page}>
      <header className={caseStyles.topbar} aria-label="Шапка сайта">
        <Link className={caseStyles.brand} href="/" aria-label="Данила Фурманов, на главную">
          <img src="/xlogo.svg" alt="" aria-hidden="true" className={caseStyles.brandLogo} />
        </Link>
        <nav className={caseStyles.navLinks} aria-label="Основная навигация">
          <Link href="/">Главная</Link>
          <Link href="/projects" aria-current="page">
            Проекты
          </Link>
        </nav>
      </header>

      <article className={caseStyles.article}>
        {/* Hero — центрированный заголовок в масштабе главной. */}
        <section className={`${caseStyles.hero} ${caseStyles.wide}`} aria-labelledby="case-title">
          <div className={caseStyles.heroHead}>
            <h1 id="case-title" className={caseStyles.heroTitle}>
              Wallet в Telegram: главный экран для тех, кто впервые пробует крипту
            </h1>
          </div>
        </section>

        {/* TL;DR — вертикальный стек «заголовок над текстом». */}
        <section className={caseStyles.part} aria-label="Кейс коротко">
          <div className={caseStyles.column}>
            <dl className={caseStyles.tldr}>
              <div className={caseStyles.tldrItem}>
                <dt className={caseStyles.tldrKicker}>Задача</dt>
                <dd className={caseStyles.tldrText}>
                  Переосмыслить главный экран Wallet в Telegram для iOS и Android. Экран должен
                  оставаться простым и понятным человеку, который знакомится с криптовалютой впервые,
                  и при этом соответствовать визуальному языку платформы Telegram.
                </dd>
              </div>
              <div className={caseStyles.tldrItem}>
                <dt className={caseStyles.tldrKicker}>Подход</dt>
                <dd className={caseStyles.tldrText}>
                  Я выстроил экран вокруг четырёх требований брифа: быстрый доступ к отправке и
                  пополнению, ясное разделение Wallet и TON Space, запас под рост числа активов и
                  отдельное место под промо. Главным было не дать новичку потеряться среди функций.
                </dd>
              </div>
              <div className={caseStyles.tldrItem}>
                <dt className={caseStyles.tldrKicker}>Факты</dt>
                <dd className={caseStyles.tldrText}>
                  Роль: product и UI дизайн. Формат: конкурсная работа Wallet in Telegram, редизайн
                  главного экрана для iOS и Android. Год: 2024.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 01 — Контекст: что за конкурс и почему именно главный экран */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Контекст</h2>
            <div className={caseStyles.prose}>
              <p>
                Wallet in Telegram провёл первый конкурс для дизайнеров и предложил заново собрать
                главный экран кошелька. Кошелёк открыт для всех и работает внутри Telegram, и это
                сразу задавало рамку: не строить отдельную вселенную, а остаться в эстетике
                платформы, к которой пользователь уже привык.
              </p>
              <p>
                Главный экран человек видит первым. Здесь и решается, покажется ли криптовалюта
                дружелюбной или отпугнёт сложностью. Я держал в голове не трейдера, а того, кто
                пришёл впервые. Ему должно быть понятно, куда нажать, чтобы отправить и пополнить,
                ещё до того, как он разберётся в остальных функциях.
              </p>
            </div>
          </div>
        </section>

        {/* 02 — Бриф: четыре направления конкурса как требования к экрану */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Бриф</h2>
            <div className={caseStyles.prose}>
              <p>
                Бриф задавал четыре направления. Навигация: на переднем плане быстрый доступ к
                отправке и пополнению, рядом обмен, P2P-маркет, вывод на карту, QR-сканер и
                настройки. Отдельно нужно было решить, как показывать список транзакций.
              </p>
              <p>
                Разделение Wallet и TON Space. TON Space представляет собой децентрализованный кошелёк и
                блокчейн-профиль в TON: свой адрес, поддержка всех TON-активов, включая NFT, и
                подключение к Web3 Mini Apps. Экран должен читаемо показывать оба его состояния,
                включённое и выключенное.
              </p>
              <p>
                Запас под активы. Сегодня это Toncoin, USDT и Bitcoin; доступ к ним остаётся быстрым
                и не вытесняет остальные функции по мере роста списка. И место под промо и кампании:
                розыгрыши, Wallet Earn, Premium-гивэвеи. Их нужно сделать заметными, но не перегрузить
                ими новичка.
              </p>
            </div>
          </div>
        </section>

        {/* Тезис — вывод из брифа и мост к решениям. */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <p className={caseStyles.thesis}>
              Главный экран Wallet выигрывает не количеством функций, а порядком. Сначала идёт то,
              ради чего пришёл новичок: отправить и пополнить. Обмен, TON Space, активы и промо
              выстроены за ними по важности, а не собраны в один ряд.
            </p>
          </div>
        </section>

        {/* 03 — Решение: навигация и первый экран */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Навигация</h2>
            <div className={caseStyles.prose}>
              <p>
                В верхней части экрана расположены баланс и две главные кнопки: отправить и пополнить.
                Это то, ради чего человек открывает кошелёк, поэтому они получают самый крупный
                тап-таргет и не делят внимание ни с чем ещё. Обмен, P2P-маркет, вывод на карту и
                QR-сканер собраны в ряд быстрых действий под балансом, а настройки вынесены в шапку:
                они остаются под рукой, но не занимают первый план.
              </p>
            </div>
          </div>
        </section>

        {/* 04 — Решение: Wallet и TON Space */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Wallet и TON Space</h2>
            <div className={caseStyles.prose}>
              <p>
                Два кошелька я развёл по смыслу, а не по вкладкам. Wallet остаётся простым
                кастодиальным балансом для первых шагов, TON Space выступает блокчейн-профилем со
                своим адресом, NFT и Web3. В выключенном состоянии TON Space показан как приглашение
                с понятной выгодой, а не как скрытая функция. Во включённом состоянии он становится
                равноправным разделом с активами и историей и не ломает привычную структуру главного
                экрана.
              </p>
            </div>
          </div>
        </section>

        {/* 05 — Решение: активы и промо */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Активы и промо</h2>
            <div className={caseStyles.prose}>
              <p>
                Список активов устроен так, чтобы расти без переверстки. Toncoin, USDT и Bitcoin
                занимают первые строки сегодня, а новые токены добавляются тем же паттерном строки и
                не давят на остальные функции. Промо, включая розыгрыши, Wallet Earn и
                Premium-гивэвеи, получает отдельную точку входа над списком. Так его можно заметить,
                но оно не растворяется среди активов и не перегружает новичка.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <div className={`${caseStyles.composerStage} ${caseStyles.stageMesh}`}>
              <WalletHome />
            </div>
          </div>
        </section>

        {/* Закрытие */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Результат</h2>
            <div className={caseStyles.prose}>
              <p>
                В результате получился главный экран Wallet, собранный под первое знакомство с
                криптовалютой. Отправка и пополнение находятся на переднем плане, разделение Wallet и
                TON Space читается с первого взгляда, список активов имеет запас на рост, а промо
                занимает отдельное место. Экран остаётся простым для новичка и сохраняет эстетику
                Telegram.
              </p>
            </div>
          </div>
        </section>
      </article>

      <footer className={caseStyles.sitefooter} aria-label="Подвал сайта">
        <p className={caseStyles.footerNote}>© 2026 Данила Фурманов</p>
      </footer>
    </main>
  );
}
