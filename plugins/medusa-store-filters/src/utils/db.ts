// Avoid hard dependency on pg during development if not needed
let PoolCtor: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PoolCtor = require("pg").Pool
} catch {
  PoolCtor = null
}

let poolRef: any | undefined

export function getPool(): any | undefined {
  if (poolRef) return poolRef
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  if (!PoolCtor) return undefined
  poolRef = new PoolCtor({ connectionString: url })
  return poolRef
}



