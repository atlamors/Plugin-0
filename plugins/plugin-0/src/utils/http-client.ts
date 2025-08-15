export async function httpPost(url: string, body: unknown, opts?: { retries?: number; backoffMs?: number }) {
  const max = opts?.retries ?? 3
  const backoff = opts?.backoffMs ?? 200
  let lastErr: unknown
  for (let attempt = 0; attempt < max; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body ?? {}),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json().catch(() => ({}))
    } catch (e) {
      lastErr = e
      if (attempt < max - 1) await new Promise((r) => setTimeout(r, backoff * (attempt + 1)))
    }
  }
  throw lastErr
}


