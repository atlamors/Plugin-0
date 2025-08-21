import { cp, mkdir, readFile, writeFile, stat } from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { spawn } from "child_process"
import { linkCmd } from "./link.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function replaceAll(content, replacements) {
    let result = content
    for (const [from, to] of replacements) {
        result = result.split(from).join(to)
    }
    return result
}

function splitIntoWords(raw) {
    // Split on any non-alphanumeric boundary and camelCase transitions
    const delimSplit = String(raw).split(/[^A-Za-z0-9]+/).filter(Boolean)
    const words = []
    for (const part of delimSplit) {
        const camelSplit = part.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/\s+/)
        for (const w of camelSplit) {
            if (w) words.push(w)
        }
    }
    return words
}

function toUpperCamel(raw) {
    const words = Array.isArray(raw) ? raw : splitIntoWords(raw)
    return words
        .map((w) => w.toLowerCase())
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("")
}

function toLowerCamel(raw) {
    const words = Array.isArray(raw) ? raw : splitIntoWords(raw)
    const upper = toUpperCamel(words)
    return upper.charAt(0).toLowerCase() + upper.slice(1)
}

async function walkFiles(dir) {
    const entries = await import("node:fs").then(({ readdirSync, statSync }) => {
        const items = []
        const stack = [dir]
        while (stack.length) {
            const current = stack.pop()
            const dirents = readdirSync(current, { withFileTypes: true })
            for (const d of dirents) {
                const full = path.join(current, d.name)
                if (d.isDirectory()) {
                    stack.push(full)
                } else {
                    items.push(full)
                }
            }
        }
        return items
    })
    return entries
}

async function ensureWorkspaceIncludesPlugins(rootDir) {
    const workspaceFile = path.join(rootDir, "pnpm-workspace.yaml")
    const content = await readFile(workspaceFile, "utf8")
    if (!content.includes("plugins/*")) {
        const updated = content.trimEnd() + "\n  - \"plugins/*\"\n"
        await writeFile(workspaceFile, updated)
    }
}

async function registerInMedusaConfig(rootDir, pluginName) {
    const medusaConfig = path.join(rootDir, "apps/medusa/medusa-config.ts")
    let content = await readFile(medusaConfig, "utf8")
    const resolvePath = `./plugins/${pluginName}`
    if (content.includes(resolvePath)) return
    // naive insertion before closing array bracket of plugins
    const marker = "]\n})"
    const insertion = `        {\n            resolve: \"${resolvePath}\"\n        },\n`
    if (content.includes("plugins:")) {
        content = content.replace(/plugins:\s*\[/, (m) => m + "\n" + insertion)
    } else {
        // fallback: append plugins array
        const inject = `,\n    plugins: [\n${insertion}    ]\n`
        content = content.replace(/defineConfig\(\{[\s\S]*?projectConfig:[\s\S]*?\}\)/, (m) => m.replace(/\}\)$/, inject + "})"))
    }
    await writeFile(medusaConfig, content)
}

export async function newCmd(name, options) {
    const rootDir = path.resolve(process.cwd())
    // Prefer copying the existing opinionated plugin-0 as the template
    let templateDir = path.join(rootDir, "plugins", "plugin-0")
    try {
        await stat(templateDir)
    } catch {
        // fallback to bundled minimal template
        templateDir = path.join(__dirname, "templates", "plugin")
    }
    const targetDir = path.join(rootDir, "plugins", name)

    await mkdir(targetDir, { recursive: true })
    await cp(templateDir, targetDir, { recursive: true })

    // replace placeholders across files
    const camelLower = toLowerCamel(name)
    const camelUpper = toUpperCamel(name)
    const files = await walkFiles(targetDir)
    for (const file of files) {
        const isBinary = /(\.png|\.jpg|\.jpeg|\.gif|\.ico|\.zip|\.tar|\.zst)$/i.test(file)
        if (isBinary) continue
        let content = await readFile(file, "utf8").catch(() => null)
        if (content == null) continue
        content = replaceAll(content, [
            ["plugin-0", name],
            ["plugin0", camelLower],
            ["Plugin0", camelUpper],
            ["__NAME__", name],
        ])
        await writeFile(file, content)
    }

    // Normalize package.json name to folder name (no scope)
    try {
        const pkgPath = path.join(targetDir, "package.json")
        const pkg = JSON.parse(await readFile(pkgPath, "utf8"))
        pkg.name = name
        await writeFile(pkgPath, JSON.stringify(pkg, null, 4) + "\n")
    } catch {}

    await ensureWorkspaceIncludesPlugins(rootDir)
    await registerInMedusaConfig(rootDir, name)

    if (options.install !== false) {
        await new Promise((resolve, reject) => {
            const child = spawn("pnpm", ["install"], { stdio: "inherit", cwd: rootDir })
            child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`pnpm install failed (${code})`))))
        })
    }

    // Sync workspace config, medusa plugin list, and dev script filters
    await linkCmd()

    console.log(`Created plugin at plugins/${name}`)
}


