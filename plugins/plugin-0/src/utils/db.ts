import { Pool } from "pg"

let poolRef: Pool | undefined

export function getPool(): Pool | undefined {
  if (poolRef) return poolRef
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  poolRef = new Pool({ connectionString: url })
  return poolRef
}



