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

const excalidrawPluginFile = path.join(
  process.cwd(),
  ".quartz",
  "plugins",
  "obsidian-plugin-excalidraw",
  "dist",
  "index.js",
)

const replacements = [
  [
    'function Fu(u){let e=_t(ft(u,"index"),!0);return e.length===0?"/":e}',
    'function Fu(u){try{u=decodeURIComponent(u)}catch{}let e=_t(ft(u,"index"),!0);return e.length===0?"/":e}',
  ],
  ["return 2+Math.sqrt(l)}", "return 3.2+Math.sqrt(l)*1.2}"],
  ["l.color=l.active?ee:te", "l.color=l.active?Ie:ee"],
  ["width:1,color:v.color", "width:1.35,color:v.color"],
  ["alphaTarget(0.18).restart()", "alphaTarget(1).restart()"],
  ["alphaTarget(0.03).restart()", "alphaTarget(1).restart()"],
  [
    "oe=Date.now(),Eu=!0,_u=i.subject.id",
    "i.active||au.alphaTarget(1).restart(),oe=Date.now(),Eu=!0,_u=i.subject.id",
  ],
  [
    "i.active||au.alphaTarget(1).restart(),i.active||au.alphaTarget(1).restart(),",
    "i.active||au.alphaTarget(1).restart(),",
  ],
  [
    "i.active||au.alphaTarget(1).restart(),i.subject.fx=l-i.subject.__dragOffset.x,i.subject.fy=F-i.subject.__dragOffset.y",
    "i.subject.fx=l-i.subject.__dragOffset.x,i.subject.fy=F-i.subject.__dragOffset.y",
  ],
  [
    "P=a.zoomIdentity;",
    "P=a.zoomIdentity.translate(R*(1-qu)/2,O*(1-qu)/2).scale(qu);ou.scale.set(P.k,P.k);ou.position.set(P.x,P.y);",
  ],
  [
    "a.select(Z.canvas).call(et)}",
    "a.select(Z.canvas).call(et).call(et.transform,P)}",
  ],
  [
    "F=Math.max((l-1)/3.75,0)",
    "F=Math.min(Math.max((l-.55)/1.15,0),1)",
  ],
  [
    "style:{fontSize:We*15,fill:ze,fontFamily:Ne}",
    'style:{fontSize:We*60,fill:ze,fontFamily:Ne,fontWeight:"600"},resolution:window.devicePixelRatio*4',
  ],
  [
    'style:{fontSize:We*15,fill:ze,fontFamily:Ne,fontWeight:"600"}',
    'style:{fontSize:We*60,fill:ze,fontFamily:Ne,fontWeight:"600"},resolution:window.devicePixelRatio*4',
  ],
  [
    'style:{fontSize:We*60,fill:ze,fontFamily:Ne,fontWeight:"600"}});',
    'style:{fontSize:We*60,fill:ze,fontFamily:Ne,fontWeight:"600"},resolution:window.devicePixelRatio*4});',
  ],
  ["lu.scale.set(1/qu)", "lu.scale.set(1/qu/4)"],
  [
    "A.label.alpha=1,A.label.scale.set(l)):A.label.scale.set(i)",
    "A.label.alpha=1,A.label.scale.set(l/4)):A.label.scale.set(i/4)",
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

if (fs.existsSync(excalidrawPluginFile)) {
  const original = fs.readFileSync(excalidrawPluginFile, "utf8")
  let source = original

  const excalidrawReplacements = [
    ["let a=1,u=0,d=0,c=!1,m=0,M=0;", "let a=4,u=0,d=0,c=!1,m=0,M=0;"],
    ["let a=2.4,u=0,d=0,c=!1,m=0,M=0;", "let a=4,u=0,d=0,c=!1,m=0,M=0;"],
    [
      'function s(){v.style.transform="translate("+u+"px, "+d+"px) scale("+a+")",O()}function y',
      'function s(){v.style.transform="translate("+u+"px, "+d+"px) scale("+a+")",O()}s();function y',
    ],
    ["var o=e.deltaY>0?-.15:.15;", "var o=e.deltaY>0?-.5:.5;"],
    ["var o=e.deltaY>0?-.35:.35;", "var o=e.deltaY>0?-.5:.5;"],
    ["a=Math.max(.1,Math.min(5,a+o)),s()", "a=Math.max(.1,Math.min(16,a+o)),s()"],
    ["a=Math.max(.1,Math.min(12,a+o)),s()", "a=Math.max(.1,Math.min(16,a+o)),s()"],
    ["a=Math.min(5,a+.15),s()", "a=Math.min(16,a+.5),s()"],
    ["a=Math.min(12,a+.35),s()", "a=Math.min(16,a+.5),s()"],
    ["a=Math.max(.1,a-.15),s()", "a=Math.max(.1,a-.5),s()"],
    ["a=Math.max(.1,a-.35),s()", "a=Math.max(.1,a-.5),s()"],
    ["a=1,u=0,d=0,s()", "a=4,u=0,d=0,s()"],
    ["a=2.4,u=0,d=0,s()", "a=4,u=0,d=0,s()"],
    ["a=Math.max(.1,Math.min(5,a*g)),f=r,s()", "a=Math.max(.1,Math.min(16,a*g)),f=r,s()"],
    ["a=Math.max(.1,Math.min(12,a*g)),f=r,s()", "a=Math.max(.1,Math.min(16,a*g)),f=r,s()"],
  ]

  for (const [from, to] of excalidrawReplacements) {
    source = source.split(from).join(to)
  }

  if (source !== original) {
    fs.writeFileSync(excalidrawPluginFile, source)
    patched += 1
  }
}

if (patched === 0) {
  console.log("[patch-graph] Graph, theme, and Excalidraw patches already applied or upstream code changed.")
} else {
  console.log(`[patch-graph] Graph/theme/Excalidraw patches applied in ${patched} file(s).`)
}
