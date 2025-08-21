import type { MedusaContainer } from "@medusajs/framework/types"

export default async function placeholderJob(container: MedusaContainer) {
  const logger = container.resolve("logger") as { info: (obj: any, msg?: string) => void }
  logger?.info({ job: "store-filters:placeholder" }, "Running placeholder job")
}

export const config = {
  name: "store-filters:placeholder",
  schedule: "0 3 * * *", // run daily at 03:00
}


