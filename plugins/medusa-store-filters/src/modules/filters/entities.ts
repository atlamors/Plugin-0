export type FilterConfig = {
  id: string
  facet_key: string
  kind: "option" | "attribute" | "org"
  enabled: boolean
  display_type: "categorical" | "range" | "boolean" | "swatch"
  label_override: string | null
  unit: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type FacetIndexRow = {
  id: string
  product_id: string
  region_id: string | null
  sales_channel_id: string | null
  facets: Record<string, unknown>
  price_min: string | null
  price_max: string | null
  in_stock: boolean | null
  created_at: string
  updated_at: string
}


