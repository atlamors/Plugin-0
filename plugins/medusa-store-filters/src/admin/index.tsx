import { defineDashboardConfig } from "@medusajs/admin-sdk"

const featureEnabled = process.env.FEATURE_STORE_FILTERS !== "false"

export default defineDashboardConfig({
  widgets: featureEnabled
    ? [
        {
          component: () => import("./widgets/product-filters"),
        },
      ]
    : [],
})