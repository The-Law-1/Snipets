import { requireUser } from "./lib/auth.ts";
import { getCorsHeaders, jsonResponse } from "./lib/http.ts";

Deno.serve(async (request) => {
	const corsHeaders = getCorsHeaders(request);

	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	try {
		// GET /feed - Get snippets from followed users
		if (request.method === "GET") {
			const { client, user } = await requireUser(request);
			const { data: follows, error: followsError } = await client
				.from("follows")
				.select("following_id")
				.eq("follower_id", user.id);
			if (followsError) {
				throw { status: 400, message: followsError.message };
			}
			const followingIds = (follows || []).map((row) => row.following_id);
			if (followingIds.length === 0) {
				return jsonResponse({ success: true, data: [] }, 200, corsHeaders);
			}

			const { data: snippets, error: snippetsError } = await client
				.from("snippets")
				.select("id, text, title, url, created_at, user_id, users(username)")
				.in("user_id", followingIds)
				.order("created_at", { ascending: false })
				.limit(50);
			if (snippetsError) {
				throw { status: 400, message: snippetsError.message };
			}

			const items = (snippets || []).map((snippet) => ({
				snippet: {
					id: snippet.id,
					text: snippet.text,
					title: snippet.title,
					url: snippet.url,
					created_at: snippet.created_at,
					username: snippet.users?.username || "",
				},
			}));

			return jsonResponse({ success: true, data: items }, 200, corsHeaders);
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
