import { logger } from "../utils/observability/logger"

export async function onProductUpdated(event: { id: string }) {
  logger.info({ productId: event.id }, "store-filters workflow hook: product updated")
}


