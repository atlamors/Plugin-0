import type { Plugin0Options } from "../config"
import type { LicenseStatus } from "../modules/licensing/stub"
import { LicenseFileRepository } from "../modules/licensing/file-repo"
import { LicenseDbRepository } from "../modules/licensing/db-repo"

let optionsRef: Plugin0Options | undefined
let licenseKeyRef: string | undefined
let licenseStatusRef: LicenseStatus | undefined
const licenseFileRepo = new LicenseFileRepository()
const licenseDbRepo = new LicenseDbRepository()

export function setOptions(opts: Plugin0Options) {
  optionsRef = opts
}

export function getOptions(): Plugin0Options | undefined {
  return optionsRef
}

export function setLicense(key: string | undefined, status: LicenseStatus | undefined) {
  licenseKeyRef = key
  licenseStatusRef = status
  try {
    licenseDbRepo.write({ key, status })
  } catch {}
  try {
    licenseFileRepo.write({ key, status })
  } catch {}
}

export async function getLicense(): Promise<{ key?: string; status?: LicenseStatus }> {
  if (!licenseKeyRef && !licenseStatusRef) {
    const persisted = (await licenseDbRepo.read()) ?? licenseFileRepo.read()
    if (persisted) {
      licenseKeyRef = persisted.key
      licenseStatusRef = persisted.status
    }
  }
  return { key: licenseKeyRef, status: licenseStatusRef }
}


