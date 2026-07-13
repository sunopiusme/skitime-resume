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
                Агент меняет код быстрее, чем человек успевает его проверить. «Почти правильный»
                код проходит тесты и мёржится без настоящего ревью.
              </dd>
            </div>
            <div className={caseStyles.tldrItem}>
              <dt className={caseStyles.tldrKicker}>Решение</dt>
              <dd className={caseStyles.tldrText}>
                Интерфейс среды разработки, где работу агента можно проверить в три момента:
                контракт до запуска, трейс во время работы, пакет доказательств на ревью.
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
                Узкое место сместилось. Написание кода перестало быть медленной частью разработки —
                медленной стала проверка. Код агента выглядит уверенно, проходит happy-path тесты и
                прячет ошибки намерения, которые всплывают в проде.
              </p>
              <p>
                Существующие инструменты отвечают на вопрос «как сгенерировать код». Но не отвечают
                на три вопроса ревьюера: что агенту разрешено, что он делает прямо сейчас, почему
                его результат можно принять.
              </p>
            </div>
          </div>
        </section>

        {/* 02 — Метод: как задача была сужена (research сжат в одну секцию) */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Как я сузил задачу</h2>
            <div className={caseStyles.prose}>
              <p>
                Разобрал пять сред — Codex, Claude Code, Kiro, Antigravity, Copilot — не по фичам,
                а по точкам, где пользователь теряет контроль: права, контекст, ход работы, diff.
                Документацию и пользовательское трение кодировал отдельно: первая говорит, что
                продукт обещает, второе — где обещание трещит.
              </p>
              <p>
                Повторяющееся трение везде одно: автономность повышает скорость и одновременно цену
                ошибки. Отсюда требование к интерфейсу — дать контроль в трёх моментах: до запуска,
                во время работы, после результата.
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
                доступ, ход работы и доказательства. Все остальное остается чатом с правами на
                репозиторий.
              </span>
            </blockquote>
          </div>
        </section>

        {/* 04 — Решение 1: контракт перед запуском */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>До запуска → контракт</h2>
            <div className={caseStyles.prose}>
              <p>
                Проблема: агент стартует вслепую — параметры запуска размазаны по конфигам и памяти
                пользователя. Codex распределяет контракт между AGENTS.md и облачным окружением,
                Claude Code — между permissions, hooks и MCP, Kiro — по спекам.
              </p>
              <p>
                Решение: композер собирает намерение в исполняемый контракт — задача, файлы,
                проект, ветка, окружение, модель и режим доступа в одном кадре. Остановить агента
                можно до первого изменения, а не разбирать последствия после готового diff.
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
            <h2 className={caseStyles.sectionTitle}>Во время → трейс</h2>
            <div className={caseStyles.prose}>
              <p>
                Проблема: «думающий» агент — чёрный ящик. Пока он работает, интерфейс показывает
                либо спиннер, либо театр размышлений — ни то, ни другое не помогает ревьюеру.
              </p>
              <p>
                Решение: операционный журнал вместо chain-of-thought. Что прочитано, какие команды
                запущены, где агент изменил файл, чем подтверждён результат — след, по которому
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
            <h2 className={caseStyles.sectionTitle}>После → доказательства</h2>
            <div className={caseStyles.prose}>
              <p>
                Проблема: ревью происходит по уверенному тексту. Чат смешивает план, доступ,
                команды, результат и ревью в одну ленту, где всё выглядит одинаково важным.
              </p>
              <p>
                Решение: диспетчерская вместо ленты — линии работ, ограничения, пакет следов
                (команды, тесты, diff, снимки) и явная точка, где человек принимает или отклоняет
                результат.
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
            <h2 className={caseStyles.sectionTitle}>Ограничения и результат</h2>
            <div className={caseStyles.prose}>
              <p>
                Сознательно не строил backend: LLM, очередь задач, GitHub-интеграцию и MCP-сервер.
                Детерминированные сценарии проверяют форму контроля, а не надёжность
                инфраструктуры — для концепта это честнее.
              </p>
              <p>
                Результат — три рабочих прототипа в этом кейсе и критерий, который переносится на
                любую агентную среду: не просить верить агенту, а показывать, почему его результат
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
