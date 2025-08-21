import { z } from "zod"

export const Plugin0OptionsSchema = z.object({
  licenseKey: z.string().optional(),
  proFeatures: z.boolean().default(true),
  telemetryEnabled: z.boolean().default(false),
  webhookSecret: z.string().optional(),
  corsOrigins: z.array(z.string()).default([]),
})

export type Plugin0OptionsInput = z.input<typeof Plugin0OptionsSchema>
export type Plugin0Options = z.output<typeof Plugin0OptionsSchema>

