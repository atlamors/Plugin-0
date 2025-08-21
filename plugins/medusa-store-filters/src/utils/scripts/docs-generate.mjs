import fs from "node:fs"
import path from "node:path"

const root = path.resolve(process.cwd(), "plugins/medusa-store-filters")
const readmePath = path.join(root, "README.mdx")
const configPath = path.join(root, "src/config.ts")

function extractRoutes() {
  const routes = []
  const base = fs.existsSync(path.join(root, "src/api")) ? path.join(root, "src/api") : path.resolve("plugins/medusa-store-filters/src/api")
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === "route.ts") {
        const rel = path.relative(base, full)
        routes.push(rel.replace(/\\/g, "/"))
      }
    }
  }
  walk(base)
  return routes.sort()
}

function updateReadme() {
  const routes = extractRoutes()
  let content = fs.readFileSync(readmePath, "utf8")
  const start = "<!-- ROUTES:START -->"
  const end = "<!-- ROUTES:END -->"
  const block = `${start}\n\n${routes.map((r) => `- ${r}`).join("\n")}\n\n${end}`
  if (content.includes(start) && content.includes(end)) {
    content = content.replace(new RegExp(`${start}[\s\S]*?${end}`), block)
  } else {
    content += `\n\n## Routes\n\n${block}\n`
  }
  fs.writeFileSync(readmePath, content)
}

function extractOptions() {
  try {
    const src = fs.readFileSync(configPath, "utf8")
    const match = src.match(/StoreFiltersOptionsSchema\s*=\s*z\.object\(\{([\s\S]*?)\}\)/)
    if (!match) return []
    const body = match[1]
    const lines = body
      .split(/\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//"))
    const rows = []
    for (const line of lines) {
      const m = line.match(/(\w+):\s*z\.(\w+)/)
      if (m) {
        const [_, key, type] = m
        const def = /\.default\(([^\)]*)\)/.test(line) ? RegExp.$1 : ""
        const optional = /\.optional\(\)/.test(line)
        rows.push({ key, type, optional, def })
      }
    }
    return rows
  } catch {
    return []
  }
}

function updateOptionsTable() {
  const rows = extractOptions()
  let content = fs.readFileSync(readmePath, "utf8")
  const start = "<!-- OPTIONS:START -->"
  const end = "<!-- OPTIONS:END -->"
  const header = `| Option | Type | Optional | Default |\n|---|---|---|---|`
  const table = rows
    .map((r) => `| ${r.key} | ${r.type} | ${r.optional ? "yes" : "no"} | ${r.def || ""} |`)
    .join("\n")
  const block = `${start}\n\n${header}\n${table}\n\n${end}`
  if (content.includes(start) && content.includes(end)) {
    content = content.replace(new RegExp(`${start}[\s\S]*?${end}`), block)
  } else {
    content += `\n\n## Options\n\n${block}\n`
  }
  fs.writeFileSync(readmePath, content)
}

updateOptionsTable()

updateReadme()


