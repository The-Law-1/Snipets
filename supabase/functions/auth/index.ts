import { requireUser } from "./lib/auth.ts";
import { getCorsHeaders, jsonResponse, parseJson } from "./lib/http.ts";

Deno.serve(async (request) => {
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
		// POST /profile - Create user profile
		if (request.method === "POST") {
			const { client, user } = await requireUser(request);
			const body = await parseJson<{ username?: string }>(request);
			const username = body.username?.trim();
			if (!username) {
				throw { status: 400, message: "Username is required" };
			}

			const [existingUsername, existingProfile] = await Promise.all([
				client.from("users").select("id").eq("username", username),
				client.from("users").select("id").eq("id", user.id),
			]);

			if (existingUsername.error) {
				throw { status: 400, message: existingUsername.error.message };
			}
			if ((existingUsername.data || []).length > 0) {
				return jsonResponse(
					{
						success: false,
						message: "Username already taken",
						detail: "Username already taken",
					},
					409,
					corsHeaders,
				);
			}
			if (existingProfile.error) {
				throw { status: 400, message: existingProfile.error.message };
			}
			if ((existingProfile.data || []).length > 0) {
				return jsonResponse(
					{
						success: false,
						message: "Profile already exists",
						detail: "Profile already exists",
					},
					409,
					corsHeaders,
				);
			}

			const { data, error } = await client
				.from("users")
				.insert({ id: user.id, username })
				.select("id, username")
				.single();
			if (error) {
				throw { status: 400, message: error.message };
			}

			return jsonResponse({ success: true, user: data }, 200, corsHeaders);
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
