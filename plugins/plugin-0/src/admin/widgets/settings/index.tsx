import React, { useEffect, useState } from "react"

type Settings = {
  general?: { enabled?: boolean }
}

export default function Plugin0SettingsWidget() {
  const [settings, setSettings] = useState<Settings>({})
  const [licenseKey, setLicenseKey] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  useEffect(() => {
    fetch("/admin/plugin-0/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => {})
  }, [])

  const save = async () => {
    await fetch("/admin/plugin-0/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    })
  }

  const applyLicense = async () => {
    const r = await fetch("/admin/plugin-0/license", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ licenseKey }),
    })
    const data = await r.json()
    setStatus(data?.status?.state || "")
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <h3>General</h3>
        <label>
          <input
            type="checkbox"
            checked={!!settings.general?.enabled}
            onChange={(e) => setSettings({ ...settings, general: { enabled: e.target.checked } })}
          />
          Enabled
        </label>
        <div>
          <button onClick={save}>Save</button>
        </div>
      </div>

      <div>
        <h3>License</h3>
        <input value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="Enter license key" />
        <button onClick={applyLicense}>Apply</button>
        {status && <p>Status: {status}</p>}
      </div>

      <div>
        <h3>Help</h3>
        <ul>
          <li>
            Admin health: <code>/admin/plugin-0/health</code>
          </li>
          <li>
            Store health: <code>/store/plugin-0/health</code>
          </li>
        </ul>
      </div>
    </div>
  )
}



