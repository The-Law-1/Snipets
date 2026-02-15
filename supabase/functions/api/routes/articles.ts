import { requireUser } from "../lib/auth.ts";
import { jsonResponse } from "../lib/http.ts";
import type { RouteContext } from "../lib/types.ts";

export async function handleArticles(ctx: RouteContext): Promise<Response | null> {
	if (ctx.segments[0] !== "articles" || ctx.request.method !== "GET") {
		return null;
	}

	const { client, user } = await requireUser(ctx.request);
	const title = ctx.url.searchParams.get("title") || "";
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
	return jsonResponse({ success: true, data: normalized }, 200, ctx.corsHeaders);
}
