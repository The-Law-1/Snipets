import { createSupabaseClient, requireUser, getBearerToken } from "./lib/auth.ts";
import { getCorsHeaders, jsonResponse } from "./lib/http.ts";

Deno.serve(async (request) => {
	const corsHeaders = getCorsHeaders(request);

	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	const url = new URL(request.url);

	try {
		// GET /search - Search users by username
		if (request.method === "GET") {
			const token = getBearerToken(request) || undefined;
			const client = createSupabaseClient(token);
			const query = url.searchParams.get("q") || "";
			const { data, error } = await client
				.from("users")
				.select("id, username")
				.ilike("username", `%${query}%`)
				.order("username", { ascending: true })
				.limit(10);
			if (error) {
				throw { status: 400, message: error.message };
			}
			return jsonResponse({ success: true, data: data || [] }, 200, corsHeaders);
		}

		// POST /follow - Follow a user by username
		if (request.method === "POST") {
			const { client, user } = await requireUser(request);
			const username = url.searchParams.get("username") || "";
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
					corsHeaders,
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
					corsHeaders,
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
