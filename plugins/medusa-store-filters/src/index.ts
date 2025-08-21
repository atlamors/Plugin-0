import { StoreFiltersOptionsSchema, type StoreFiltersOptions as StoreFiltersOptionsType, type StoreFiltersOptionsInput } from "./config"
import { logger } from "./utils/observability/logger"
import { bootstrapPluginDb } from "./utils/db-bootstrap"
import { setOptions } from "./utils/state"

export type StoreFiltersOptions = StoreFiltersOptionsType

export default async function storeFilters(options?: StoreFiltersOptionsInput) {
    const parsedOptions = StoreFiltersOptionsSchema.parse(options ?? {})
    logger.debug({ ...parsedOptions }, "Plugin 0 initialized with options")
    setOptions(parsedOptions)
    try {
        await bootstrapPluginDb()
    } catch (e) {
        logger.warn({ err: e }, "DB bootstrap failed (non-fatal)")
    }
    return { options: parsedOptions }
}