import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { Beaker } from "@medusajs/icons"

const Plugin0Page = () => {
    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Plugin 0 • Boilerplate Plugin Lab</Heading>
            </div>
            <div className="grid gap-8 p-6">
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Plugin 0",
    icon: Beaker,
})

export default Plugin0Page


