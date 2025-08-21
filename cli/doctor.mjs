import { readdir, readFile } from "fs/promises"
import path from "path"
import net from "net"

async function portInUse(port) {
    return await new Promise((resolve) => {
        const server = net.createServer()
        server.once("error", () => resolve(true))
        server.once("listening", () => server.close(() => resolve(false)))
        server.listen(port, "127.0.0.1")
    })
}

export async function doctorCmd() {
    const rootDir = path.resolve(process.cwd())
    const results = []

    // Check workspace includes plugins/*
    try {
        const ws = await readFile(path.join(rootDir, "pnpm-workspace.yaml"), "utf8")
        const ok = /plugins\s*\/\*/.test(ws)
        results.push(["Workspace includes plugins/*", ok, ok ? "" : "Add \"plugins/*\" to pnpm-workspace.yaml under packages:"])
    } catch (e) {
        results.push(["pnpm-workspace.yaml present", false, "Create pnpm-workspace.yaml with packages including \"plugins/*\""])
    }

    // Collect plugin folders
    let pluginDirs = []
    try {
        pluginDirs = (await readdir(path.join(rootDir, "plugins"))).filter(Boolean)
    } catch {}

    // Medusa config registration
    try {
        const cfg = await readFile(path.join(rootDir, "apps/medusa/medusa-config.ts"), "utf8")
        const missing = pluginDirs.filter((p) => !cfg.includes(`./plugins/${p}`))
        const ok = missing.length === 0
        results.push(["Medusa config registers all plugins", ok, ok ? "" : `Missing: ${missing.join(", ")}`])
    } catch (e) {
        results.push(["apps/medusa/medusa-config.ts present", false, "Create medusa-config.ts and register plugins in plugins: [] array"])
    }

    // turbo.json exists
    try {
        await readFile(path.join(rootDir, "turbo.json"), "utf8")
        results.push(["turbo.json present", true, ""])
    } catch {
        results.push(["turbo.json present", false, "Add turbo.json for task orchestration"])
    }

    // Port checks (optional)
    const port3011 = await portInUse(3011)
    const port9011 = await portInUse(9011)
    results.push(["Port 3011 free", !port3011, port3011 ? "Run predev or free the port" : ""])
    results.push(["Port 9011 free", !port9011, port9011 ? "Run predev or free the port" : ""])

    // Consistency: folder name vs package.json name
    for (const p of pluginDirs) {
        try {
            const pkg = JSON.parse(await readFile(path.join(rootDir, "plugins", p, "package.json"), "utf8"))
            const pkgName = String(pkg.name || "")
            const lastSegment = pkgName.includes("/") ? pkgName.split("/").pop() : pkgName
            const ok = lastSegment === p
            results.push([`plugins/${p} package name matches folder (or scoped)`, ok, ok ? "" : `Set package.json name so last segment equals \"${p}\"`])
        } catch {}
    }

    // Print summary
    let failed = 0
    for (const [label, ok, hint] of results) {
        if (ok) {
            console.log(`PASS - ${label}`)
        } else {
            failed++
            console.log(`FAIL - ${label}${hint ? ` => ${hint}` : ""}`)
        }
    }
    if (failed > 0) process.exitCode = 1
}


