import Link from "next/link";

import CodeBlock from "@/features/projects/composer/parts/CodeBlock";
import InlineFigure from "@/features/projects/composer/parts/InlineFigure";
import {
  LabCapabilityMatrix,
  LabEvidenceStack,
  LabFrictionRadar,
  LabSourceMap,
  LabWorkflowDisk,
} from "@/features/projects/composer/parts/ResearchFigures";
import ThinkingModel from "@/features/projects/composer/live/thinking-model/ThinkingModel";
import ComposerInputV2 from "@/features/projects/composer/live/composer-input-v2/ComposerInput";
import ProjectSidebar from "@/features/projects/composer/live/project-sidebar/ProjectSidebar";
import caseStyles from "@/features/projects/composer/case.module.css";

import { thinkingModelSnippet } from "./snippets/thinking-model";
import { composerInputSnippet } from "./snippets/composer-input";
import { projectSidebarSnippet } from "./snippets/project-sidebar";

/* Нарратив кейса собран как доказательная цепочка:
   контекст (что изменилось) → метод (как кодировались источники) →
   находки (где агентам нужен контроль) → тезис → три решения
   (контракт, трейс, workflow) → закрытие. Research идёт ДО решений,
   потому что требования к контракту, трейсу и ревью рождаются из
   карты трения — секции решений читаются как ответы на находки. */
