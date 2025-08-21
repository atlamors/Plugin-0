import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { FiltersService } from "../../../../modules/filters/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = new FiltersService()
  const items = await service.listConfigs()
  res.json({ items })
}


