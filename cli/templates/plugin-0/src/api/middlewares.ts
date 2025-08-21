import { defineMiddlewares } from "@medusajs/framework/http"
import { createCorrelationLogger } from "./middlewares/correlationLogger"

export default defineMiddlewares({
    routes: [
        { matcher: "/admin/plugin-0*", middlewares: [createCorrelationLogger("admin")] },
        { matcher: "/store/plugin-0*", middlewares: [createCorrelationLogger("store")] },
    ],
})


