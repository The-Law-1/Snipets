import { requireUser } from "../lib/auth.ts";
import { jsonResponse } from "../lib/http.ts";
import type { RouteContext } from "../lib/types.ts";

export async function handleFeed(ctx: RouteContext): Promise<Response | null> {
	if (ctx.segments[0] !== "feed" || ctx.request.method !== "GET") {
		return null;
	}

	const { client, user } = await requireUser(ctx.request);
	const { data: follows, error: followsError } = await client
		.from("follows")
		.select("following_id")
		.eq("follower_id", user.id);
	if (followsError) {
		throw { status: 400, message: followsError.message };
	}
	const followingIds = (follows || []).map((row) => row.following_id);
	if (followingIds.length === 0) {
		return jsonResponse({ success: true, data: [] }, 200, ctx.corsHeaders);
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

	return jsonResponse({ success: true, data: items }, 200, ctx.corsHeaders);
}
