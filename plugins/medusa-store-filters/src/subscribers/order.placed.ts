import { logger } from "../utils/observability/logger"

export async function onOrderPlaced(event: { id: string }) {
  logger.info({ orderId: event.id }, "store-filters subscriber: order.placed")
}


