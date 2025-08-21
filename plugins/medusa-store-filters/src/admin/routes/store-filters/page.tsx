import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Label, Switch } from "@medusajs/ui"
import { Beaker } from "@medusajs/icons"

import React from "react"

type FilterConfig = {
  id: string
  facet_key: string
  kind: "option" | "attribute" | "org"
  enabled: boolean
  display_type: "categorical" | "range" | "boolean" | "swatch"
  label_override: string | null
  unit: string | null
  sort_order: number
}

const StoreFiltersPage = () => {
  const [items, setItems] = React.useState<FilterConfig[]>([])
  const [loading, setLoading] = React.useState(false)

  const fetchItems = async () => {
    setLoading(true)
    const res = await fetch("/admin/store-filters/filter-configs")
    const json = await res.json()
    setItems(json.items ?? [])
    setLoading(false)
  }

  React.useEffect(() => {
    fetchItems()
  }, [])

  const updateItem = async (id: string, body: Partial<FilterConfig>) => {
    await fetch(`/admin/store-filters/filter-configs/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    fetchItems()
  }

  const rescan = async () => {
    await fetch(`/admin/store-filters/filter-configs/rescan`, { method: "POST" })
    fetchItems()
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Store Filters</Heading>
        <Button size="small" onClick={rescan} disabled={loading}>Rescan catalog</Button>
      </div>
      <div className="grid gap-4 p-6">
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-12 items-center gap-4">
            <div className="col-span-3">
              <Label>{it.facet_key}</Label>
              <div className="text-xs text-ui-fg-subtle">{it.kind}</div>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch checked={it.enabled} onCheckedChange={(v) => updateItem(it.id, { enabled: v as boolean })} />
              <span className="text-sm">Enabled</span>
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <Input size="small" placeholder="Label" defaultValue={it.label_override ?? ""} onBlur={(e) => updateItem(it.id, { label_override: e.target.value || null })} />
              <Input size="small" placeholder="Unit" className="w-24" defaultValue={it.unit ?? ""} onBlur={(e) => updateItem(it.id, { unit: e.target.value || null })} />
            </div>
            <div className="col-span-2">
              <Input size="small" type="number" placeholder="Sort" defaultValue={it.sort_order} onBlur={(e) => updateItem(it.id, { sort_order: Number(e.target.value || 0) })} />
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
    label: "Store Filters",
    icon: Beaker,
})

export default StoreFiltersPage


