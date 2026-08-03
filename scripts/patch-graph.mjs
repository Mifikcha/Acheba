import fs from "node:fs"
import path from "node:path"

const graphFiles = [
  path.join(process.cwd(), "node_modules", "@quartz-community", "graph", "dist", "index.js"),
  path.join(
    process.cwd(),
    "node_modules",
    "@quartz-community",
    "graph",
    "dist",
    "components",
    "index.js",
  ),
]

const themeCoreFile = path.join(
  process.cwd(),
  "node_modules",
  "@quartz-themes",
  "core",
  "dist",
  "index.js",
)

const replacements = [
  ["return 2+Math.sqrt(l)}", "return 3.2+Math.sqrt(l)*1.2}"],
  ["l.color=l.active?ee:te", "l.color=l.active?Ie:ee"],
  ["width:1,color:v.color", "width:1.35,color:v.color"],
  ["alphaTarget(1).restart()", "alphaTarget(0.03).restart()"],
  [
    "oe=Date.now(),Eu=!0,_u=i.subject.id",
    "i.active||au.alphaTarget(0.03).restart(),oe=Date.now(),Eu=!0,_u=i.subject.id",
  ],
  [
    "i.active||au.alphaTarget(0.03).restart(),i.active||au.alphaTarget(0.03).restart(),",
    "i.active||au.alphaTarget(0.03).restart(),",
  ],
  [
    "P=a.zoomIdentity;",
    "P=a.zoomIdentity.translate(R*(1-qu)/2,O*(1-qu)/2).scale(qu);ou.scale.set(P.k,P.k);ou.position.set(P.x,P.y);",
  ],
  [
    "a.select(Z.canvas).call(et)}",
    "a.select(Z.canvas).call(et).call(et.transform,P)}",
  ],
]

let patched = 0

for (const graphFile of graphFiles) {
  if (!fs.existsSync(graphFile)) {
    continue
  }

  let source = fs.readFileSync(graphFile, "utf8")
  const original = source

  for (const [from, to] of replacements) {
    source = source.split(from).join(to)
  }

  if (source !== original) {
    fs.writeFileSync(graphFile, source)
    patched += 1
  }
}

if (fs.existsSync(themeCoreFile)) {
  const original = fs.readFileSync(themeCoreFile, "utf8")
  let source = original

  source = source.replace(
    `  .page:not([data-frame="canvas"]):not([data-frame="excalidraw"]) {
    margin: 0;
    padding-left: calc((100% - min(1500px, 100dvw))/2);
    padding-right: calc((100% - min(1500px, 100dvw))/2);
  }`,
    `  .page:not([data-frame="canvas"]):not([data-frame="excalidraw"]) {
    margin: 0;
    padding-left: 0;
    padding-right: 0;
  }`,
  )

  if (source !== original) {
    fs.writeFileSync(themeCoreFile, source)
    patched += 1
  }
}

if (patched === 0) {
  console.log("[patch-graph] Graph and theme patches already applied or upstream code changed.")
} else {
  console.log(`[patch-graph] Graph/theme patches applied in ${patched} file(s).`)
}
