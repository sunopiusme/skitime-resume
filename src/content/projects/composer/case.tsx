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
import ComposerInput from "@/features/projects/composer/live/composer-input/ComposerInput";
import AgenticWorkflowLab from "@/features/projects/composer/live/agentic-workflow-lab/AgenticWorkflowLab";
import caseStyles from "@/features/projects/composer/case.module.css";

import { thinkingModelSnippet } from "./snippets/thinking-model";
import { composerInputSnippet } from "./snippets/composer-input";
import { agenticWorkflowLabSnippet } from "./snippets/agentic-workflow-lab";

export default function ComposerCase() {
  return (
    <main id="main" tabIndex={-1} className={caseStyles.page}>
      <header className={caseStyles.topbar} aria-label="Шапка сайта">
        <Link className={caseStyles.brand} href="/" aria-label="Данила Фурманов, на главную">
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

        {/* 01 */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Что изменилось в рабочей поверхности</h2>
            <div className={caseStyles.prose}>
              <p>
                Composer здесь не продуктовый анонс, а вскрытие рабочей поверхности. Короткие
                демо ADE обычно показывают счастливый путь в стерильном репозитории. Самое важное
                остается за кадром: что происходит, когда агент получает старый код, мутный контекст
                и задачу, которую нельзя проверить на глаз.
              </p>
              <p>
                ADE перестает быть редактором с подсказками. Он выбирает контекст, строит план,
                меняет файлы и приносит человеку уже готовый diff. В этот момент разработчик
                становится не автором каждой строки, а диспетчером процесса, который может ошибаться
                быстро и убедительно. Главная проблема не в генерации. Главная проблема в проверке:
                агент успевает сделать больше, чем команда успевает понять.
              </p>
              <p>
                Поэтому я смешал документы, категорийные тексты, академическое описание Claude Code
                и отзывы пользователей. Не как равные доказательства. Документы говорят, что системы
                обещают. Отзывы показывают, где это обещание начинает скрипеть: лимиты, цена длинных
                сессий, потерянный контекст, diff без доверия и ревью, которое внезапно стало узким
                местом.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="У источников разный вес. Продуктовые факты лежат отдельно от пользовательского трения, иначе карта быстро превращается в шум."
              frame="plain"
            >
              <LabSourceMap />
            </InlineFigure>
          </div>

          <div className={caseStyles.column}>
            <blockquote className={caseStyles.pullQuote}>
              ADE начинается там, где интерфейс показывает не «магический ответ», а намерение,
              границы доступа, ход работы и следы, по которым результат можно принять или отклонить.
            </blockquote>
          </div>
        </section>

        {/* 02 */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <h2 className={caseStyles.sectionTitle}>Как мы кодировали источники</h2>
            <div className={caseStyles.prose}>
              <p>
                Я кодировал источники не по брендам, а по тому, какую часть рабочей системы они
                вскрывают. Codex важен как облачная задача, которая доходит до pull request. Claude
                Code показывает слой прав, hooks, transcript и MCP. Kiro держит дисциплину через
                спеки и steering. Antigravity связывает редактор с менеджером агентов. Copilot
                coding agent делегирует задачу из issue в фоновую работу.
              </p>
              <p>
                Разница становится резкой. Ассистент отвечает. ADE держит цикл работы: оркестрацию,
                права, контекст, проверку, спеки и параллельные сессии. Если интерфейс этого не
                показывает, он скрывает самую рискованную часть продукта.
              </p>
            </div>
          </div>
          <div className={caseStyles.wide}>
            <InlineFigure frame="plain">
              <LabCapabilityMatrix caption="Матрица не ранжирует продукты. Она показывает, какие способности повторяются в категории и почему их нельзя прятать за обычным полем чата." />
            </InlineFigure>
          </div>
        </section>

        {/* 03 */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <div className={caseStyles.partHeader}>
              <h2 className={caseStyles.sectionTitle}>Где агентам нужен контроль</h2>
            </div>
            <div className={caseStyles.prose}>
              <p>
                Пользовательские жалобы сходятся в одном месте: автономность ускоряет работу,
                но повышает цену ошибки. Длинные сессии стоят денег, контекст вымывается, команды
                требуют прав, а diff все равно приходится читать. Это легко назвать мелочами UX,
                хотя на деле перед нами список поверхностей, без которых агентная разработка
                становится азартной игрой.
              </p>
              <p>
                Первый слой контроля: наблюдаемый трейс. Он не должен имитировать приватную цепочку
                мысли. Ему достаточно показать рабочую картину: что агент читает, какие инструменты
                запускает, где застрял и на каких следах человек сможет проверить результат.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              frame="plain"
            >
              <LabFrictionRadar caption="Не статистика, а карта повторяющегося трения, из которого вырастают требования к ADE." />
            </InlineFigure>
          </div>

          <div className={caseStyles.column}>
            <div className={caseStyles.transitionNote}>
              <p>
                Радар фиксирует зоны риска, а ниже этот контроль становится интерфейсом: коротким
                журналом того, что агент читает, запускает и приносит человеку на проверку.
              </p>
            </div>
          </div>

          <div className={caseStyles.column}>
            <InlineFigure frame="plain">
              <ThinkingModel mode="inline" />
            </InlineFigure>
          </div>

          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              <p>
                Сценарий вынесен из UI намеренно. <code>useThinkingTimeline</code> отдает фазу,
                раскрытые шаги и позицию печати; компонент только рисует состояние. Один и тот же
                трейс поэтому живет в hero, в разборе внутри статьи и в статичном варианте для
                <code>prefers-reduced-motion</code>.
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

        {/* 04 */}
        <section className={caseStyles.part}>
          <div className={caseStyles.column}>
            <div className={caseStyles.partHeader}>
              <h2 className={caseStyles.sectionTitle}>Что должен показывать ADE</h2>
            </div>
            <div className={caseStyles.prose}>
              <p>
                Композер в ADE не <code>textarea</code>. Это контракт перед запуском. В одном кадре
                должны быть задача, контекст, окружение, ветка, модель и режим доступа. Если этого
                нет, пользователь не запускает работу, а бросает намерение в темную коробку. В Codex
                часть контракта держат AGENTS.md и облачное окружение. В Claude Code эту роль
                берут права, hooks и MCP, в Kiro: спеки, steering и agent hooks.
              </p>
              <p>
                После запуска нужен не ответ ассистента, а диспетчерская: несколько линий работы,
                явные ограничения, доказательства и место для человеческого решения. Технически это
                слой управления. Для продукта это способ не потерять авторство в системе, которая уже
                действует сама.
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
              <div className={caseStyles.composerPinFrame}>
                <ComposerInput />
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

          <div className={caseStyles.column}>
            <div className={caseStyles.prose}>
              <p>
                Дальше не схема, а рабочая поверхность. Сайдбар разрезан пополам: сверху навигация,
                проекты и начало чатов; снизу хвост списка и системный футер. Между ними оставлена
                пустота страницы, потому что в ADE пауза важнее декоративного разделителя.
              </p>
            </div>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Превью сайдбара ADE: проекты и чаты как рабочий архив, а не панель тревоги с бесконечным прогрессом."
              frame="plain"
            >
              <AgenticWorkflowLab />
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="ADE нельзя проектировать как один чат. Работа проходит через план, контекст, доступ, выполнение, проверку и ревью."
              frame="plain"
            >
              <LabWorkflowDisk />
            </InlineFigure>
          </div>

          <div className={caseStyles.wide}>
            <InlineFigure
              caption="Автономная работа становится пригодной для ревью только тогда, когда рядом лежат лог сессии, команды, тесты, diff, снимки и pull request."
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

        {/* Закрытие */}
        <section className={caseStyles.column}>
          <h2 className={caseStyles.sectionTitle}>ADE как среда доказательной работы</h2>
          <div className={caseStyles.prose}>
            <p>
              В Composer нет настоящего бэкенда LLM, очереди задач, интеграции с GitHub и MCP сервера.
              Все поведения детерминированы. Не клон Codex, Claude Code, Antigravity или Kiro, а
              способ проверить рамку: собрать источники, закодировать наблюдения и превратить их в
              интерфейсные решения.
            </p>
            <p>
              Полная версия потребовала бы фоновых сессий, изолированных worktrees, журнала
              подтверждений, ревью diff, браузерных проверок и памяти проекта. Но вывод уже виден:
              ADE не место, где AI выполнил работу. Это среда, где каждый шаг можно объяснить,
              проверить и принять человеком.
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
