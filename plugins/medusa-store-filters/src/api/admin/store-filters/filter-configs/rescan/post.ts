import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { AggregatorService } from "../../../../../modules/filters/aggregator"

// MVP: naive in-process scan using store API to fetch products
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const container = req.scope
  const productModule = container.resolve("productModuleService") as any
  const aggregator = new AggregatorService()

  // fetch products in pages to avoid memory blowups
  let offset = 0
  const limit = 100
  let totalUpserts = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await productModule.listProducts({}, { offset, limit, relations: ["options", "categories"] })
    if (!page?.length) break
    totalUpserts += await aggregator.discoverAndUpsertFacetKeys(page as any)
    offset += page.length
    if (page.length < limit) break
  }

  res.status(202).json({ queued: true, upserts: totalUpserts })
}


