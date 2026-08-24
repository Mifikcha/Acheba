type PythonRunResult = {
  stdout: string
  stderr: string
  passed: Array<{ index: number; code: string }>
  failed: Array<{ index: number; code: string; message: string }>
  codeOk: boolean
}

type WorkerReply =
  { id: number; ok: true; result: PythonRunResult } | { id: number; ok: false; error: string }

const pyodideUrl = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"
const defaultCode = `def solve(x):
    return x * x

print(solve(5))`

const pythonRunner = `
import contextlib
import io
import json
import traceback

stdout = io.StringIO()
stderr = io.StringIO()
namespace = {"__name__": "__main__"}
tests = [line.strip() for line in (USER_TESTS or "").splitlines() if line.strip()]
passed = []
failed = []
code_ok = True

try:
    with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
        exec(USER_CODE, namespace)
except Exception:
    code_ok = False
    traceback.print_exc(file=stderr)

namespace["__source__"] = USER_CODE
namespace["__output__"] = stdout.getvalue()
namespace["__stderr__"] = stderr.getvalue()

if code_ok and tests:
    for index, test in enumerate(tests, 1):
        try:
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                exec(test, namespace)
            passed.append({"index": index, "code": test})
        except Exception as exc:
            failed.append({
                "index": index,
                "code": test,
                "message": f"{exc.__class__.__name__}: {exc}",
            })

json.dumps({
    "stdout": namespace["__output__"],
    "stderr": namespace["__stderr__"],
    "passed": passed,
    "failed": failed,
    "codeOk": code_ok,
}, ensure_ascii=False)
`

const workerSource = `
let runtimePromise;
const runner = ${JSON.stringify(pythonRunner)};

function loadRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      importScripts(${JSON.stringify(pyodideUrl)});
      return await loadPyodide();
    })();
  }
  return runtimePromise;
}

self.onmessage = async (event) => {
  const { id, code, tests } = event.data;
  try {
    const pyodide = await loadRuntime();
    pyodide.globals.set("USER_CODE", code);
    pyodide.globals.set("USER_TESTS", tests);
    const result = await pyodide.runPythonAsync(runner);
    self.postMessage({ id, ok: true, result: JSON.parse(result) });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: String(error && error.stack ? error.stack : error),
    });
  }
};
`

let worker: Worker | undefined
let workerUrl: string | undefined
let nextRunId = 1

const ensureWorker = () => {
  if (worker) return worker
  const blob = new Blob([workerSource], { type: "text/javascript" })
  workerUrl = URL.createObjectURL(blob)
  worker = new Worker(workerUrl)
  return worker
}

const resetWorker = () => {
  worker?.terminate()
  worker = undefined
  if (workerUrl) URL.revokeObjectURL(workerUrl)
  workerUrl = undefined
}

const runPython = (code: string, tests: string, timeoutMs: number): Promise<PythonRunResult> => {
  const activeWorker = ensureWorker()
  const id = nextRunId++

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      activeWorker.removeEventListener("message", onMessage)
      resetWorker()
      reject(
        new Error(
          `Код выполнялся дольше ${Math.round(timeoutMs / 1000)} с. Выполнение остановлено.`,
        ),
      )
    }, timeoutMs)

    function onMessage(event: MessageEvent<WorkerReply>) {
      if (event.data.id !== id) return
      window.clearTimeout(timeout)
      activeWorker.removeEventListener("message", onMessage)
      event.data.ok ? resolve(event.data.result) : reject(new Error(event.data.error))
    }

    activeWorker.addEventListener("message", onMessage)
    activeWorker.postMessage({ id, code, tests })
  })
}

const pythonKeywords = new Set([
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
  "match",
  "case",
])
const pythonBuiltins = new Set([
  "abs",
  "all",
  "any",
  "bool",
  "dict",
  "enumerate",
  "filter",
  "float",
  "input",
  "int",
  "len",
  "list",
  "map",
  "max",
  "min",
  "open",
  "print",
  "range",
  "reversed",
  "round",
  "set",
  "sorted",
  "str",
  "sum",
  "tuple",
  "type",
  "zip",
])
const pythonConstants = new Set(["True", "False", "None", "NotImplemented", "Ellipsis"])

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")

const token = (kind: string, value: string) =>
  `<span class="python-token-${kind}" style="display:inline!important">${escapeHtml(value)}</span>`

