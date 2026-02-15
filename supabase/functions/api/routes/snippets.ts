import { requireUser } from "../lib/auth.ts";
import { jsonResponse, parseJson } from "../lib/http.ts";
import type { RouteContext } from "../lib/types.ts";

export async function handleSnippets(ctx: RouteContext): Promise<Response | null> {
	if (ctx.segments[0] !== "snippets") {
		return null;
	}

	if (ctx.request.method === "GET" && ctx.segments.length === 1) {
		const { client, user } = await requireUser(ctx.request);
		const title = ctx.url.searchParams.get("title") || "";
		let query = client
			.from("snippets")
			.select("id, text, title, url, created_at, user_id")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(50);
		if (title) {
			query = query.ilike("title", `%${title}%`);
		}
		const { data, error } = await query;
		console.log("Fetched snippets:", { data, error });
		if (error) {
			throw { status: 400, message: error.message };
		}
		return jsonResponse({ success: true, data: data || [] }, 200, ctx.corsHeaders);
	}

	if (ctx.request.method === "POST" && ctx.segments.length === 1) {
		const { client, user } = await requireUser(ctx.request);
		const body = await parseJson<{ text?: string; title?: string; url?: string }>(ctx.request);
		if (!body.text || !body.title) {
			throw { status: 400, message: "Missing text or title" };
		}
		const { data, error } = await client
			.from("snippets")
			.insert({
				text: body.text,
				title: body.title,
				url: body.url || null,
				user_id: user.id,
			})
			.select("id, text, title, url, created_at, user_id")
			.single();
		if (error) {
			throw { status: 400, message: error.message };
		}
		return jsonResponse({ success: true, data }, 200, ctx.corsHeaders);
	}

	if (ctx.request.method === "DELETE" && ctx.segments.length === 2) {
		const { client, user } = await requireUser(ctx.request);
		const snippetId = decodeURIComponent(ctx.segments[1]);
		const { data, error } = await client
			.from("snippets")
			.delete()
			.eq("id", snippetId)
			.eq("user_id", user.id)
			.select("id");
		if (error) {
			throw { status: 400, message: error.message };
		}
		return jsonResponse(
			{ success: true, deleted: (data || []).length > 0 },
			200,
			ctx.corsHeaders,
		);
	}

	return null;
}
