type TelemetryEvent = { type: string; timestamp: string; payload?: Record<string, unknown> }

const queue: TelemetryEvent[] = []

export function enqueueTelemetry(event: Omit<TelemetryEvent, "timestamp">) {
  queue.push({ ...event, timestamp: new Date().toISOString() })
}

export async function flushTelemetry(): Promise<number> {
  const count = queue.length
  queue.length = 0
  return count
}


