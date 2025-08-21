import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: (globalThis as any).__BACKEND_URL__ ?? "/",
  auth: { type: "session" },
  debug: false,
})

import { z } from "zod"

export const StoreFiltersOptionsSchema = z.object({
  licenseKey: z.string().optional(),
  proFeatures: z.boolean().default(true),
  telemetryEnabled: z.boolean().default(false),
  webhookSecret: z.string().optional(),
  corsOrigins: z.array(z.string()).default([]),
})

export type StoreFiltersOptionsInput = z.input<typeof StoreFiltersOptionsSchema>
export type StoreFiltersOptions = z.output<typeof StoreFiltersOptionsSchema>

