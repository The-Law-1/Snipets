import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.ts";

export function getBearerToken(request: Request): string | null {
	const authHeader = request.headers.get("authorization") || "";
	if (!authHeader.toLowerCase().startsWith("bearer ")) {
		return null;
	}
	return authHeader.slice(7).trim();
}

export function createSupabaseClient(token?: string) {
	const headers: Record<string, string> = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		global: { headers },
		auth: { persistSession: false, autoRefreshToken: false },
	});
}

export async function requireUser(request: Request) {
	const token = getBearerToken(request);
	if (!token) {
		throw { status: 401, message: "Missing bearer token" };
	}

	const client = createSupabaseClient(token);
	const { data, error } = await client.auth.getUser(token);
	if (error || !data?.user) {
		throw { status: 401, message: "Invalid token" };
	}

	return { client, user: data.user };
}
