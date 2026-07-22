import Link from "next/link";

import CodeBlock from "@/features/projects/composer/parts/CodeBlock";
import CodeDrawer from "@/features/projects/composer/parts/CodeDrawer";
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

        {/* TL;DR — первая секция по анатомии главной: вертикальный
            стек «заголовок над текстом» (как «Что делаю» на home),
            а не колоночная полоса под заголовком. Без eyebrow —
            блок сразу начинается с сути. Тексты — исходные,
            меняется только layout. */}
        <section className={caseStyles.part} aria-label="Кейс коротко">
          <div className={caseStyles.column}>
            <dl className={caseStyles.tldr}>
              <div className={caseStyles.tldrItem}>
                <dt className={caseStyles.tldrKicker}>Проблема</dt>
                <dd className={caseStyles.tldrText}>
                  Агент меняет код быстрее, чем человек успевает его проверить. Правдоподобный
                  код проходит базовые тесты, попадает в проект без ревью и скрывает ошибки
                  намерения.
                </dd>
              </div>
              <div className={caseStyles.tldrItem}>
                <dt className={caseStyles.tldrKicker}>Решение</dt>
                <dd className={caseStyles.tldrText}>
                  Интерфейс отвечает контролем в три момента: исполняемый контракт до запуска,
                  операционный трейс во время работы агента и пакет доказательств на ревью.
                </dd>
              </div>
              <div className={caseStyles.tldrItem}>
                <dt className={caseStyles.tldrKicker}>Факты</dt>
                <dd className={caseStyles.tldrText}>
                  Роль: product, UI и код, от исследования среды до рабочего интерфейса.
                  Формат: концепт с тремя живыми прототипами, проверяемыми в браузере. Год: 2026.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 01 — Проблема: конкретная, проверяемая, без воды */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Проблема</h2>
            <div className={caseStyles.prose}>
              <p>
                Узкое место разработки сместилось: медленной частью стало не написание кода, а его
                проверка. Код агента выглядит уверенно, проходит базовые тесты и скрывает ошибки
                намерения, которые проявляются уже в продакшене у пользователей.
              </p>
              <p>
                Существующие инструменты отвечают на вопрос, как сгенерировать код, но не отвечают
                на три вопроса ревьюера: что агенту разрешено, что он делает прямо сейчас и почему
                его результат можно принять без повторной проверки.
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
                на набор функций, а на точки, где пользователь теряет контроль: права, контекст,
                ход работы и diff. Документацию и пользовательское трение кодировал отдельно,
                потому что первая говорит, что продукт обещает, а второе показывает, где обещание
                не выдерживает практики ежедневной работы в большом репозитории.
              </p>
              <p>
                Повторяющееся трение везде одно: автономность повышает скорость и одновременно цену
                ошибки. Отсюда требование к интерфейсу, который даёт пользователю контроль до
                запуска, во время работы и после результата.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure frame="plain">
              <LabSourceMap />
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure frame="plain">
              <LabFrictionRadar />
            </InlineFigure>
          </div>
        </section>

        {/* Тезис — вывод исследования и мост к трём решениям.
            Без подписи и декора: одно крупное высказывание в масштабе
            заголовков секций. Акцент держит типографика, а не рамка. */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <p className={caseStyles.thesis}>
              ADE заслуживает запуска только тогда, когда интерфейс показывает цель, контекст,
              доступ, ход работы и доказательства. Всё остальное остаётся чатом с правами на
              репозиторий.
            </p>
          </div>
        </section>

        {/* 04 — Решение 1: контракт перед запуском */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>До запуска. Контракт</h2>
            <div className={caseStyles.prose}>
              <p>
                Агент стартует вслепую, потому что параметры запуска рассеяны по конфигурациям и
                памяти пользователя: Codex распределяет контракт между AGENTS.md и облачным
                окружением, Claude Code опирается на permissions, hooks и MCP, а Kiro держит
                дисциплину через спеки, которые живут отдельно от самого кода.
              </p>
              <p>
                Композер собирает намерение в исполняемый контракт: задача, файлы, проект, ветка,
                окружение, модель и режим доступа находятся в одном кадре. Пользователь
                останавливает агента до первого изменения, а не разбирает последствия уже после
                готового diff на сотни строк, собранного агентом за один заход.
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

          {/* Код спрятан за строку-виджет: клик мгновенно
              показывает сниппет под ней, ещё клик — скрывает.
              Виджет прижат к сцене — это её «исходник», не новый блок. */}
          <div className={`${caseStyles.wide} ${caseStyles.attach}`}>
            <CodeDrawer file="ComposerInput.tsx" diff={composerInputSnippet.diff}>
              <CodeBlock
                code={composerInputSnippet.code}
                lang={composerInputSnippet.lang}
                path={composerInputSnippet.path}
                diff={composerInputSnippet.diff}
              />
            </CodeDrawer>
          </div>
        </section>

        {/* 05 — Решение 2: наблюдаемый трейс */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Во время работы. Трейс</h2>
            <div className={caseStyles.prose}>
              <p>
                Работающий агент остаётся чёрным ящиком: пока он действует, интерфейс показывает
                либо спиннер, либо театр размышлений, и ни то, ни другое не помогает ревьюеру
                восстановить картину работы и принять результат.
              </p>
              <p>
                Вместо потока размышлений нужен операционный журнал: что прочитано, какие команды
                запущены, где агент изменил файл и чем подтверждён результат. По такому следу
                причинность восстанавливается без открытия десяти вкладок.
              </p>
              <p>
                Сценарий журнала вынесен из UI, чтобы трейс не зависел от анимации: хук{"\u00A0"}
                <code>useThinkingTimeline</code> управляет фазой, раскрытыми шагами и печатью,
                а компонент только рендерит готовое состояние. Поэтому один и тот же трейс
                работает в hero, в статье и в статичном режиме <code>prefers-reduced-motion</code>
                {"\u00A0"}без переписывания сценария и без отдельной статичной версии для кейса и статьи.
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

          <div className={`${caseStyles.wide} ${caseStyles.attach}`}>
            <CodeDrawer file="useThinkingTimeline.ts" diff={thinkingModelSnippet.diff}>
              <CodeBlock
                code={thinkingModelSnippet.code}
                lang={thinkingModelSnippet.lang}
                path={thinkingModelSnippet.path}
                diff={thinkingModelSnippet.diff}
              />
            </CodeDrawer>
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
                Вместо ленты нужна диспетчерская: линии работ, ограничения, пакет следов из команд,
                тестов, diff и снимков, а также явная точка, в которой человек принимает или
                отклоняет результат целиком, одним решением по всему пакету следов.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Проверяемость растёт только тогда, когда путь разделён на стадии: намерение, спеки, контекст, доступ, выполнение, проверка и ревью уже у человека."
              frame="plain"
            >
              <LabWorkflowDisk />
            </InlineFigure>
          </div>

          {/* Такт «сайдбар»: prose → live → code, как у контракта и трейса.
              Без caption под сценой — смысл уже в абзацах; иначе после UI
              складывается стопка «подпись → код → график → подпись». */}
          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              {/* Компоновка абзацев: предложения выровнены по длине,
                  чтобы строки наполнялись равномерно, а nbsp держат
                  чипы статусов при их глаголах и снимают висячие
                  «от шума» в концовках. */}
              <p>
                Сайдбар здесь не меню чатов. Он показывает работы в разных состояниях: агент
                ещё действует, diff ждёт ревью, задача уже закрыта. Проекты группируют сессии
                со статусом — это рабочий архив задач, а не бесконечный поток сообщений.
                Сверху навигация и проекты, снизу хвост списка и системный футер, между ними
                пустое поле страницы. Пауза оставлена специально: в ADE дистанция между
                задачами важнее ещё одного декоративного{"\u00A0"}разделителя или лишней панели
                на и без того плотном экране.
              </p>
              <p>
                Сайдбар обязан отвечать на один вопрос: что требует моего решения сейчас.
                Статус{"\u00A0"}<code>running</code>
                {"\u00A0"}означает, что агент ещё действует. Статус{"\u00A0"}<code>review</code>
                {"\u00A0"}сообщает, что diff готов и нужен человек. Статус{"\u00A0"}<code>done</code>
                {"\u00A0"}закрывает{"\u00A0"}задачу и снимает её с поля внимания до следующего
                запуска агента и нового пакета изменений в проекте.
              </p>
              <p>
                История сообщений вторична. Важны задача, ветка, статус и доказательства работы.
                Без них боковая панель превращается в архив разговоров, где прогресс не
                отличить от{"\u00A0"}шума, а ревью тонет в истории переписки без явного статуса.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <div className={`${caseStyles.composerStage} ${caseStyles.stageMesh}`}>
              <div className={caseStyles.composerPinFrame}>
                <ProjectSidebar />
              </div>
            </div>
          </div>

          <div className={`${caseStyles.wide} ${caseStyles.attach}`}>
            <CodeDrawer file="ProjectSidebar.tsx" diff={projectSidebarSnippet.diff}>
              <CodeBlock
                code={projectSidebarSnippet.code}
                lang={projectSidebarSnippet.lang}
                path={projectSidebarSnippet.path}
                diff={projectSidebarSnippet.diff}
              />
            </CodeDrawer>
          </div>

          {/* Такт «пакет следов»: отдельная мысль после live+code.
              Смысл бывшей подписи — в prose; фигура без caption, чтобы
              не дублировать текст и не склеивать график с виджетом кода. */}
          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              <p>
                Ревью начинается не с уверенного ответа, а с пакета следов: сессия, команды,
                тесты, diff, снимки экрана и pull request с описанием проделанной работы.
                Человек принимает или отклоняет результат по целому пакету, а не по тону
                финального сообщения в чате.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure frame="plain">
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
                инфраструктуры, и для концепта это самый честный срез проверки.
              </p>
              <p>
                Результат кейса состоит из трёх рабочих прототипов и критерия, который переносится
                на любую агентную среду: интерфейс не просит верить агенту, а показывает, почему
                результат можно принять без повторной вычитки каждой строки.
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
