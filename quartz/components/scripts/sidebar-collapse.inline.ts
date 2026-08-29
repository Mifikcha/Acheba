const sidebarQuery = window.matchMedia("(max-width: 800px)")
type Theme = "dark" | "light"

const readStoredTheme = (): Theme => {
  let theme: string = "dark"

  try {
    theme = localStorage.getItem("hopes-color-theme") ?? localStorage.getItem("theme") ?? "dark"
  } catch {}

  return theme === "light" ? "light" : "dark"
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement

  root.setAttribute("saved-theme", theme)
  root.style.colorScheme = theme
  document.body?.classList.toggle("theme-light", theme === "light")
  document.body?.classList.toggle("theme-dark", theme === "dark")
  document.querySelectorAll<HTMLButtonElement>(".hopes-theme-toggle").forEach((button) => {
    button.setAttribute(
      "aria-label",
      theme === "light" ? "Включить тёмную тему" : "Включить светлую тему",
    )
    button.setAttribute("title", theme === "light" ? "Тёмная тема" : "Светлая тема")
    button.setAttribute("aria-pressed", theme === "light" ? "false" : "true")
    button.dataset.theme = theme
    button.innerHTML =
      theme === "light"
        ? `<svg aria-hidden="true" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 3a6 6 0 0 0 9 7.5A8 8 0 1 1 12 3Z"/></svg>`
        : `<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`
  })
}

const applyStoredTheme = () => applyTheme(readStoredTheme())

const notifyThemeChange = (theme: "dark" | "light") => {
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }))
}

const toggleTheme = () => {
  const nextTheme =
    document.documentElement.getAttribute("saved-theme") === "light" ? "dark" : "light"

  document.documentElement.dataset.themeChanging = "true"

  try {
    localStorage.setItem("hopes-color-theme", nextTheme)
    localStorage.setItem("theme", nextTheme)
  } catch {}

  applyTheme(nextTheme)
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (document.documentElement.getAttribute("saved-theme") !== nextTheme) return

      notifyThemeChange(nextTheme)
      document.documentElement.removeAttribute("data-theme-changing")
    }),
  )
}

const bindThemeToggle = (button: HTMLButtonElement) => {
  if (button.dataset.themeToggleReady === "true") {
    return
  }

  button.dataset.themeToggleReady = "true"
  button.type = "button"
  button.addEventListener("click", toggleTheme)
}

const bindThemeToggles = () => {
  document.querySelectorAll<HTMLButtonElement>(".hopes-theme-toggle").forEach(bindThemeToggle)
}

const setSidebarState = (open: boolean) => {
  document.documentElement.dataset.sidebarLeft = open ? "open" : "closed"
}

const getSiteRootHref = () => {
  const domain = document
    .querySelector<HTMLMetaElement>('meta[property="twitter:domain"]')
    ?.content?.trim()

  if (!domain) {
    return "/"
  }

  const path = new URL(`https://${domain}`).pathname.replace(/\/?$/, "/")
  return path || "/"
}

const ensurePageTitleHomeLink = () => {
  const href = getSiteRootHref()

  document.querySelectorAll<HTMLAnchorElement>(".page-title a").forEach((link) => {
    link.href = href
  })
}

const ensureThemeToggle = () => {
  const leftSidebar = document.querySelector<HTMLElement>(".left.sidebar")

  if (!leftSidebar) {
    return
  }

  if (!leftSidebar.querySelector(".hopes-theme-toggle")) {
    const button = document.createElement("button")
    button.className = "hopes-theme-toggle"

    const pageTitle = leftSidebar.querySelector(".page-title")
    pageTitle?.insertAdjacentElement("afterend", button)
  }
}

