import { requireUser } from "../lib/auth.ts";
import { jsonResponse, parseJson } from "../lib/http.ts";
import type { RouteContext } from "../lib/types.ts";

export async function handleAuthProfile(ctx: RouteContext): Promise<Response | null> {
	if (ctx.segments[0] !== "auth" || ctx.segments[1] !== "profile" || ctx.request.method !== "POST") {
		return null;
	}

	const { client, user } = await requireUser(ctx.request);
	const body = await parseJson<{ username?: string }>(ctx.request);
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
			ctx.corsHeaders,
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
			ctx.corsHeaders,
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

	return jsonResponse({ success: true, user: data }, 200, ctx.corsHeaders);
}
