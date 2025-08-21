import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { FiltersService } from "../../../../../modules/filters/service"
import { queueReindexAllProducts } from "../../../../../workflows/reindex.workflow"

export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params as { id: string }
  const service = new FiltersService()
  const item = await service.updateConfig(id, req.body || {})
  // fan-out reindex in background (debounced)
  await queueReindexAllProducts({ container: req.scope })
  res.json(item)
}


