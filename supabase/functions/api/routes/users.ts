import { createSupabaseClient, requireUser, getBearerToken } from "../lib/auth.ts";
import { jsonResponse } from "../lib/http.ts";
import type { RouteContext } from "../lib/types.ts";

export async function handleUsers(ctx: RouteContext): Promise<Response | null> {
	if (ctx.segments[0] !== "users") {
		return null;
	}

	if (ctx.segments[1] === "search" && ctx.request.method === "GET") {
		const token = getBearerToken(ctx.request) || undefined;
		const client = createSupabaseClient(token);
		const query = ctx.url.searchParams.get("q") || "";
		const { data, error } = await client
			.from("users")
			.select("id, username")
			.ilike("username", `%${query}%`)
			.order("username", { ascending: true })
			.limit(10);
		if (error) {
			throw { status: 400, message: error.message };
		}
		return jsonResponse({ success: true, data: data || [] }, 200, ctx.corsHeaders);
	}

	if (ctx.segments[1] === "follow" && ctx.request.method === "POST") {
		const { client, user } = await requireUser(ctx.request);
		const username = ctx.url.searchParams.get("username") || "";
		if (!username) {
			throw { status: 400, message: "Username is required" };
		}

		const { data: targetUser, error: targetError } = await client
			.from("users")
			.select("id, username")
			.eq("username", username)
			.single();
		if (targetError) {
			return jsonResponse(
				{
					success: false,
					message: "User not found",
					detail: "User not found",
				},
				404,
				ctx.corsHeaders,
			);
		}
		if (targetUser.id === user.id) {
			return jsonResponse(
				{
					success: false,
					message: "Cannot follow yourself",
					detail: "Cannot follow yourself",
				},
				400,
				ctx.corsHeaders,
			);
		}

		const { data: existingFollow, error: existingError } = await client
			.from("follows")
			.select("id")
			.eq("follower_id", user.id)
			.eq("following_id", targetUser.id);
		if (existingError) {
			throw { status: 400, message: existingError.message };
		}
		if ((existingFollow || []).length === 0) {
			const { error: insertError } = await client.from("follows").insert({
				follower_id: user.id,
				following_id: targetUser.id,
			});
			if (insertError) {
				throw { status: 400, message: insertError.message };
			}
		}

		return jsonResponse(
			{ success: true, message: `Now following ${username}` },
			200,
			ctx.corsHeaders,
		);
	}

	return null;
}
