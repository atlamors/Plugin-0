import { Plugin0OptionsSchema, type Plugin0Options as Plugin0OptionsType, type Plugin0OptionsInput } from "./config"
import { logger } from "./utils/observability/logger"
import { setOptions } from "./utils/state"

export type Plugin0Options = Plugin0OptionsType

export default async function plugin0(options?: Plugin0OptionsInput) {
  const parsedOptions = Plugin0OptionsSchema.parse(options ?? {})
  logger.debug({ ...parsedOptions }, "Plugin 0 initialized with options")
  setOptions(parsedOptions)
  return { options: parsedOptions }
}