const ensureFrameThemeToggle = () => {
  const excalidrawFrame = document.querySelector<HTMLElement>(
    '#quartz-root.page[data-frame="excalidraw"]',
  )

  if (!excalidrawFrame || excalidrawFrame.querySelector(".excalidraw-theme-toggle")) {
    return
  }

  const button = document.createElement("button")
  button.className = "hopes-theme-toggle hopes-frame-theme-toggle excalidraw-theme-toggle"
  excalidrawFrame.append(button)
}

const ensureMobileToggle = () => {
  if (document.querySelector(".mobile-sidebar-toggle")) {
    return
  }

  const button = document.createElement("button")
  button.className = "mobile-sidebar-toggle"
  button.type = "button"
  button.setAttribute("aria-label", "Открыть проводник")
  button.setAttribute("title", "Проводник")
  button.setAttribute("aria-expanded", "false")
  button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h16v2H4v-2Z"/></svg>`
  button.addEventListener("click", () => {
    const open = document.documentElement.dataset.sidebarLeft !== "open"
    setSidebarState(open)
    button.setAttribute("aria-expanded", String(open))
    button.setAttribute("aria-label", open ? "Закрыть проводник" : "Открыть проводник")
  })

  document.body.append(button)
}

const sortInfoTaskCards = () => {
  const slug = document.body.dataset.slug ?? ""

  if (!slug.includes("инфушечка/разбор-задач")) {
    return
  }

  document.querySelectorAll<HTMLUListElement>(".page-listing .section-ul").forEach((list) => {
    const items = [...list.querySelectorAll<HTMLElement>(":scope > li.section-li")]
    const numberOf = (item: HTMLElement) => {
      const text = item.querySelector("h3 a")?.textContent ?? ""
      const match = text.match(/№\s*(\d+)/)
      return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
    }

    items.sort((a, b) => numberOf(a) - numberOf(b))
    items.forEach((item) => list.append(item))
  })
}

const hideHomeGraphLinks = () => {
  if (document.body.dataset.slug !== "index") {
    return
  }

  document.querySelectorAll<HTMLAnchorElement>('.toc a[href="#graph-links"]').forEach((link) => {
    link.closest("li")?.remove()
  })

  const heading = document.querySelector<HTMLElement>("article h2#graph-links")
  if (!heading) {
    return
  }

  let current = heading.nextElementSibling
  while (current && !/^H[1-6]$/.test(current.tagName)) {
    const next = current.nextElementSibling
    current.remove()
    current = next
  }
  heading.remove()
}

const lowSignalTocHeading = /^(?:примеры?|решение|ответ|проверка|демоверсия)\s*(?:\d+|[):.]|$)/i

const prepareTableOfContents = () => {
  document.querySelectorAll<HTMLElement>(".toc").forEach((toc) => {
    if (toc.dataset.hopesTocReady === "true") return
    toc.dataset.hopesTocReady = "true"

    const content = toc.querySelector<HTMLElement>(".toc-content")
    if (!content) return

    const entries = [...content.querySelectorAll<HTMLAnchorElement>("a[data-for]")]
      .map((link) => ({ link, heading: document.getElementById(link.dataset.for ?? "") }))
      .filter(({ link, heading }) => {
        const hidden =
          !heading ||
          Boolean(heading.closest(".callout, .transclude")) ||
          lowSignalTocHeading.test(heading.textContent?.trim() ?? "")
        link.closest("li")?.toggleAttribute("hidden", hidden)
        return !hidden && Boolean(heading)
      }) as { link: HTMLAnchorElement; heading: HTMLElement }[]

    if (entries.length < 2) {
      toc.hidden = true
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const readingLine = Math.min(180, window.innerHeight * 0.28)
      let activeIndex = 0
      entries.forEach(({ heading }, index) => {
        if (heading.getBoundingClientRect().top <= readingLine) activeIndex = index
      })

      entries.forEach(({ link }, index) => {
        link.classList.toggle("is-past", index < activeIndex)
        link.classList.toggle("is-active", index === activeIndex)
        link.classList.toggle("is-future", index > activeIndex)
      })

      const activeItem = entries[activeIndex].link.closest<HTMLElement>("li")
      if (!activeItem) return
      const marker = activeItem.offsetTop + activeItem.offsetHeight / 2
      content.style.setProperty("--toc-marker-y", `${marker}px`)
    }
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    update()
    window.addCleanup?.(() => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      delete toc.dataset.hopesTocReady
    })
  })
}

