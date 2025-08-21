import { FiltersDbRepository } from "./db-repo"
import { logger } from "../../utils/observability/logger"

type Product = {
  id: string
  title: string
  options?: { id: string; title: string; metadata?: Record<string, any> }[]
  collection_id?: string | null
  categories?: { id: string; handle?: string; name?: string }[]
  metadata?: Record<string, any>
}

export class AggregatorService {
  constructor(private readonly repo = new FiltersDbRepository()) {}

  normalizeKey(input: string): string {
    return input.trim().toLowerCase()
  }

  async discoverAndUpsertFacetKeys(products: Product[]): Promise<number> {
    const discovered = new Map<string, { facet_key: string; kind: "option" | "attribute" | "org" }>()

    for (const p of products) {
      // Options
      for (const opt of p.options ?? []) {
        if (!opt?.title) continue
        const title = this.normalizeKey(opt.title)
        const key = `option:${title}`
        discovered.set(key, { facet_key: key, kind: "option" })
      }

      // Org facets (stubs)
      discovered.set("org:brand", { facet_key: "org:brand", kind: "org" })
      discovered.set("org:collection", { facet_key: "org:collection", kind: "org" })
      discovered.set("org:category", { facet_key: "org:category", kind: "org" })

      // Attributes (stub: if present in metadata.attributes)
      const attrs = (p.metadata as any)?.attributes as Record<string, any> | undefined
      if (attrs && typeof attrs === "object") {
        for (const name of Object.keys(attrs)) {
          const title = this.normalizeKey(name)
          const key = `attribute:${title}`
          discovered.set(key, { facet_key: key, kind: "attribute" })
        }
      }
    }

    let upserts = 0
    for (const d of discovered.values()) {
      try {
        await this.repo.upsertConfig({ ...d, enabled: false })
        upserts += 1
      } catch (e) {
        logger.warn({ err: e, key: d.facet_key }, "Failed to upsert facet config (continuing)")
      }
    }
    return upserts
  }
}


