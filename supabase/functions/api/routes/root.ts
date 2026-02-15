import { jsonResponse } from "../lib/http.ts";
import type { RouteContext } from "../lib/types.ts";

export async function handleRoot(ctx: RouteContext): Promise<Response | null> {
	if (ctx.route === "/" && ctx.request.method === "GET") {
		return jsonResponse({ success: true, message: "Snipets edge API" }, 200, ctx.corsHeaders);
	}

	return null;
}