const prepareHomeAtmosphere = () => {
  if (document.body.dataset.slug !== "index") return
  const entry = document.querySelector<HTMLElement>(".home-entry")
  if (!entry || entry.dataset.atmosphereReady === "true") return
  entry.dataset.atmosphereReady = "true"

  const atmosphere = document.createElement("div")
  atmosphere.className = "home-atmosphere"
  atmosphere.setAttribute("aria-hidden", "true")
  const orbit = document.createElement("i")
  orbit.append(document.createElement("b"))
  atmosphere.append(orbit)
  for (let index = 0; index < 9; index++) atmosphere.append(document.createElement("span"))
  entry.prepend(atmosphere)

  const observer = new IntersectionObserver(([state]) => {
    atmosphere.classList.toggle("is-live", state.isIntersecting && !document.hidden)
  })
  const handleVisibility = () => {
    if (document.hidden) atmosphere.classList.remove("is-live")
    else if (entry.getBoundingClientRect().bottom > 0) atmosphere.classList.add("is-live")
  }

  document.addEventListener("visibilitychange", handleVisibility)
  observer.observe(entry)
  window.addCleanup?.(() => {
    observer.disconnect()
    document.removeEventListener("visibilitychange", handleVisibility)
  })
}

const ensureGlobalGraphControls = () => {
  document.querySelectorAll<HTMLElement>(".global-graph-outer").forEach((outer) => {
    if (outer.querySelector(".global-graph-controls")) return
    const container = outer.querySelector<HTMLElement>(".global-graph-container")
    if (!container) return

    const panel = document.createElement("aside")
    panel.className = "global-graph-controls"
    panel.setAttribute("aria-label", "Настройка графа")
    panel.innerHTML = `
      <header>
        <h2>Настройка графа</h2>
        <button type="button" class="global-graph-close" aria-label="Закрыть граф" title="Закрыть">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </header>
      <details>
        <summary>Фильтры</summary>
        <label class="global-graph-switch"><span>Показывать теги</span><input type="checkbox" data-graph-key="showTags"></label>
      </details>
      <details>
        <summary>Группировка</summary>
        <label class="global-graph-switch"><span>Радиальное расположение</span><input type="checkbox" data-graph-key="enableRadial"></label>
        <label class="global-graph-switch"><span>Фокус по наведению</span><input type="checkbox" data-graph-key="focusOnHover"></label>
      </details>
      <details open>
        <summary>Отображение</summary>
        <label><span>Порог исчезновения текста <output data-graph-output="opacityScale"></output></span><input type="range" min="0.35" max="1.4" step="0.05" data-graph-key="opacityScale"></label>
        <label><span>Размер подписей <output data-graph-output="fontSize"></output></span><input type="range" min="0.22" max="0.8" step="0.02" data-graph-key="fontSize"></label>
        <label><span>Размер узла <output data-graph-output="nodeScale"></output></span><input type="range" min="0.35" max="1.6" step="0.05" data-graph-key="nodeScale"></label>
        <label><span>Толщина линий <output data-graph-output="lineWidth"></output></span><input type="range" min="0.25" max="1.5" step="0.05" data-graph-key="lineWidth"></label>
        <button type="button" class="global-graph-run">Запустить анимацию</button>
      </details>
      <details open>
        <summary>Силы</summary>
        <label><span>Сила притяжения <output data-graph-output="centerForce"></output></span><input type="range" min="0.05" max="1" step="0.05" data-graph-key="centerForce"></label>
        <label><span>Сила отталкивания <output data-graph-output="repelForce"></output></span><input type="range" min="0.2" max="1.6" step="0.05" data-graph-key="repelForce"></label>
        <label><span>Сила связей <output data-graph-output="linkStrength"></output></span><input type="range" min="0.2" max="1.5" step="0.05" data-graph-key="linkStrength"></label>
        <label><span>Расстояние между узлами <output data-graph-output="linkDistance"></output></span><input type="range" min="20" max="180" step="2" data-graph-key="linkDistance"></label>
      </details>
    `
    outer.append(panel)

    const defaults = {
      opacityScale: 1.2,
      fontSize: 0.22,
      nodeScale: 0.5,
      lineWidth: 0.26,
      centerForce: 0.08,
      repelForce: 1.35,
      linkStrength: 0.72,
      linkDistance: 118,
      showTags: true,
      enableRadial: false,
      focusOnHover: true,
      ...JSON.parse(container.dataset.cfg ?? "{}"),
    }
    const render = () => document.dispatchEvent(new CustomEvent("render", { detail: {} }))

    panel.addEventListener("click", (event) => event.stopPropagation())
    panel.querySelector<HTMLButtonElement>(".global-graph-close")?.addEventListener("click", () => {
      outer.classList.remove("active")
      const sidebar = outer.closest<HTMLElement>(".sidebar")
      if (sidebar) sidebar.style.zIndex = ""
    })
    panel.querySelector<HTMLButtonElement>(".global-graph-run")?.addEventListener("click", render)
    panel.querySelectorAll<HTMLInputElement>("[data-graph-key]").forEach((input) => {
      const key = input.dataset.graphKey ?? ""
      const value = defaults[key as keyof typeof defaults]
      if (input.type === "checkbox") input.checked = Boolean(value)
      else input.value = String(value)

      const output = panel.querySelector<HTMLOutputElement>(`[data-graph-output="${key}"]`)
      const updateOutput = () => {
        if (output) output.value = input.value
      }
      updateOutput()
      input.addEventListener("input", updateOutput)
      input.addEventListener("change", () => {
        const config = JSON.parse(container.dataset.cfg ?? "{}")
        config[key] = input.type === "checkbox" ? input.checked : Number(input.value)
        container.dataset.cfg = JSON.stringify(config)
        render()
      })
    })
  })
}

