const sidebarStorageKey = "quartz-sidebar-collapse"

type SidebarState = {
  left: boolean
  right: boolean
}

const readState = (): SidebarState => {
  try {
    const saved = localStorage.getItem(sidebarStorageKey)
    if (saved) return { left: false, right: false, ...JSON.parse(saved) }
  } catch {}

  return { left: false, right: false }
}

const writeState = (state: SidebarState) => {
  try {
    localStorage.setItem(sidebarStorageKey, JSON.stringify(state))
  } catch {}
}

const applyState = (state: SidebarState) => {
  document.documentElement.dataset.sidebarLeft = state.left ? "collapsed" : "open"
  document.documentElement.dataset.sidebarRight = state.right ? "collapsed" : "open"

  const readerButtons = document.querySelectorAll<HTMLButtonElement>("button.readermode")
  const leftButtons = document.querySelectorAll<HTMLButtonElement>(".sidebar-collapse-left")
  const rightButtons = document.querySelectorAll<HTMLButtonElement>(".sidebar-collapse-right")

  for (const button of readerButtons) {
    button.setAttribute("aria-hidden", "true")
    button.tabIndex = -1
  }

  for (const button of leftButtons) {
    button.textContent = state.left ? ">" : "<"
    button.setAttribute("aria-expanded", String(!state.left))
    button.setAttribute("aria-label", state.left ? "Show explorer" : "Hide explorer")
    button.title = state.left ? "Show explorer" : "Hide explorer"
  }

  for (const button of rightButtons) {
    button.textContent = state.right ? "<" : ">"
    button.setAttribute("aria-expanded", String(!state.right))
    button.setAttribute("aria-label", state.right ? "Show graph panel" : "Hide graph panel")
    button.title = state.right ? "Show graph panel" : "Hide graph panel"
  }
}

const toggleSide = (side: keyof SidebarState) => {
  const state = readState()
  state[side] = !state[side]
  writeState(state)
  applyState(state)
  window.setTimeout(() => document.dispatchEvent(new Event("render")), 260)
}

const makeButton = (className: string, onClick: (event: MouseEvent) => void) => {
  const button = document.createElement("button")
  button.type = "button"
  button.className = className
  button.addEventListener("click", onClick, true)
  return button
}

const setupSidebarCollapse = () => {
  const readerButton = document.querySelector<HTMLButtonElement>("button.readermode")
  if (readerButton && readerButton.dataset.sidebarCollapseBound !== "true") {
    readerButton.dataset.sidebarCollapseBound = "true"
    readerButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault()
        event.stopImmediatePropagation()
        toggleSide("left")
      },
      true,
    )
  }

  document.querySelectorAll(".floating-sidebar-toggle").forEach((button) => button.remove())

  const leftFloating = makeButton("floating-sidebar-toggle floating-sidebar-toggle-left sidebar-collapse-left", (event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
    toggleSide("left")
  })

  const rightFloating = makeButton("floating-sidebar-toggle floating-sidebar-toggle-right sidebar-collapse-right", (event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
    toggleSide("right")
  })

  document.body.append(leftFloating, rightFloating)
  applyState(readState())
}

document.addEventListener("nav", setupSidebarCollapse)
document.addEventListener("render", setupSidebarCollapse)
