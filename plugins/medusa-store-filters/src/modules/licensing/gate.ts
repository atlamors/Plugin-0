import type { LicenseStatus } from "./stub"

export function hasFeature(status: LicenseStatus | undefined, feature: string): boolean {
  if (!status) return false
  if (status.state === "expired") return false
  return status.features.includes(feature)
}