const highlightPython = (source: string) => {
  let output = ""
  let index = 0

  while (index < source.length) {
    const rest = source.slice(index)
    const char = source[index]

    if (char === "#") {
      const end = source.indexOf("\n", index)
      const value = source.slice(index, end === -1 ? source.length : end)
      output += token("comment", value)
      index += value.length
      continue
    }

    if (char === '"' || char === "'") {
      const triple = source.slice(index, index + 3) === char.repeat(3)
      const delimiter = triple ? char.repeat(3) : char
      let end = index + delimiter.length
      while (end < source.length) {
        if (source[end] === "\\") {
          end += 2
          continue
        }
        if (source.slice(end, end + delimiter.length) === delimiter) {
          end += delimiter.length
          break
        }
        end++
      }
      output += token("string", source.slice(index, end))
      index = end
      continue
    }

    const number = rest.match(
      /^(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/,
    )?.[0]
    if (number) {
      output += token("number", number)
      index += number.length
      continue
    }

    const identifier = rest.match(/^[A-Za-z_]\w*/)?.[0]
    if (identifier) {
      const kind = pythonKeywords.has(identifier)
        ? "keyword"
        : pythonBuiltins.has(identifier)
          ? "builtin"
          : pythonConstants.has(identifier)
            ? "constant"
            : "plain"
      output += kind === "plain" ? escapeHtml(identifier) : token(kind, identifier)
      index += identifier.length
      continue
    }

    if (/[+\-*/%=<>!&|^~:@]/.test(char)) output += token("operator", char)
    else output += escapeHtml(char)
    index++
  }

  return `${output}\n`
}

const readInitialCode = (root: HTMLElement) => {
  if (root.dataset.code) return root.dataset.code
  const source =
    root.querySelector<HTMLTextAreaElement>("textarea") ??
    root.querySelector<HTMLElement>(".python-checker-code, pre code, code")
  return (source as HTMLTextAreaElement | null)?.value || source?.textContent?.trim() || defaultCode
}

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  text?: string,
) => {
  const element = document.createElement(tagName)
  if (className) element.className = className
  if (text) element.textContent = text
  return element
}

const createIcon = (path: string) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 0 24 24")
  svg.setAttribute("aria-hidden", "true")
  const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
  iconPath.setAttribute("d", path)
  svg.append(iconPath)
  return svg
}

const formatOutput = (result: PythonRunResult, showTests: boolean) => {
  const lines: string[] = []
  if (result.stdout.trim()) lines.push(result.stdout.trimEnd())
  if (result.stderr.trim()) lines.push(result.stderr.trimEnd())

  const total = result.passed.length + result.failed.length
  if (total > 0) {
    lines.push("", `Тесты: ${result.passed.length}/${total} пройдено`)
    for (const failure of result.failed) {
      const testLabel = showTests ? ` (${failure.code})` : ""
      lines.push(`Тест ${failure.index}${testLabel}: ${failure.message}`)
    }
  }
  return lines.join("\n").trim() || "Код выполнен без вывода."
}

