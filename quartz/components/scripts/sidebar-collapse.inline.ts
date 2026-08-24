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

  if (!leftSidebar || leftSidebar.querySelector(".hopes-theme-toggle")) {
    return
  }

  const button = document.createElement("button")
  button.className = "hopes-theme-toggle"
  button.type = "button"
  button.addEventListener("click", toggleTheme)

  const pageTitle = leftSidebar.querySelector(".page-title")
  pageTitle?.insertAdjacentElement("afterend", button)
  applyStoredTheme()
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
  ensurePageTitleHomeLink()
  ensureMobileToggle()
  sortInfoTaskCards()
  hideHomeGraphLinks()
  applyStoredTheme()
}

sidebarQuery.addEventListener("change", () => setSidebarState(!sidebarQuery.matches))
document.addEventListener("nav", prepareSidebar)
document.addEventListener("render", prepareSidebar)
prepareSidebar()
