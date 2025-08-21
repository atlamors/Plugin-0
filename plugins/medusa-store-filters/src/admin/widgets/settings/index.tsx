import React, { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Label, Input, Button } from "@medusajs/ui"

type Settings = {
    general?: { enabled?: boolean }
}

export default function StoreFiltersSettingsWidget() {
    const [settings, setSettings] = useState<Settings>({})
    const [licenseKey, setLicenseKey] = useState<string>("")
    const [status, setStatus] = useState<string>("")

    useEffect(() => {
        fetch("/admin/store-filters/settings")
            .then((r) => r.json())
            .then((d) => setSettings(d))
            .catch(() => { })
    }, [])

    const save = async () => {
        await fetch("/admin/store-filters/settings", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(settings),
        })
    }

    const applyLicense = async () => {
        const r = await fetch("/admin/store-filters/license", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ licenseKey }),
        })
        const data = await r.json()
        setStatus(data?.status?.state || "")
    }

    return (
        <Container className="grid gap-4 p-0">
            <div className="px-6 py-4">
                <Heading level="h2">Store Filters Settings</Heading>
                <Text className="text-ui-fg-subtle">Quick controls and diagnostics</Text>
            </div>

            <div className="grid gap-3 px-6 pb-4">
                <Heading level="h3">General</Heading>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={!!settings.general?.enabled}
                        onChange={(e) => setSettings({ ...settings, general: { enabled: e.target.checked } })}
                    />
                    <Text>Enabled</Text>
                </label>
                <div>
                    <Button variant="secondary" size="small" onClick={save}>Save</Button>
                </div>
            </div>

            <div className="grid gap-3 px-6 pb-4">
                <Heading level="h3">License</Heading>
                <div className="grid gap-2">
                    <Label htmlFor="licenseKey">License Key</Label>
                    <Input id="licenseKey" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="Enter license key" />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="small" onClick={applyLicense}>Apply</Button>
                    {status && <Text className="text-ui-fg-subtle">Status: {status}</Text>}
                </div>
            </div>

            <div className="grid gap-3 px-6 pb-6">
                <Heading level="h3">Help</Heading>
                <ul className="list-disc pl-6">
                    <li>
                        <code>/admin/store-filters/health</code>
                    </li>
                    <li>
                        <code>/store/store-filters/health</code>
                    </li>
                </ul>
            </div>
        </Container>
    )
}

// Register this widget into a base Admin zone
export const config = defineWidgetConfig({
    zone: "store.details.before"
})



