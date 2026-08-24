import { FullSlug, resolveRelative } from "../../util/path"
import { PageFrame, PageFrameProps } from "./types"

const hasCodingLessonTag = (file: PageFrameProps["componentData"]["fileData"]) =>
  file.frontmatter?.tags?.includes("coding_lesson") ?? false

const ArrowLeft = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const ArrowRight = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export const CodingLessonFrame: PageFrame = {
  name: "coding-lesson",
  render({ componentData, pageBody: Content }: PageFrameProps) {
    const { fileData, allFiles } = componentData
    const slug = fileData.slug!
    const parentSlug = slug.slice(0, slug.lastIndexOf("/")) as FullSlug
    const overviewSlug = parentSlug
    const lessons = allFiles
      .filter(
        (file) =>
          file.slug?.startsWith(`${parentSlug}/`) &&
          file.slug.slice(parentSlug.length + 1).indexOf("/") === -1 &&
          hasCodingLessonTag(file),
      )
      .sort(
        (a, b) =>
          Number(a.frontmatter?.coding_order ?? 0) - Number(b.frontmatter?.coding_order ?? 0),
      )
    const lessonIndex = lessons.findIndex((lesson) => lesson.slug === slug)
    const previous = lessonIndex > 0 ? lessons[lessonIndex - 1] : undefined
    const next = lessonIndex >= 0 ? lessons[lessonIndex + 1] : undefined
    const frontmatter = fileData.frontmatter as Record<string, unknown> | undefined
    const title = String(frontmatter?.title ?? slug.slice(slug.lastIndexOf("/") + 1))
    const starterCode = String(frontmatter?.starter_code ?? "")
    const tests = String(frontmatter?.tests ?? "")
    const task = String(frontmatter?.coding_task ?? "")

    return (
      <main class="center coding-lesson-shell">
        <header class="coding-lesson-bar">
          <a class="coding-course-exit" href={resolveRelative(slug, overviewSlug)}>
            <ArrowLeft />
            <span>К курсу</span>
          </a>
          <strong>{title}</strong>
          <span class="coding-lesson-progress">
            {lessonIndex + 1} / {lessons.length}
          </span>
        </header>

        <div class="coding-lesson-split">
          <section class="coding-lesson-reading">
            <Content {...componentData} />
            <nav class="coding-lesson-nav" aria-label="Навигация по урокам">
              {previous ? (
                <a href={resolveRelative(slug, previous.slug!)} rel="prev">
                  <ArrowLeft />
                  <span>
                    <small>Назад</small>
                    {previous.frontmatter?.title}
                  </span>
                </a>
              ) : (
                <span />
              )}
              {next ? (
                <a href={resolveRelative(slug, next.slug!)} rel="next">
                  <span>
                    <small>Дальше</small>
                    {next.frontmatter?.title}
                  </span>
                  <ArrowRight />
                </a>
              ) : (
                <a href={resolveRelative(slug, overviewSlug)}>
                  <span>
                    <small>Готово</small>К курсу
                  </span>
                  <ArrowRight />
                </a>
              )}
            </nav>
          </section>

          <aside
            class="python-checker coding-workbench"
            data-layout="lesson"
            data-title="Python"
            data-code={starterCode}
            data-tests={tests}
            data-task={task}
          />
        </div>
      </main>
    )
  },
}
