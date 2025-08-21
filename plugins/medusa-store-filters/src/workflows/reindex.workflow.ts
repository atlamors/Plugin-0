import { FiltersDbRepository } from "../modules/filters/db-repo"
import { IndexerService } from "../modules/filters/indexer"

type Ctx = { container: any }

const pending = new Set<string>()
let timer: any | undefined

async function flush(ctx: Ctx) {
  if (!pending.size) return
  const productIds = Array.from(pending)
  pending.clear()
  const { container } = ctx
  const productModule = container.resolve("productModuleService") as any
  const repo = new FiltersDbRepository()
  const indexer = new IndexerService(repo)
  const configs = await repo.listConfigs()
  const pageSize = 50
  for (let i = 0; i < productIds.length; i += pageSize) {
    const chunk = productIds.slice(i, i + pageSize)
    const products = await productModule.listProducts({ id: chunk }, { relations: ["options", "variants", "variants.options", "categories"] })
    for (const p of products) {
      await indexer.indexProduct(p, configs)
    }
  }
}

export const queueReindexProduct = async (ctx: Ctx, productId: string) => {
  pending.add(productId)
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => flush(ctx), 2000)
}

export const queueReindexAllProducts = async (ctx: Ctx) => {
  // Load all products and schedule them; dedupe via Set
  const productModule = ctx.container.resolve("productModuleService") as any
  let offset = 0
  const limit = 200
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await productModule.listProducts({}, { offset, limit, select: ["id"] })
    if (!page?.length) break
    for (const p of page) pending.add(p.id)
    offset += page.length
    if (page.length < limit) break
  }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => flush(ctx), 2000)
}


