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
import AgenticWorkflowLab from "@/features/projects/composer/live/agentic-workflow-lab/AgenticWorkflowLab";
import caseStyles from "@/features/projects/composer/case.module.css";

import { thinkingModelSnippet } from "./snippets/thinking-model";
import { composerInputSnippet } from "./snippets/composer-input";
import { agenticWorkflowLabSnippet } from "./snippets/agentic-workflow-lab";

export default function ComposerCase() {
  return (
    <main id="main" tabIndex={-1} className={caseStyles.page}>
      <header className={caseStyles.topbar} aria-label="Шапка сайта">
        <Link className={caseStyles.brand} href="/" aria-label="Данила Фурманов — на главную">
          Данила Фурманов
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
              Composer, <em className={caseStyles.heroTitleAccent}>или</em> как работает ADE
            </h1>
          </div>

          <div className={caseStyles.heroStage}>
            <ThinkingModel mode="hero" loop />
          </div>
        </section>

        {/* Лаборатория 01 */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <p className={caseStyles.sectionLabel}>Лаборатория 01</p>
            <h2 className={caseStyles.sectionTitle}>Что изменилось в рабочей поверхности</h2>
            <div className={caseStyles.prose}>
              <p>
                Я перестал смотреть на ADE как на «новую IDE». Это другой объект исследования:
                рабочая поверхность, где намерение превращается в план, получает контекст,
                проходит проверку доступа, исполняется агентами и возвращается человеку уже
                не обещанием, а набором доказательств.
              </p>
              <p>
                Поэтому кейс устроен как лаборатория. В выборке есть официальные документы,
                материалы о категории ADE, академическое описание Claude Code и отзывы сообщества.
                Отзывы я не выдаю за статистику. Они нужны как маркеры трения: стоимость,
                лимиты, потеря контекста, недоверие к diff и нагрузка на ревью.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="В выборке смешаны официальные источники, тексты о категории, академический материал и отзывы. У этих источников разный вес, поэтому факты продукта и качественные сигналы не смешиваются."
              frame="plain"
            >
              <LabSourceMap />
            </InlineFigure>
          </div>

          <div className={caseStyles.column}>
            <blockquote className={caseStyles.pullQuote}>
              ADE — это не экран, где AI «помогает писать код». Это рабочая лаборатория:
              здесь важно видеть намерение, ограничения, ход выполнения и доказательства результата.
            </blockquote>
          </div>
        </section>

        {/* Лаборатория 02 */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <p className={caseStyles.sectionLabel}>Лаборатория 02</p>
            <h2 className={caseStyles.sectionTitle}>Как мы кодировали источники</h2>
            <div className={caseStyles.prose}>
              <p>
                Я разложил источники не по брендам, а по функциям рабочей системы. Codex здесь
                важен не как «ещё одна модель», а как облачная задача и путь к pull request.
                Claude Code показывает слой прав, hooks, transcript и MCP. Kiro — спеки и steering.
                Antigravity — связку редактора с менеджером агентов. GitHub Copilot coding agent —
                делегирование задачи из issue в фоновую работу.
              </p>
              <p>
                Такая кодировка быстро показывает разницу между ассистентом и ADE. Ассистент
                отвечает. ADE держит жизненный цикл: оркестрацию, права, контекст, проверку,
                спеки и параллельную работу.
              </p>
            </div>
          </div>
          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Матрица не отвечает на вопрос, кто лучше. Она показывает, какие системные способности повторяются в категории и какие из них интерфейс обязан сделать видимыми."
              frame="plain"
            >
              <LabCapabilityMatrix />
            </InlineFigure>
          </div>
        </section>

        {/* Лаборатория 03 */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <div className={caseStyles.partHeader}>
              <p className={caseStyles.sectionKicker}>Лаборатория 03</p>
              <h2 className={caseStyles.sectionTitle}>Где агентам нужен контроль</h2>
            </div>
            <div className={caseStyles.prose}>
              <p>
                Сигналы из отзывов сходятся в одной точке: автономность ускоряет работу,
                но делает ошибку дороже. Длинные сессии стоят денег, контекст теряется,
                команды требуют прав, а diff всё равно приходится читать. Это не «UX-мелочи»,
                а требования к рабочей поверхности.
              </p>
              <p>
                Первый слой контроля — наблюдаемый трейс. Он не раскрывает приватную цепочку мысли,
                зато показывает операционную картину: что агент читает, какие инструменты вызывает,
                где находится выполнение и на каком основании человек может доверять результату.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Это качественный радар, а не количественный опрос. Он фиксирует повторяющиеся боли из отзывов и переводит их в требования к ADE."
              frame="plain"
            >
              <LabFrictionRadar />
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              label="Трейс как лабораторный прибор"
              caption="Thinking model здесь показывает не «умность» модели, а наблюдаемость выполнения."
              frame="plain"
            >
              <ThinkingModel mode="inline" />
            </InlineFigure>
          </div>

          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              <p>
                В коде сценарий вынесен из UI. <code>useThinkingTimeline</code> отдаёт фазу,
                раскрытые шаги и количество напечатанных символов; компонент только рисует состояние.
                Поэтому один и тот же трейс работает на первом экране, в разборе внутри статьи
                и в статичном кадре для <code>prefers-reduced-motion</code>.
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

        {/* Лаборатория 04 */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <div className={caseStyles.partHeader}>
              <p className={caseStyles.sectionKicker}>Лаборатория 04</p>
              <h2 className={caseStyles.sectionTitle}>Что должен показывать ADE</h2>
            </div>
            <div className={caseStyles.prose}>
              <p>
                Композер в ADE — не <code>textarea</code>. Это контракт перед запуском: задача,
                контекст, окружение, ветка, модель и режим доступа в одном кадре. Композер держит
                их вместе как проверку перед агентной работой, а не декоративную строку ввода.
                В Codex часть этой роли берут на себя AGENTS.md и облачное окружение, в Claude Code —
                права, hooks и MCP, в Kiro — спеки, steering и agent hooks.
              </p>
              <p>
                После запуска нужен не «ответ ассистента», а лаборатория процесса: несколько линий
                работы, явные ограничения, доказательная база и человеческое ревью. Технически
                это слой управления, но в кейсе важнее другой вопрос: что наблюдаем, чем проверяем
                и где человек принимает решение.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <CodeBlock
              code={composerInputSnippet.code}
              lang={composerInputSnippet.lang}
              path={composerInputSnippet.path}
            />
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Живой лабораторный фрагмент: линии работы, рабочие копии, доказательства и ограничения движутся по одному детерминированному сценарию."
              frame="plain"
            >
              <AgenticWorkflowLab />
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Круговая модель показывает, почему ADE нельзя проектировать как один чат: работа проходит через план, контекст, доступ, выполнение, проверку и ревью."
              frame="plain"
            >
              <LabWorkflowDisk />
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Доказательная база превращает автономную работу в проверяемую: лог сессии, команды, тесты, diff, снимки и pull request."
              frame="plain"
            >
              <LabEvidenceStack />
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <CodeBlock
              code={agenticWorkflowLabSnippet.code}
              lang={agenticWorkflowLabSnippet.lang}
              path={agenticWorkflowLabSnippet.path}
            />
          </div>
        </section>

        {/* Рефлексия + closing */}
        <section className={caseStyles.column}>
          <p className={caseStyles.sectionLabel}>Вывод</p>
          <h2 className={caseStyles.sectionTitle}>ADE как среда доказательной работы</h2>
          <div className={caseStyles.prose}>
            <p>
              В Composer нет настоящего LLM-бэкенда, очереди задач, GitHub-интеграции и MCP-сервера.
              Все поведения детерминированы: этот кейс не пытается стать production-клоном Codex,
              Claude Code, Antigravity или Kiro. Его задача другая — показать исследовательский
              каркас: собрать источники, закодировать наблюдения и превратить их в интерфейс.
            </p>
            <p>
              Полноценная версия потребовала бы очереди фоновых сессий, изолированных worktrees,
              журнала подтверждений, ревью diff, проверки через браузер и долгоживущей памяти проекта.
              Здесь важнее другое: ADE должен быть не «местом, где AI что-то сделал», а рабочей
              средой, где каждый шаг можно объяснить, проверить и принять человеком.
            </p>
          </div>
        </section>

        <section className={`${caseStyles.column} ${caseStyles.closing}`}>
          <Link className={caseStyles.backLink} href="/projects">
            ← ко всем проектам
          </Link>
        </section>
      </article>

      <footer className={caseStyles.footer} aria-label="Подвал">
        <span>© {new Date().getFullYear()} Данила Фурманов</span>
        <span className={caseStyles.footerDivider} aria-hidden="true" />
        <span>Кейс № 01 · Composer</span>
      </footer>
    </main>
  );
}
