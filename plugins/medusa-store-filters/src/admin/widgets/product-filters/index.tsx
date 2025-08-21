import React from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { sdk } from "../../../config"

type FilterVisibility = "inherit" | "show" | "hide"

type Product = {
  id: string
  options?: { id: string; title: string; metadata?: Record<string, any> }[]
}

type WidgetProps = { data?: Product }

const ProductFiltersWidget = ({ data }: WidgetProps) => {
  const product = data ?? null
  const [state, setState] = React.useState<Record<string, FilterVisibility>>({})
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!product) return
    const next: Record<string, FilterVisibility> = {}
    for (const opt of product.options ?? []) {
      const local = (opt.metadata?.filter_visibility as FilterVisibility | undefined) ?? "inherit"
      next[opt.title] = local
    }
    setState(next)
  }, [product?.id])

  const onChange = async (optId: string, key: string, value: FilterVisibility) => {
    setState((s) => ({ ...s, [key]: value }))
    try {
      const metadata = value === "inherit" ? { filter_visibility: undefined } : { filter_visibility: value }
      await sdk.client.fetch(`/admin/product-options/${optId}`, { method: "PATCH", body: { metadata } })
    } catch (e) {
      setError("Failed to update option")
    }
  }

  return (
    <Container>
      <Heading level="h3">Filters</Heading>
      {!product && (
        <Text className="text-ui-fg-subtle">Open a product details page to manage filter visibility.</Text>
      )}
      {error && <Text className="text-ui-fg-error">{error}</Text>}
      {product && (
        <div className="mt-2 grid gap-3">
          {(product.options ?? []).map((opt) => {
            const key = opt.title
            const value = state[key] ?? "inherit"
            return (
              <div key={opt.id} className="flex items-center justify-between">
                <div className="text-sm">{key}</div>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={value}
                    onChange={(e) => onChange(opt.id, key, e.target.value as FilterVisibility)}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="show">Show</option>
                    <option value="hide">Hide</option>
                  </select>
                  {value !== "inherit" && <span className="text-xs text-ui-fg-muted">Overridden</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductFiltersWidget


