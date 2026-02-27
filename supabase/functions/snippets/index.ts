import { requireUser } from "./lib/auth.ts";
import { getCorsHeaders, jsonResponse, parseJson } from "./lib/http.ts";

Deno.serve(async (request) => {
	const corsHeaders = getCorsHeaders(request);

	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	const url = new URL(request.url);
	const segments = url.pathname.split("/").filter(Boolean);

	try {
		// GET /snippets - List snippets with optional title search
		if (request.method === "GET") {
			const { client, user } = await requireUser(request);
			const title = url.searchParams.get("title") || "";
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
			if (error) {
				throw { status: 400, message: error.message };
			}
			return jsonResponse({ success: true, data: data || [] }, 200, corsHeaders);
		}

		// POST /snippets - Create new snippet
		if (request.method === "POST") {
			const { client, user } = await requireUser(request);
			const body = await parseJson<{ text?: string; title?: string; url?: string }>(request);
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
			return jsonResponse({ success: true, data }, 200, corsHeaders);
		}

		// DELETE /snippets/:id - Delete snippet
		if (request.method === "DELETE") {
			const { client, user } = await requireUser(request);
			const snippetId = decodeURIComponent(segments[0]);
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
				corsHeaders,
			);
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
