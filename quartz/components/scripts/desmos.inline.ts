type DesmosExpression = {
  id: string
  latex: string
}

type DesmosCalculator = {
  setExpression(expression: DesmosExpression): void
  setMathBounds(bounds: { left: number; right: number; bottom: number; top: number }): void
  destroy(): void
}

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator(element: HTMLElement, options?: Record<string, unknown>): DesmosCalculator
    }
  }
}

const desmosScriptUrl =
  "https://www.desmos.com/api/v1.12/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
let desmosScriptPromise: Promise<void> | undefined
const activeCalculators = new Set<DesmosCalculator>()
let desmosObserver: IntersectionObserver | undefined

const loadDesmos = () => {
  if (window.Desmos) return Promise.resolve()
  if (desmosScriptPromise) return desmosScriptPromise

  desmosScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = desmosScriptUrl
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Не удалось загрузить Desmos."))
    document.head.append(script)
  })

  return desmosScriptPromise
}

const parseBounds = (value: string | undefined) => {
  const [left, right, bottom, top] = (value ?? "-10,10,-10,10")
    .split(",")
    .map((part) => Number(part.trim()))

  if ([left, right, bottom, top].some((part) => !Number.isFinite(part))) return undefined
  return { left, right, bottom, top }
}

const parseExpressions = (value: string | undefined) =>
  (value ?? "")
    .split(";")
    .map((latex) => latex.trim())
    .filter(Boolean)

const prepareDesmosEmbed = (root: HTMLElement) => {
  if (root.dataset.desmosPrepared === "true") {
    return root.querySelector<HTMLElement>(".desmos-stage")
  }
  root.dataset.desmosPrepared = "true"
  const title = root.dataset.title?.trim()
  const shell = document.createElement("figure")
  shell.className = "desmos-shell"

  if (title) {
    const caption = document.createElement("figcaption")
    caption.textContent = title
    shell.append(caption)
  }

  const stage = document.createElement("div")
  stage.className = "desmos-stage is-loading"
  stage.setAttribute("aria-label", title ? `График Desmos: ${title}` : "График Desmos")
  stage.textContent = "Загрузка Desmos..."
  shell.append(stage)

  root.replaceChildren(shell)
  return stage
}

const initDesmosEmbed = async (root: HTMLElement) => {
  if (root.dataset.desmosReady === "true") return
  root.dataset.desmosReady = "true"

  const expressions = parseExpressions(root.dataset.expressions)
  const stage = prepareDesmosEmbed(root)
  if (expressions.length === 0 || !stage) return
  stage.textContent = ""
  stage.classList.remove("is-loading", "desmos-stage-error")

  try {
    await loadDesmos()
    const calculator = window.Desmos!.GraphingCalculator(stage, {
      expressions: true,
      expressionsCollapsed: true,
      settingsMenu: false,
      keypad: false,
      lockViewport: root.dataset.lockViewport === "true",
      border: false,
      invertedColors: true,
      invertedColorsControl: false,
      language: "ru",
    })
    activeCalculators.add(calculator)

    const bounds = parseBounds(root.dataset.bounds)
    if (bounds) calculator.setMathBounds(bounds)

    expressions.forEach((latex, index) => {
      calculator.setExpression({ id: `expr-${index}`, latex })
    })
  } catch (error) {
    stage.classList.add("desmos-stage-error")
    stage.textContent = error instanceof Error ? error.message : "Не удалось загрузить Desmos."
  }
}

const initDesmosEmbeds = () => {
  document.querySelectorAll<HTMLElement>(".desmos-embed").forEach((root) => {
    prepareDesmosEmbed(root)

    if (!("IntersectionObserver" in window)) {
      void initDesmosEmbed(root)
      return
    }

    if (!desmosObserver) {
      desmosObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const root = entry.target as HTMLElement
            desmosObserver?.unobserve(root)
            void initDesmosEmbed(root)
          })
        },
        { rootMargin: "900px 0px" },
      )
    }

    if (root.dataset.desmosObserved === "true") return
    root.dataset.desmosObserved = "true"
    desmosObserver.observe(root)
  })
}

document.addEventListener("nav", initDesmosEmbeds)
window.addCleanup?.(() => {
  desmosObserver?.disconnect()
  desmosObserver = undefined
  for (const calculator of activeCalculators) calculator.destroy()
  activeCalculators.clear()
})

export {}
