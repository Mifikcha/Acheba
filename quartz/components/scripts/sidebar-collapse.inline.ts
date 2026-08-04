const lockSidebarOpen = () => {
  document.documentElement.dataset.sidebarLeft = "open"

  document.querySelectorAll(".floating-sidebar-toggle").forEach((button) => button.remove())
  document.querySelectorAll<HTMLButtonElement>("button.readermode").forEach((button) => button.remove())
  document.querySelectorAll<HTMLButtonElement>("button.darkmode").forEach((button) => button.remove())

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
}

document.addEventListener("nav", lockSidebarOpen)
document.addEventListener("render", lockSidebarOpen)
