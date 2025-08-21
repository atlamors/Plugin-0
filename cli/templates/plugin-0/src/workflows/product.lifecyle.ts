import { logger } from "../utils/observability/logger"

export async function onProductUpdated(event: { id: string }) {
  logger.info({ productId: event.id }, "plugin-0 workflow hook: product updated")
}


