import { logger } from "../utils/observability/logger"

export async function onOrderPlaced(event: { id: string }) {
  logger.info({ orderId: event.id }, "plugin-0 subscriber: order.placed")
}


