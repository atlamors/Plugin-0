import { z } from "zod"
import type { FilterConfig } from "./entities"
import { FiltersDbRepository } from "./db-repo"

export const FilterConfigUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  display_type: z.enum(["categorical", "range", "boolean", "swatch"]).optional(),
  label_override: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
})

export type FilterConfigUpdateInput = z.input<typeof FilterConfigUpdateSchema>

const repo = new FiltersDbRepository()

export class FiltersService {
  async listConfigs(): Promise<FilterConfig[]> {
    return repo.listConfigs()
  }

  async updateConfig(id: string, input: FilterConfigUpdateInput): Promise<FilterConfig | undefined> {
    const parsed = FilterConfigUpdateSchema.parse(input)
    return repo.updateConfigById(id, parsed)
  }
}


