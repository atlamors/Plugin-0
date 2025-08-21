export type LicenseStatus = {
  tier: "free" | "pro" | "enterprise"
  features: string[]
  expiresAt?: string
  lastVerifiedAt?: string
  state: "valid" | "grace" | "expired" | "offline" | "invalid"
  message?: string
}

export async function verifyLicenseStub(licenseKey?: string): Promise<LicenseStatus> {
  const now = new Date().toISOString()
  if (!licenseKey) {
    return { tier: "free", features: [], state: "valid", lastVerifiedAt: now, message: "Free tier" }
  }
  if (licenseKey?.startsWith("pro_grace_")) {
    return {
      tier: "pro",
      features: ["pro"],
      state: "grace",
      lastVerifiedAt: now,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      message: "In grace period",
    }
  }
  if (licenseKey?.startsWith("pro_offline_")) {
    return { tier: "pro", features: ["pro"], state: "offline", lastVerifiedAt: now, message: "Offline cached" }
  }
  if (licenseKey?.startsWith("pro_expired_")) {
    return {
      tier: "pro",
      features: ["pro"],
      state: "expired",
      lastVerifiedAt: now,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      message: "Expired",
    }
  }
  if (licenseKey?.startsWith("pro_")) {
    return { tier: "pro", features: ["pro"], state: "valid", lastVerifiedAt: now }
  }
  return { tier: "free", features: [], state: "invalid", lastVerifiedAt: now, message: "Invalid key" }
}


