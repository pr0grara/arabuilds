import { onRequestPost as __api_intake_js_onRequestPost } from "/Users/arabaghdassarian/Desktop/Projects/arabuilds/functions/api/intake.js"
import { onRequestGet as __admin_js_onRequestGet } from "/Users/arabaghdassarian/Desktop/Projects/arabuilds/functions/admin.js"

export const routes = [
    {
      routePath: "/api/intake",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_intake_js_onRequestPost],
    },
  {
      routePath: "/admin",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [__admin_js_onRequestGet],
    },
  ]