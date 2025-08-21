import type { MedusaContainer } from "@medusajs/framework/types"

export default async function placeholderJob(container: MedusaContainer) {
  const logger = container.resolve("logger") as { info: (obj: any, msg?: string) => void }
  logger?.info({ job: "plugin-0:placeholder" }, "Running placeholder job")
}

export const config = {
  name: "plugin-0:placeholder",
  schedule: "0 3 * * *", // run daily at 03:00
}