const prepareSidebar = () => {
  setSidebarState(!sidebarQuery.matches)

  document.querySelectorAll(".floating-sidebar-toggle").forEach((button) => button.remove())
  document
    .querySelectorAll<HTMLButtonElement>("button.readermode")
    .forEach((button) => button.remove())
  document
    .querySelectorAll<HTMLButtonElement>("button.darkmode")
    .forEach((button) => button.remove())

  document.querySelectorAll<HTMLElement>(".explorer").forEach((explorer) => {
    explorer.classList.remove("collapsed")
    explorer.setAttribute("aria-expanded", "true")
  })

  document.querySelectorAll<HTMLElement>(".explorer-content").forEach((content) => {
    content.classList.remove("collapsed")
    content.setAttribute("aria-expanded", "true")
  })

  document.querySelectorAll<HTMLButtonElement>(".explorer-toggle").forEach((button) => {
    button.setAttribute("aria-hidden", "true")
    button.tabIndex = -1
  })

  try {
    localStorage.removeItem("quartz-sidebar-collapse")
  } catch {}

  ensureThemeToggle()
  ensureFrameThemeToggle()
  bindThemeToggles()
  ensurePageTitleHomeLink()
  ensureMobileToggle()
  sortInfoTaskCards()
  hideHomeGraphLinks()
  prepareTableOfContents()
  prepareHomeAtmosphere()
  ensureGlobalGraphControls()
  applyStoredTheme()
}

sidebarQuery.addEventListener("change", () => setSidebarState(!sidebarQuery.matches))
document.addEventListener("nav", prepareSidebar)
document.addEventListener("render", prepareSidebar)
prepareSidebar()
