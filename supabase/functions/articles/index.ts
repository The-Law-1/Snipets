import { requireUser } from "./lib/auth.ts";
import { getCorsHeaders, jsonResponse } from "./lib/http.ts";

Deno.serve(async (request) => {
	const corsHeaders = getCorsHeaders(request);

	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	const url = new URL(request.url);

	try {
		// GET /articles - List articles with snippet count
		if (request.method === "GET") {
			const { client, user } = await requireUser(request);
			const title = url.searchParams.get("title") || "";
			let query = client
				.from("snippets")
				.select("title, url, snippet_count:count(id)")
				.eq("user_id", user.id);
			if (title) {
				query = query.ilike("title", `%${title}%`);
			}
			const { data, error } = await query;
			if (error) {
				throw { status: 400, message: error.message };
			}
			const normalized = (data || []).map((row) => ({
				title: row.title,
				url: row.url,
				snippet_count: typeof row.snippet_count === "number" ? row.snippet_count : Number(row.snippet_count || 0),
			}));
			normalized.sort((a, b) => b.snippet_count - a.snippet_count);
			return jsonResponse({ success: true, data: normalized }, 200, corsHeaders);
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
});
