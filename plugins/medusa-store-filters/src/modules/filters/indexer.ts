import type { FacetIndexRow, FilterConfig } from "./entities"
import { FiltersDbRepository } from "./db-repo"

type ProductWithVariants = {
  id: string
  options?: { id: string; title: string; metadata?: Record<string, any> }[]
  variants?: { id: string; options?: { option_id: string; value: string }[]; prices?: any[]; inventory?: any }[]
  collection_id?: string | null
  categories?: { id: string; handle?: string; name?: string }[]
  metadata?: Record<string, any>
}

export type FilterVisibility = "inherit" | "show" | "hide"

export function resolveEffectiveVisibility(local: FilterVisibility | undefined, globalEnabled: boolean): boolean {
  if (local === "show") return true
  if (local === "hide") return false
  return !!globalEnabled
}

export class IndexerService {
  constructor(private readonly repo = new FiltersDbRepository()) {}

  async indexProduct(product: ProductWithVariants, configs: FilterConfig[]): Promise<FacetIndexRow | undefined> {
    const facets: Record<string, any> = {}

    for (const cfg of configs) {
      if (cfg.kind === "option") {
        const matching = (product.options ?? []).filter((o) => o.title?.toLowerCase() === cfg.facet_key.replace("option:", ""))
        if (!matching.length) continue
        const local = matching[0]?.metadata?.filter_visibility as FilterVisibility | undefined
        const include = resolveEffectiveVisibility(local, cfg.enabled)
        if (!include) continue
        const values = new Set<string>()
        for (const v of product.variants ?? []) {
          for (const opt of v.options ?? []) {
            const optionRef = (product.options ?? []).find((p) => p.id === opt.option_id)
            if (optionRef && optionRef.title?.toLowerCase() === cfg.facet_key.replace("option:", "")) {
              values.add(opt.value)
            }
          }
        }
        if (values.size) {
          facets[cfg.facet_key] = Array.from(values)
        }
      }
      if (cfg.kind === "org" && cfg.enabled) {
        if (cfg.facet_key === "org:collection") {
          const vals = new Set<string>()
          if (product.collection_id) vals.add(String(product.collection_id))
          if (vals.size) facets[cfg.facet_key] = Array.from(vals)
        } else if (cfg.facet_key === "org:category") {
          const vals = new Set<string>()
          for (const c of product.categories ?? []) {
            if (c.id) vals.add(String(c.id))
          }
          if (vals.size) facets[cfg.facet_key] = Array.from(vals)
        } else if (cfg.facet_key === "org:brand") {
          const brand = (product.metadata as any)?.brand
          if (brand) facets[cfg.facet_key] = [String(brand)]
        }
      }
      if (cfg.kind === "attribute" && cfg.enabled) {
        const attrs = (product.metadata as any)?.attributes as Record<string, any> | undefined
        if (attrs) {
          const name = cfg.facet_key.replace("attribute:", "")
          const val = attrs[name]
          if (val !== undefined && val !== null) {
            const vals = Array.isArray(val) ? val : [val]
            facets[cfg.facet_key] = vals.map((v: any) => String(v))
          }
        }
      }
    }

    const row: Omit<FacetIndexRow, "created_at" | "updated_at"> = {
      id: product.id,
      product_id: product.id,
      region_id: null,
      sales_channel_id: null,
      facets,
      price_min: null,
      price_max: null,
      in_stock: null,
    }
    return this.repo.writeFacetIndexRow(row)
  }
}


