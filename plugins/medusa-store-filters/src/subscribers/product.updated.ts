import type { SubscriberArgs } from "@medusajs/framework"
import { queueReindexProduct } from "../workflows/reindex.workflow"

export default async function handleProductUpdated({ event, container }: SubscriberArgs<{ id: string }>) {
  const productId = (event as any).id || (event as any).product_id
  if (!productId) return
  await queueReindexProduct({ container }, productId)
}

export const config = {
  event: "product.updated",
}


