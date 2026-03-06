import { createSupabaseClient, requireUser, getBearerToken } from "./lib/auth.ts";
import { getCorsHeaders, jsonResponse } from "./lib/http.ts";

Deno.serve(async (request: Request) => {
	let corsHeaders: HeadersInit = {};
	try {
		corsHeaders = getCorsHeaders(request);
	} catch (error) {
		return new Response("CORS error", { status: 403 });
	}

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

			let currentUserId: string | null = null;
			if (token) {
				const { data: userData, error: userError } = await client.auth.getUser(token);
				if (!userError && userData?.user) {
					currentUserId = userData.user.id;
				}
			}

			let usersQuery = client
				.from("users")
				.select("id, username")
				.ilike("username", `%${query}%`)
				.order("username", { ascending: true })
				.limit(10);

			if (currentUserId) {
				usersQuery = usersQuery.neq("id", currentUserId);
			}

			const { data, error } = await usersQuery;
			if (error) {
				throw { status: 400, message: error.message };
			}

			const users = data || [];
			let followedIds = new Set<string>();

			if (currentUserId && users.length > 0) {
				const userIds = users.map((user: { id: string; username: string }) => user.id);
				const { data: follows, error: followsError } = await client
					.from("follows")
					.select("following_id")
					.eq("follower_id", currentUserId)
					.in("following_id", userIds);

				if (followsError) {
					throw { status: 400, message: followsError.message };
				}

				followedIds = new Set(
					(follows || []).map((follow: { following_id: string }) => follow.following_id),
				);
			}

			const enrichedUsers = users.map((user: { id: string; username: string }) => ({
				...user,
				is_following: followedIds.has(user.id),
			}));

			return jsonResponse({ success: true, data: enrichedUsers }, 200, corsHeaders);
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

		// DELETE /follow - Unfollow a user by username
		if (request.method === "DELETE") {
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

			const { data: deletedRows, error: deleteError } = await client
				.from("follows")
				.delete()
				.eq("follower_id", user.id)
				.eq("following_id", targetUser.id)
				.select("id");

			if (deleteError) {
				throw { status: 400, message: deleteError.message };
			}

			const deletedCount = deletedRows?.length || 0;
			if (deletedCount === 0) {
				return jsonResponse(
					{
						success: false,
						message: "Unfollow had no effect",
						detail:
							"No follow row was deleted. This usually means no matching row exists or RLS prevented deletion.",
					},
					409,
					corsHeaders,
				);
			}

			return jsonResponse(
				{ success: true, message: `Unfollowed ${username}`, deleted_count: deletedCount },
				200,
				corsHeaders,
			);
		}

		return jsonResponse(
			{ success: false, message: "Not found", detail: "Not found" },
			404,
			corsHeaders,
		);
	} catch (error: unknown) {
		const status =
			typeof error === "object" && error !== null && "status" in error
				? Number((error as { status: number }).status)
				: 500;
		const message =
			typeof error === "object" && error !== null && "message" in error
				? String((error as { message: string }).message)
				: "Unexpected error";
		return jsonResponse(
			{ success: false, message, detail: message },
			status,
			corsHeaders,
		);
	}
});
