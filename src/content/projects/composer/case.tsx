import Link from "next/link";

import CodeBlock from "@/features/projects/composer/parts/CodeBlock";
import InlineFigure from "@/features/projects/composer/parts/InlineFigure";
import {
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

          {/* TL;DR — кейс читается за 20 секунд ещё до скролла:
              проблема, решение и факты. Типографика наследует стандарт
              кейса: mono-кикеры как у pullQuote, ink/hairline токены. */}
          <dl className={caseStyles.tldr} aria-label="Кейс коротко">
            <div className={caseStyles.tldrItem}>
              <dt className={caseStyles.tldrKicker}>Проблема</dt>
              <dd className={caseStyles.tldrText}>
                Агент меняет код быстрее, чем человек успевает его проверить. Правдоподобный код
                проходит тесты и попадает в проект без настоящего ревью.
              </dd>
            </div>
            <div className={caseStyles.tldrItem}>
              <dt className={caseStyles.tldrKicker}>Решение</dt>
              <dd className={caseStyles.tldrText}>
                Интерфейс, который делает работу агента проверяемой в три момента: контракт до
                запуска, трейс во время работы, доказательства на ревью.
              </dd>
            </div>
            <div className={caseStyles.tldrItem}>
              <dt className={caseStyles.tldrKicker}>Факты</dt>
              <dd className={caseStyles.tldrText}>
                Product, UI, код · Концепт с рабочими прототипами · 2026
              </dd>
            </div>
          </dl>
        </section>

        {/* 01 — Проблема: конкретная, проверяемая, без воды */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Проблема</h2>
            <div className={caseStyles.prose}>
              <p>
                Узкое место разработки сместилось. Медленной частью перестало быть написание кода.
                Медленной стала проверка. Код агента выглядит уверенно, проходит базовые тесты и
                скрывает ошибки намерения, которые проявляются уже в продакшене.
              </p>
              <p>
                Существующие инструменты отвечают на вопрос, как сгенерировать код. При этом они не
                отвечают на три вопроса ревьюера. Что агенту разрешено. Что он делает прямо сейчас.
                Почему его результат можно принять.
              </p>
            </div>
          </div>
        </section>

        {/* 02 — Метод: как задача была сужена (research сжат в одну секцию) */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Исследование</h2>
            <div className={caseStyles.prose}>
              <p>
                Я разобрал пять сред: Codex, Claude Code, Kiro, Antigravity и Copilot. Смотрел не
                на набор функций, а на точки, где пользователь теряет контроль. Это права,
                контекст, ход работы и diff. Документацию и пользовательское трение кодировал
                отдельно. Первая говорит, что продукт обещает. Второе показывает, где обещание не
                выдерживает практики.
              </p>
              <p>
                Повторяющееся трение везде одно. Автономность повышает скорость и одновременно цену
                ошибки. Отсюда требование к интерфейсу: дать пользователю контроль до запуска, во
                время работы и после результата.
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
                доступ, ход работы и доказательства. Всё остальное остаётся чатом с правами на
                репозиторий.
              </span>
            </blockquote>
          </div>
        </section>

        {/* 04 — Решение 1: контракт перед запуском */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>До запуска. Контракт</h2>
            <div className={caseStyles.prose}>
              <p>
                Агент стартует вслепую, потому что параметры запуска рассеяны по конфигурациям и
                памяти пользователя. Codex распределяет контракт между AGENTS.md и облачным
                окружением. Claude Code опирается на permissions, hooks и MCP. Kiro держит
                дисциплину через спеки.
              </p>
              <p>
                Композер собирает намерение в исполняемый контракт. Задача, файлы, проект, ветка,
                окружение, модель и режим доступа находятся в одном кадре. Пользователь
                останавливает агента до первого изменения, а не разбирает последствия после
                готового diff.
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
            <h2 className={caseStyles.sectionTitle}>Во время работы. Трейс</h2>
            <div className={caseStyles.prose}>
              <p>
                Работающий агент остаётся чёрным ящиком. Пока он действует, интерфейс показывает
                либо спиннер, либо театр размышлений. Ни то, ни другое не помогает ревьюеру.
              </p>
              <p>
                Вместо потока размышлений нужен операционный журнал. Что прочитано, какие команды
                запущены, где агент изменил файл и чем подтверждён результат. По такому следу
                причинность восстанавливается без открытия десяти вкладок.
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
                <code>useThinkingTimeline</code> управляет фазой, раскрытыми шагами и печатью.
                Компонент только рендерит состояние. Поэтому один трейс работает в hero, в статье и
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
            <h2 className={caseStyles.sectionTitle}>После результата. Доказательства</h2>
            <div className={caseStyles.prose}>
              <p>
                Ревью происходит по уверенному тексту. Чат смешивает план, доступ, команды,
                результат и проверку в одну ленту, где всё выглядит одинаково важным.
              </p>
              <p>
                Вместо ленты нужна диспетчерская. Линии работ, ограничения, пакет следов из команд,
                тестов, diff и снимков, а также явная точка, где человек принимает или отклоняет
                результат.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Проверяемость растёт только тогда, когда путь разделён на стадии: намерение, спека, контекст, доступ, выполнение, проверка, ревью."
              frame="plain"
            >
              <LabWorkflowDisk />
            </InlineFigure>
          </div>

          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              <p>
                Сайдбар здесь не меню чатов. Он показывает работы в разных состояниях: агент ещё
                действует, diff ждёт ревью, задача уже закрыта. Сверху расположены навигация и
                проекты, снизу хвост списка и системный футер, между ними пустое поле страницы.
                Пауза оставлена специально. В ADE важнее дистанция между задачами, чем ещё один
                декоративный разделитель.
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
                <code>running</code> означает, что агент ещё действует. <code>review</code>{" "}
                сообщает, что diff готов и нужен человек. <code>done</code> закрывает задачу.
              </p>
              <p>
                История сообщений вторична. Важны задача, ветка, статус и доказательства. Без них
                боковая панель превращается в архив разговоров, где невозможно отличить прогресс от
                шума.
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
            <h2 className={caseStyles.sectionTitle}>Ограничения и результат</h2>
            <div className={caseStyles.prose}>
              <p>
                Я сознательно не строил backend: LLM, очередь задач, интеграцию с GitHub и
                MCP-сервер. Детерминированные сценарии проверяют форму контроля, а не надёжность
                инфраструктуры. Для концепта это честнее.
              </p>
              <p>
                Результат кейса состоит из трёх рабочих прототипов и критерия, который переносится
                на любую агентную среду. Интерфейс не просит верить агенту. Он показывает, почему
                результат можно принять.
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
