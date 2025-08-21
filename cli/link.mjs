import { readdir, readFile, writeFile, stat } from "fs/promises"
import path from "path"

async function listPlugins(rootDir) {
    const pluginsDir = path.join(rootDir, "plugins")
    const entries = await readdir(pluginsDir)
    const result = []
    for (const name of entries) {
        const full = path.join(pluginsDir, name)
        try {
            const s = await stat(full)
            if (s.isDirectory()) result.push(name)
        } catch {}
    }
    return result
}

async function ensureWorkspace(rootDir) {
    const wsFile = path.join(rootDir, "pnpm-workspace.yaml")
    let content = await readFile(wsFile, "utf8")
    if (!content.includes("plugins/*")) {
        content = content.trimEnd() + "\n  - \"plugins/*\"\n"
        await writeFile(wsFile, content)
    }
}

async function ensureMedusaConfig(rootDir, pluginNames) {
    const cfg = path.join(rootDir, "apps/medusa/medusa-config.ts")
    let content = await readFile(cfg, "utf8")
    let changed = false
    for (const name of pluginNames) {
        const resolvePath = `./plugins/${name}`
        if (!content.includes(resolvePath)) {
            changed = true
            content = content.replace(/plugins:\s*\[/, (m) => m + `\n        {\n            resolve: \"${resolvePath}\"\n        },\n`)
        }
    }
    if (changed) await writeFile(cfg, content)
}

function addFiltersToCommand(cmd, pluginNames) {
    if (!cmd) return cmd
    let result = cmd
    for (const name of pluginNames) {
        const flag = `--filter=./plugins/${name}`
        if (!result.includes(flag)) {
            result = result.trimEnd() + ` ${flag}`
        }
    }
    return result
}

async function ensureDevScripts(rootDir, pluginNames) {
    const pkgPath = path.join(rootDir, "package.json")
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"))
    if (!pkg.scripts) return
    const keysToUpdate = ["dev", "dev:plugins"]
    let changed = false
    for (const key of keysToUpdate) {
        if (pkg.scripts[key]) {
            const updated = addFiltersToCommand(pkg.scripts[key], pluginNames)
            if (updated !== pkg.scripts[key]) {
                pkg.scripts[key] = updated
                changed = true
            }
        }
    }
    if (changed) await writeFile(pkgPath, JSON.stringify(pkg, null, 4) + "\n")
}

export async function linkCmd() {
    const rootDir = path.resolve(process.cwd())
    const plugins = await listPlugins(rootDir)
    await ensureWorkspace(rootDir)
    await ensureMedusaConfig(rootDir, plugins)
    await ensureDevScripts(rootDir, plugins)
    console.log("Linked plugins:", plugins.join(", "))
}


