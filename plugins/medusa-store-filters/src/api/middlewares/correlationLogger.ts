import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ensureCorrelation } from "../../utils/correlation"
import { logger } from "../../utils/observability/logger"

export function createCorrelationLogger(scope: "admin" | "store") {
    return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        ensureCorrelation(req, res)
        logger.debug(
            { path: req.path, method: req.method, scope, correlationId: req.get("x-correlation-id") },
            `store-filters ${scope} request`,
        )
        next()
    }
}


