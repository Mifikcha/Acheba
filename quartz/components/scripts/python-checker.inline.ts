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
    "stdout": stdout.getvalue(),
    "stderr": stderr.getvalue(),
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

  if (workerUrl) {
    URL.revokeObjectURL(workerUrl)
    workerUrl = undefined
  }
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

      if (event.data.ok) {
        resolve(event.data.result)
      } else {
        reject(new Error(event.data.error))
      }
    }

    activeWorker.addEventListener("message", onMessage)
    activeWorker.postMessage({ id, code, tests })
  })
}

const readInitialCode = (root: HTMLElement) => {
  const source =
    root.querySelector<HTMLTextAreaElement>("textarea") ??
    root.querySelector<HTMLElement>(".python-checker-code, pre code, code")

  return source?.textContent?.trim() || (source as HTMLTextAreaElement | null)?.value || defaultCode
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

const formatOutput = (result: PythonRunResult, showTests: boolean) => {
  const lines: string[] = []

  if (result.stdout.trim()) {
    lines.push(result.stdout.trimEnd())
  }

  if (result.stderr.trim()) {
    lines.push(result.stderr.trimEnd())
  }

  const total = result.passed.length + result.failed.length
  if (total > 0) {
    lines.push("")
    lines.push(`Тесты: ${result.passed.length}/${total} пройдено`)

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

  root.innerHTML = ""

  const header = createElement("div", "python-checker-header")
  const title = createElement("strong", undefined, root.dataset.title ?? "Проверка Python")
  const status = createElement("span", "python-checker-status", "Готово")
  header.append(title, status)

  const editor = createElement("textarea", "python-checker-editor") as HTMLTextAreaElement
  editor.value = initialCode
  editor.spellcheck = false
  editor.setAttribute("aria-label", "Python-код")

  const controls = createElement("div", "python-checker-controls")
  const runButton = createElement("button", "python-checker-run", "Запустить") as HTMLButtonElement
  const resetButton = createElement(
    "button",
    "python-checker-reset",
    "Сбросить",
  ) as HTMLButtonElement
  runButton.type = "button"
  resetButton.type = "button"
  controls.append(runButton, resetButton)

  const output = createElement("pre", "python-checker-output", "Вывод появится здесь.")
  output.setAttribute("aria-live", "polite")

  const setRunning = (isRunning: boolean) => {
    runButton.disabled = isRunning
    resetButton.disabled = isRunning
    root.dataset.state = isRunning ? "loading" : "idle"
    status.textContent = isRunning ? "Готовлю Python..." : "Готово"
  }

  runButton.addEventListener("click", async () => {
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
    }
  })

  resetButton.addEventListener("click", () => {
    editor.value = initialCode
    output.textContent = "Вывод появится здесь."
    status.textContent = "Готово"
    root.dataset.state = "idle"
  })

  root.append(header, editor, controls, output)
}

const initPythonCheckers = () => {
  document.querySelectorAll<HTMLElement>(".python-checker").forEach(initPythonChecker)
}

document.addEventListener("nav", initPythonCheckers)
window.addCleanup?.(resetWorker)
