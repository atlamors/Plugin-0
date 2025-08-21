import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"

const sections = [
    {
        group: "Medusa (Core)",
        items: [
            {
                title: "Admin UI Routes",
                quick: "Create a page at src/admin/routes/<route>/page.tsx (arrow function default export).",
                doc: "https://docs.medusajs.com/learn/fundamentals/admin/ui-routes",
            },
            {
                title: "API Routes",
                quick: "Add endpoints under src/api/{admin|store}/.../route.ts.",
                doc: "https://docs.medusajs.com/learn/fundamentals/framework/api-routes",
            },
            {
                title: "Jobs",
                quick: "Implement scheduled jobs under src/jobs and register as needed.",
                doc: "https://docs.medusajs.com/learn/fundamentals/framework/scheduled-jobs",
            },
            {
                title: "Links",
                quick: "Define module links to relate models across modules.",
                doc: "https://docs.medusajs.com/learn/fundamentals/framework/module-links",
            },
            {
                title: "Modules",
                quick: "Create modules under src/modules with services, loaders, entities.",
                doc: "https://docs.medusajs.com/learn/fundamentals/framework/modules",
            },
            {
                title: "Providers",
                quick: "Expose module providers and register them in app config.",
                doc: "https://docs.medusajs.com/learn/fundamentals/plugins/create#create-module-providers",
            },
            {
                title: "Subscribers",
                quick: "Listen to events under src/subscribers and handle async work.",
                doc: "https://docs.medusajs.com/learn/fundamentals/framework/events",
            },
            {
                title: "Workflows",
                quick: "Compose logic with steps and hooks under src/workflows.",
                doc: "https://docs.medusajs.com/learn/fundamentals/framework/workflows",
            },
        ],
    },
    {
        group: "Plugin 0 Utilities",
        items: [
            {
                title: "Licensing",
                quick: "Use the licensing stubs and routes; wire to your billing backend.",
                doc: "https://docs.medusajs.com/learn/fundamentals/plugins/create",
            },
            {
                title: "Middleware",
                quick: "Add middlewares to routes for auth, rate limits, guards.",
                doc: "https://docs.medusajs.com/learn/fundamentals/framework/api-routes#middlewares",
            },
            {
                title: "Observability",
                quick: "Use logger and telemetry stubs; see logging guidance.",
                doc: "https://docs.medusajs.com/learn/debugging-and-testing/logging",
            },
        ],
    },
]

const LinkList = ({ items }: { items: { title: string; quick: string; doc: string }[] }) => (
    <div className="grid gap-3">
        {items.map((it) => (
            <div key={it.title} className="rounded-md border border-ui-border-base p-4">
                <Heading level="h3" className="mb-1">{it.title}</Heading>
                <Text className="text-ui-fg-subtle mb-2">{it.quick}</Text>
                <a href={it.doc} target="_blank" rel="noreferrer" className="text-ui-fg-interactive">
                    Read the docs
                </a>
            </div>
        ))}
    </div>
)

const Plugin0DocsPage = () => {
    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Plugin 0 • Documentation</Heading>
            </div>
            <div className="grid gap-8 p-6">
                {sections.map((sec) => (
                    <section key={sec.group} className="grid gap-3">
                        <Heading level="h3">{sec.group}</Heading>
                        <LinkList items={sec.items} />
                    </section>
                ))}
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Documentation",
})

export default Plugin0DocsPage


