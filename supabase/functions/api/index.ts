import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./lib/env.ts";
import { getCorsHeaders, jsonResponse } from "./lib/http.ts";
import { normalizeRoute } from "./lib/routes.ts";
import type { RouteHandler } from "./lib/types.ts";
import { handleRoot } from "./routes/root.ts";
import { handleSnippets } from "./routes/snippets.ts";
import { handleArticles } from "./routes/articles.ts";
import { handleAuthProfile } from "./routes/auth.ts";
import { handleUsers } from "./routes/users.ts";
import { handleFeed } from "./routes/feed.ts";

const handlers: RouteHandler[] = [
	handleRoot,
	handleSnippets,
	handleArticles,
	handleAuthProfile,
	handleUsers,
	handleFeed,
];

Deno.serve(async (request) => {
	const corsHeaders = getCorsHeaders(request);

	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		return jsonResponse(
			{
				success: false,
				message: "Supabase env not configured",
				detail: "SUPABASE_URL and SUPABASE_ANON_KEY are required",
			},
			500,
			corsHeaders,
		);
	}

	const url = new URL(request.url);
	const route = normalizeRoute(url.pathname);
	const segments = route.split("/").filter(Boolean);

	try {
		const ctx = { request, url, route, segments, corsHeaders };
		for (const handler of handlers) {
			const response = await handler(ctx);
			if (response) {
				return response;
			}
		}

		return jsonResponse(
			{ success: false, message: "Not found", detail: "Not found" },
			404,
			corsHeaders,
		);
	} catch (error) {
		const status = typeof error?.status === "number" ? error.status : 500;
		const message = error?.message || "Unexpected error";
		return jsonResponse(
			{ success: false, message, detail: message },
			status,
			corsHeaders,
		);
	}
}, {
	port: 6789,
});
