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

if (patched === 0) {
  console.log("[patch-graph] Graph plugin patch already applied or upstream code changed.")
} else {
  console.log(`[patch-graph] Graph plugin patched in ${patched} file(s).`)
}
