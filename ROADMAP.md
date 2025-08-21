# Plugin‑0 CLI & Monorepo Roadmap

A pragmatic, incremental plan to ship a plug‑and‑play Medusa plugin environment with a first‑class `plugin0` CLI. The roadmap is milestone‑driven with clear deliverables, acceptance criteria, and “done means done” checks.

---

## Milestone 1 — MVP CLI (Scaffold, Link, Doctor)

**Goal:** Create new plugins fast and boot the dev stack with zero manual edits.

### Scope

- `plugin0 new <name>` — scaffold a plugin from local template (`plugins/plugin-0/cli/templates/plugin`), fill in placeholders, add to workspace, register in `apps/medusa/medusa-config.ts`.
    
- `plugin0 link` — scan `plugins/*` and idempotently ensure they are in `pnpm-workspace.yaml` and registered in Medusa config.
    
- `plugin0 doctor` — verify project health (workspace, medusa config, turbo.json presence, ports), print actionable fixes.
    
- **Dev orchestration (temporary):** use `pnpm -w run dev:*` to launch each process in its own terminal (avoid Turbo races in MVP).
    

### Tasks

1. **CLI package wiring**
    
    - Add binary in `@atla/plugin-0/package.json`: `{ "bin": { "plugin0": "cli/index.mjs" } }`.
        
    - Add `commander` as a dependency; set up `cli/index.mjs` command router.
        
2. **`plugin0 new`**
    
    - Copy template → `plugins/<name>`; replace placeholders (`__NAME__`, scope, etc.).
        
    - Update `pnpm-workspace.yaml` (ensure `plugins/*`).
        
    - Inject plugin block into `apps/medusa/medusa-config.ts`.
        
    - Optional: `--no-install` flag.
        
3. **`plugin0 link`**
    
    - Re-scan and ensure all `plugins/*` are registered. Safe, repeatable.
        
4. **`plugin0 doctor`**
    
    - Checks: workspace membership, medusa registration, ports (3011/9011/free), template scripts present (`dev`, `generate` optional), storefront filter consistency.
        
5. **Dev scripts (root)**
    
    - `dev:plugin:0`, `dev:medusa`, `dev:storefront` run in separate terminals.
        
    - `dev` can either spawn these or just document the recommended `pnpm -w` commands.
        

### Acceptance Criteria

- `plugin0 new sample-plugin` produces a runnable plugin in `plugins/sample-plugin`.
    
- Running `pnpm -w run dev:plugin:0`, `dev:medusa`, `dev:storefront` in separate terminals boots the stack, HMR works for plugin & apps.
    
- `plugin0 link` and `plugin0 doctor` execute cleanly and report fixes when misconfigured.
    

### Done Means Done

- README updated with installation + quickstart.
    
- Template includes minimal admin widget & one API route proving HMR.
    
- Vitest unit smoke for new plugin (builds, exports default loader).
    

---

## Milestone 2 — Namespacing & Template Variables

**Goal:** Make scaffolding outputs production‑grade and uniquely identified.

### Scope

- Introduce placeholders in template (`package.json`, code comments, ports if needed).
    
- Support optional scope: `plugin0 new --scope @atla <name>` → `@atla/<name>`.
    
- Normalize filters (path‑based or name‑based) and document the choice.
    

### Tasks

- Add a small variable substitution layer to `plugin0 new` (e.g., `__PKG_SCOPE__`, `__NAME__`).
    
- Ensure generated `name`, `main/module/types`, and import paths align.
    
- Add health check route or `.ready` sentinel in template via `tsup onSuccess`.
    

### Acceptance Criteria

- Generated packages compile without edits and publish dry‑run passes.
    
- `link`/`doctor` recognize namespaced and non‑scoped plugins.
    

---

## Milestone 3 — Proper Dev Orchestration (No Races)

**Goal:** Replace multi‑terminal workaround with reliable single‑command dev.

### Scope (Preferred Path)

- Add **`generate`** task that builds plugin runtime once before dev watchers.
    
- Keep **`ready`** short‑lived task that exits after a fresh build/health signal.
    
- `dev.dependsOn = ["@atla/plugin-0#generate", "@atla/plugin-0#ready", "^build"]`.
    

### Tasks

1. **Template scripts**
    
    - `generate: medusa plugin:build`
        
    - `dev: medusa plugin:develop`
        
    - `ready: node scripts/wait-plugin-build.mjs` (mtime or `.ready` file)
        