export default function ComposerCase() {
  return (
    <main id="main" tabIndex={-1} className={caseStyles.page}>
      <header className={caseStyles.topbar} aria-label="Шапка сайта">
        <Link className={caseStyles.brand} href="/" aria-label="Данила Фурманов, на главную">
          Фурманов
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
        {/* Hero — повторяет композицию главной: центрированный пьедестал,
            та же шкала заголовка и лида, без meta-rail и тегов. */}
        <section className={`${caseStyles.hero} ${caseStyles.wide}`} aria-labelledby="case-title">
          <div className={caseStyles.heroHead}>
            <h1 id="case-title" className={caseStyles.heroTitle}>
              Composer, или как работает ADE в новых реалиях разработки
            </h1>
          </div>
        </section>

        {/* 01 — Контекст: что изменилось */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Рабочая поверхность изменилась</h2>
            <div className={caseStyles.prose}>
              <p>
                С генерацией кода агенты давно справляются. Слабое место ADE в другом. Агент меняет
                репозиторий быстрее, чем человек успевает собрать в голове картину риска.
              </p>
              <p>
                В демо всё выглядит безупречно. Чистый репозиторий, прямая задача, готовый
                результат. Живой проект устроен грязнее. Старый код, который страшно трогать.
                Контекст, которого нет в файлах. Зависимости, о которых помнит один человек в
                команде. В такой среде разработчик больше не автор каждой строки. Он тот, кто
                впускает агента в код, наблюдает за его работой и принимает её результат.
              </p>
              <p>
                Поэтому ещё до того, как изменения станут PR, среда должна отвечать на три вопроса.
                Что агенту разрешено. Что он делает прямо сейчас. И почему его работу можно
                принять.
              </p>
            </div>
          </div>
        </section>

        {/* 02 — Метод: как кодировались источники */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Источник важен только по сигналу</h2>
            <div className={caseStyles.prose}>
              <p>
                Документация рассказывает, что продукт обещает. Отзывы показывают, где обещание
                трещит. Дорогие длинные сессии, потерянный контекст, бесконечные запросы прав,
                недоверие к diff, ревью, которое никто не успевает читать. Поэтому я не смешивал
                источники как равные факты, у каждого своя роль.
              </p>
              <p>
                Кодировал я не бренды, а поверхности риска. Облачная песочница Codex, итог которой
                может стать pull request. Права, hooks и MCP у Claude Code. Спеки Kiro, от
                требований к дизайну и задачам. Менеджер агентов и артефакты у Antigravity. Issue,
                который у Copilot уходит агенту и возвращается pull request'ом.
              </p>
              <p>
                Ассистент отвечает на вопросы. ADE ведёт весь цикл. И если интерфейс не показывает
                оркестрацию, права, контекст и проверку, он прячет от разработчика самую опасную
                часть продукта.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Официальные документы отделены от пользовательского трения. Иначе карта путает обещание продукта с тем, что реально ломает работу."
              frame="plain"
            >
              <LabSourceMap />
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              frame="plain"
              caption="Матрица не выбирает победителя. Она показывает повторяющиеся способности категории, которые нельзя прятать за полем чата."
            >
              <LabCapabilityMatrix />
            </InlineFigure>
          </div>
        </section>

        {/* 03 — Находки: где агентам нужен контроль */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Где агентам нужен контроль</h2>
            <div className={caseStyles.prose}>
              <p>
                Повторяющееся трение бьет по одному месту: автономность повышает скорость и
                одновременно цену ошибки. Деньги сгорают на длинных сессиях, контекст устаревает,
                доступ требует подтверждений, diff все равно нужно читать.
              </p>
              <p>
                Называть это UX-мелочами удобно, но неверно. Это список контрольных поверхностей,
                без которых агентная разработка превращается в ставку на уверенный текст.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              frame="plain"
              caption="Карта показывает не статистику рынка, а повторяющиеся точки отказа. Из них рождаются требования к контракту, трейсу и ревью."
            >
              <LabFrictionRadar />
            </InlineFigure>
          </div>
        </section>

        {/* Тезис — вывод исследования и мост к трём решениям */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <blockquote className={caseStyles.pullQuote}>
              <span className={caseStyles.pullQuoteKicker}>Тезис</span>
              <span className={caseStyles.pullQuoteText}>
                ADE заслуживает запуска только тогда, когда интерфейс показывает цель, контекст,
                доступ, ход работы и доказательства. Все остальное остается чатом с правами на
                репозиторий.
              </span>
            </blockquote>
          </div>
        </section>

        {/* 04 — Решение 1: контракт перед запуском */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Контракт перед запуском</h2>
            <div className={caseStyles.prose}>
              <p>
                Композер в ADE не <code>textarea</code>. Это место, где намерение становится
                исполняемым контрактом: задача, файлы, проект, ветка, окружение, модель и режим
                доступа.
              </p>
              <p>
                Если один параметр спрятан, продукт перекладывает риск на память пользователя.
                Codex распределяет контракт между AGENTS.md и облачным окружением. Claude Code
                опирается на permissions, hooks и MCP. Kiro держит дисциплину через specs и
                steering. Интерфейс обязан собрать это в кадр, иначе автономность начинается
                вслепую.
              </p>
              <p>
                Пользователь должен остановить агент до первого изменения, а не разбирать
                последствия после готового diff.
              </p>
            </div>
          </div>

          {/* Pinned scene: композер прилипает к нижней кромке экрана,
              пока проходим стадию «Поверхность». Анимация состояний
              компонента подключится следующим шагом. */}
          <section
            className={caseStyles.composerPin}
            aria-label="Композер: разбор слоёв"
          >
            <div className={caseStyles.composerPinDock} aria-hidden="false">
              <div className={`${caseStyles.composerStage} ${caseStyles.stageMesh}`}>
                <div className={caseStyles.composerPinFrame}>
                  <ComposerInputV2 />
                </div>
              </div>
            </div>
          </section>

          <div className={caseStyles.wide}>
            <CodeBlock
              code={composerInputSnippet.code}
              lang={composerInputSnippet.lang}
              path={composerInputSnippet.path}
              diff={composerInputSnippet.diff}
            />
          </div>
        </section>

        {/* 05 — Решение 2: наблюдаемый трейс */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Наблюдаемый трейс работы агента</h2>
            <div className={caseStyles.prose}>
              <p>
                После запуска контроль держится не на доверии к модели, а на рабочем журнале: что
                прочитано, какие команды запущены, где агент изменил файл и чем подтвержден
                результат.
              </p>
              <p>
                Это не chain-of-thought и не театр размышлений. Нужен операционный след, по которому
                ревьюер восстановит причинность без открытия десяти вкладок.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <div className={`${caseStyles.composerStage} ${caseStyles.stageMesh}`}>
              <div className={caseStyles.composerPinFrame}>
                <ThinkingModel mode="inline" collapsible={false} />
              </div>
            </div>
          </div>

          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              <p>
                Сценарий вынесен из UI, чтобы журнал не зависел от анимации.{" "}
                <code>useThinkingTimeline</code> управляет фазой, раскрытыми шагами и печатью;
                компонент только рендерит состояние. Поэтому один трейс работает в hero, в статье и
                в статичном режиме для <code>prefers-reduced-motion</code>.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <CodeBlock
              code={thinkingModelSnippet.code}
              lang={thinkingModelSnippet.lang}
              path={thinkingModelSnippet.path}
              diff={thinkingModelSnippet.diff}
            />
          </div>
        </section>

        {/* 06 — Решение 3: workflow, доказательства и ревью */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Работа должна доходить до решения</h2>
            <div className={caseStyles.prose}>
              <p>
                Чат не выдерживает агентную разработку. Он смешивает план, доступ, команды,
                результат и ревью в одну ленту, где все выглядит одинаково важным.
              </p>
              <p>
                ADE нужна диспетчерская: линии работ, ограничения, доказательства и явная точка, где
                человек принимает или отклоняет diff.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Проверяемость растет только когда путь отделен на стадии: намерение, спека, контекст, доступ, выполнение, проверка, ревью."
              frame="plain"
            >
              <LabWorkflowDisk />
            </InlineFigure>
          </div>

          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              <p>
                Сайдбар здесь не меню чатов. Он показывает работы в разных состояниях: агент еще
                действует, diff ждет ревью, задача уже закрыта. Сверху навигация и проекты; снизу
                хвост списка и системный футер; между ними пустое поле страницы. Пауза оставлена
                специально: в ADE важнее дистанция между задачами, чем еще один декоративный
                разделитель.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Проекты группируют сессии со статусом: выполнение, проверка, ревью. Это рабочий архив, не бесконечный поток сообщений."
              frame="plain"
            >
              <div className={`${caseStyles.composerStage} ${caseStyles.stageMesh}`}>
                <div className={caseStyles.composerPinFrame}>
                  <ProjectSidebar />
                </div>
              </div>
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <CodeBlock
              code={projectSidebarSnippet.code}
              lang={projectSidebarSnippet.lang}
              path={projectSidebarSnippet.path}
              diff={projectSidebarSnippet.diff}
            />
          </div>

          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              <p>
                Сайдбар обязан отвечать на один вопрос: что требует моего решения сейчас.{" "}
                <code>running</code> означает, что агент еще действует; <code>review</code>, что
                diff готов и нужен человек; <code>done</code>, что задача закрыта.
              </p>
              <p>
                История сообщений вторична. Важны задача, ветка, статус и доказательства. Без этого
                боковая панель быстро превращается в кладбище разговоров, где невозможно отличить
                прогресс от шума.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Ревью начинается не с уверенного ответа, а с пакета следов: сессия, команды, тесты, diff, снимки, pull request."
              frame="plain"
            >
              <LabEvidenceStack />
            </InlineFigure>
          </div>
        </section>

        {/* Закрытие */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>ADE как доказательная среда</h2>
            <div className={caseStyles.prose}>
              <p>
                Composer не клон Codex, Claude Code, Antigravity или Kiro. Это проверка рамки: взять
                источники, закодировать сигналы и превратить их в интерфейсные решения.
              </p>
              <p>
                Я сознательно не строил backend LLM, очередь задач, GitHub-интеграцию и MCP-сервер.
                Детерминированные сценарии лучше подходят для этой задачи: они проверяют форму
                контроля, а не надежность инфраструктуры.
              </p>
              <p>
                Полная версия потребует фоновых сессий, изолированных worktrees, журнала
                подтверждений, diff review, браузерных проверок и памяти проекта. Но главный критерий
                уже ясен: ADE не должен просить верить агенту. Он должен показывать, почему результат
                можно принять.
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
