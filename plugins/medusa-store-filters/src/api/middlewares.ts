import { defineMiddlewares } from "@medusajs/framework/http"
import { createCorrelationLogger } from "./middlewares/correlationLogger"

export default defineMiddlewares({
    routes: [
        { matcher: "/admin/store-filters*", middlewares: [createCorrelationLogger("admin")] },
        { matcher: "/store/store-filters*", middlewares: [createCorrelationLogger("store")] },
    ],
})