const initPythonChecker = (root: HTMLElement) => {
  if (root.dataset.pythonReady === "true") return
  root.dataset.pythonReady = "true"

  const initialCode = readInitialCode(root)
  const tests = root.dataset.tests ?? ""
  const timeoutMs = Number(root.dataset.timeout ?? 8000)
  const showTests = root.dataset.showTests === "true"
  const lessonLayout = root.dataset.layout === "lesson"
  root.innerHTML = ""

  const header = createElement("div", "python-checker-header")
  const titleGroup = createElement("div", "python-checker-title")
  const languageDot = createElement("span", "python-language-dot")
  const title = createElement("strong", undefined, root.dataset.title ?? "Проверка Python")
  titleGroup.append(languageDot, title)

  const controls = createElement("div", "python-checker-controls")
  const runButton = createElement("button", "python-checker-run") as HTMLButtonElement
  runButton.type = "button"
  runButton.append(createIcon("m5 3 14 9-14 9V3z"), createElement("span", undefined, "Запустить"))
  const resetButton = createElement("button", "python-checker-reset") as HTMLButtonElement
  resetButton.type = "button"
  resetButton.title = "Сбросить код"
  resetButton.setAttribute("aria-label", "Сбросить код")
  resetButton.append(createIcon("M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"))
  controls.append(runButton, resetButton)
  header.append(titleGroup, controls)

  const task = root.dataset.task
    ? createElement("p", "python-checker-task", root.dataset.task)
    : undefined

  const editorShell = createElement("div", "python-editor-shell")
  const lineNumbersViewport = createElement("div", "python-line-numbers-viewport")
  lineNumbersViewport.setAttribute("aria-hidden", "true")
  const lineNumbers = createElement("div", "python-line-numbers")
  lineNumbersViewport.append(lineNumbers)
  const editorStack = createElement("div", "python-editor-stack")
  const highlight = createElement("pre", "python-checker-highlight")
  highlight.setAttribute("aria-hidden", "true")
  const highlightedCode = createElement("code")
  highlight.append(highlightedCode)
  const editor = createElement("textarea", "python-checker-editor") as HTMLTextAreaElement
  editor.value = initialCode
  editor.spellcheck = false
  editor.autocomplete = "off"
  editor.setAttribute("autocapitalize", "off")
  editor.setAttribute("aria-label", "Python-код")
  editorStack.append(highlight, editor)
  editorShell.append(lineNumbersViewport, editorStack)

  const consolePanel = createElement("section", "python-console")
  const consoleHeader = createElement("div", "python-console-header")
  const consoleTitle = createElement("strong", undefined, "Консоль")
  const status = createElement("span", "python-checker-status", "Готово")
  consoleHeader.append(consoleTitle, status)
  const output = createElement("pre", "python-checker-output", "Вывод появится здесь.")
  output.setAttribute("aria-live", "polite")
  consolePanel.append(consoleHeader, output)

  const syncEditor = () => {
    highlightedCode.innerHTML = highlightPython(editor.value)
    const count = Math.max(1, editor.value.split("\n").length)
    lineNumbers.textContent = Array.from({ length: count }, (_, index) => String(index + 1)).join(
      "\n",
    )
    highlight.scrollTop = editor.scrollTop
    highlight.scrollLeft = editor.scrollLeft
    lineNumbers.style.transform = `translateY(${-editor.scrollTop}px)`
  }

  const setRunning = (isRunning: boolean) => {
    runButton.disabled = isRunning
    resetButton.disabled = isRunning
    root.dataset.state = isRunning ? "loading" : "idle"
    status.textContent = isRunning ? "Готовлю Python..." : "Готово"
    runButton.querySelector("span")!.textContent = isRunning ? "Запуск..." : "Запустить"
  }

  const execute = async () => {
    setRunning(true)
    output.textContent = "Первый запуск может занять несколько секунд."
    try {
      const result = await runPython(editor.value, tests, timeoutMs)
      const total = result.passed.length + result.failed.length
      const failed = result.failed.length > 0 || !result.codeOk
      root.dataset.state = failed ? "error" : total > 0 ? "success" : "idle"
      status.textContent = failed ? "Есть ошибка" : total > 0 ? "Тесты пройдены" : "Выполнено"
      output.textContent = formatOutput(result, showTests)
    } catch (error) {
      root.dataset.state = "error"
      status.textContent = "Есть ошибка"
      output.textContent = error instanceof Error ? error.message : String(error)
    } finally {
      runButton.disabled = false
      resetButton.disabled = false
      runButton.querySelector("span")!.textContent = "Запустить"
    }
  }

  editor.addEventListener("input", syncEditor)
  editor.addEventListener("scroll", syncEditor)
  editor.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault()
      const start = editor.selectionStart
      editor.setRangeText("    ", start, editor.selectionEnd, "end")
      syncEditor()
    } else if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault()
      void execute()
    }
  })
  runButton.addEventListener("click", () => void execute())
  resetButton.addEventListener("click", () => {
    editor.value = initialCode
    output.textContent = "Вывод появится здесь."
    status.textContent = "Готово"
    root.dataset.state = "idle"
    syncEditor()
    editor.focus()
  })

  root.classList.add("python-checker-enhanced")
  root.append(header)
  if (task) root.append(task)
  root.append(editorShell, consolePanel)
  if (!lessonLayout) root.classList.add("python-checker-inline")
  syncEditor()
}

const initPythonCheckers = () => {
  document.querySelectorAll<HTMLElement>(".python-checker").forEach(initPythonChecker)
}

document.addEventListener("nav", initPythonCheckers)
window.addCleanup?.(resetWorker)
