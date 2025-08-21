import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        http: {
            storeCors: process.env.STORE_CORS!,
            adminCors: process.env.ADMIN_CORS!,
            authCors: process.env.AUTH_CORS!,
            jwtSecret: process.env.JWT_SECRET || "supersecret",
            cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        }
    },
    plugins: [
        {
            resolve: "@atla/medusa-store-filters",
            options: {
                licenseKey: process.env.STORE_FILTERS_LICENSE_KEY,
                proFeatures: true
            }
        },
        {
            resolve: "@atla/plugin-0",
            options: {
                licenseKey: process.env.PLUGIN_0_LICENSE_KEY,
                proFeatures: true
            }
        }
    ]
})
