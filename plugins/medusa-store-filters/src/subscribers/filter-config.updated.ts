import type { SubscriberArgs } from "@medusajs/framework"
import { FiltersDbRepository } from "../modules/filters/db-repo"
import { IndexerService } from "../modules/filters/indexer"

export default async function handleFilterConfigUpdated({ container }: SubscriberArgs<{ id: string }>) {
  // Fan-out: naive small-batch indexing of all products (optimize with workflows later)
  const productModule = container.resolve("productModuleService") as any
  const repo = new FiltersDbRepository()
  const indexer = new IndexerService(repo)
  const configs = await repo.listConfigs()
  let offset = 0
  const limit = 100
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await productModule.listProducts({}, { offset, limit, relations: ["options", "variants", "variants.options"] })
    if (!page?.length) break
    for (const p of page) {
      await indexer.indexProduct(p, configs)
    }
    offset += page.length
    if (page.length < limit) break
  }
}

export const config = {
  event: "store-filters.filter-config.updated",
}