2. **Root turbo.json**
    
    - Declare `@atla/plugin-0#generate`, `#dev` (persistent), `#ready`.
        
    - Global `dev.dependsOn` includes `@atla/plugin-0#generate` and `@atla/plugin-0#ready`.
        
3. **Switch root dev script** back to `turbo run dev --filter=…` (no `--parallel`).
    

### Acceptance Criteria

- Single `pnpm dev` starts plugin‑0, additional plugins, medusa, storefront with deterministic order.
    
- Cold start and subsequent rebuilds consistently load plugin features without “.medusa/server deleted” races.
    

---

## Milestone 4 — Template Distribution via NPM

**Goal:** Deterministic scaffolding independent of the monorepo state.

### Scope

- Publish `@atla/plugin-template` (files‑only package) to NPM.
    
- `plugin0 new` defaults to NPM; support `--from=git|path` for overrides.
    

### Tasks

- Use `pacote.extract("@atla/plugin-template@^x.y", dest)` in CLI.
    
- Keep local template as fallback during development.
    
- Version lock: CLI ships with a compatible template range.
    

### Acceptance Criteria

- Fresh consumer can `pnpm i @atla/plugin-0` then `plugin0 new foo` without cloning the monorepo template.
    

---

## Milestone 5 — DX Polish & Quality Gates

**Goal:** Developer experience feels premium and resilient.

### Scope

- `plugin0 doctor` expanded: turbo graph checks, sentinel verification, port/HTTP probes, actionable fix commands.
    
- `plugin0 dev` convenience command (wraps `turbo run dev …`).
    
- CI: lint, typecheck, unit tests; optional Playwright smoke that boots stack and pings health endpoints.
    

### Tasks

- Add `doctor` subchecks with clear PASS/FAIL and suggested commands.
    
- Add GitHub Actions matrix for Node LTS (20+).
    

### Acceptance Criteria

- CI green on PRs; `doctor` reliably identifies the common misconfigs.
    

---

## Milestone 6 — Optional Upstream PRs / Long‑Term Enhancements

**Goal:** Reduce custom glue, align with ecosystem.

### Ideas

- PR to `@medusajs/cli`: add `plugin:develop --ready-file <path>` to emit a ready sentinel after first successful compile.
    
- Add a `plugins.json` manifest at repo root; `plugin0 link` syncs to Medusa config.
    
- `plugin0 upgrade <name>`: apply non‑breaking template diffs to an existing plugin (later).
    

---

## Operational Details

### Naming & Filters

Pick one:

- **Path‑based filters** (simple, robust): `--filter=./apps/medusa-storefront`
    
- **Name‑based filters** (if names match folders): `"name": "@atla/medusa-storefront"`
    

Document and enforce via `doctor`.

### Cross‑Platform

- Prefer Node scripts over shell one‑liners (`scripts/*.mjs`).
    
- For sentinels: use file mtime or HTTP/port checks with a small Node probe.
    

### Security & Safety

- Template is files‑only; avoid executing remote post‑init code.
    
- Validate plugin names; no overwrite unless `--force`.
    

---

## Timeline & Effort (rough)

- **M1 (MVP CLI):** 0.5–1.5 days
    
- **M2 (Namespacing/vars):** 0.5 day
    
- **M3 (Orchestration):** 0.5–1 day
    
- **M4 (NPM template):** 0.5–1 day
    
- **M5 (DX & CI polish):** 1–2 days
    
- **M6 (Upstream PRs, upgrades):** opportunistic
    

---

## Definition of Done (Project)

- One‑command quickstart documented and verified:  
    `pnpm i @atla/plugin-0 && plugin0 new demo && pnpm dev` → storefront + medusa + plugin(s) running with HMR.
    
- Template and CLI versions are published with semver and basic release notes.
    
- CI covers scaffold, link, and doctor flows.
    

---

## Open Questions / Decisions

- Final stance on filters: path vs name?
    
- Do we want a `plugins.json` manifest now or later?
    
- Should `plugin0 dev` become the canonical entry point in docs to hide Turbo details?
    

---

## Next Actions (you can assign now)

1. **M1** — Wire CLI skeleton & `new|link|doctor` (local template).
    
2. Add root `dev:*` scripts for multi‑terminal MVP run.
    
3. Write developer doc page: Quickstart + Troubleshooting (doctor outputs).
    
4. Line up M3 tasks to fold back into single‑command dev once M1 lands.