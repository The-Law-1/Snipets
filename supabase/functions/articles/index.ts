import { requireUser } from "./lib/auth.ts";
import { getCorsHeaders, jsonResponse } from "./lib/http.ts";

Deno.serve(async (request) => {
	const corsHeaders = getCorsHeaders(request);

	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	const url = new URL(request.url);

	try {
		// GET /articles - Group snippets by title and URL
		if (request.method === "GET") {
			const { client, user } = await requireUser(request);
			const title = url.searchParams.get("title") || "";
			let query = client
				.from("snippets")
				.select("title, url")
				.eq("user_id", user.id);
			if (title) {
				query = query.ilike("title", `%${title}%`);
			}
			const { data, error } = await query;
			if (error) {
				throw { status: 400, message: error.message };
			}
			const grouped = new Map<string, { title: string; url: string; snippet_count: number }>();
			for (const row of data || []) {
				const rowTitle = row.title ?? "";
				const rowUrl = row.url ?? "";
				const key = `${rowTitle}|||${rowUrl}`;
				const existing = grouped.get(key);
				if (existing) {
					existing.snippet_count += 1;
				} else {
					grouped.set(key, {
						title: rowTitle,
						url: rowUrl,
						snippet_count: 1,
					});
				}
			}
			const normalized = Array.from(grouped.values());
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
