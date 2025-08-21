import type { SubscriberArgs } from "@medusajs/framework"
import { queueReindexProduct } from "../workflows/reindex.workflow"

export default async function handleProductOptionUpdated({ event, container }: SubscriberArgs<{ product_id: string }>) {
  const productId = (event as any).product_id
  if (!productId) return
  await queueReindexProduct({ container }, productId)
}

export const config = {
  event: "product-option.updated",
}


