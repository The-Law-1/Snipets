const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

type StoredAuth = {
	auth_token?: string;
	apiKey?: string;
	refresh_token?: string;
	expires_at?: number | string;
};

function parseExpiresAt(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

async function clearStoredAuth(): Promise<void> {
	await chrome.storage.local.remove(["auth_token", "apiKey", "refresh_token", "expires_at"]);
	await chrome.storage.sync.remove(["apiKey"]);
}

export async function getValidAuthToken(): Promise<string | undefined> {
	const local = (await chrome.storage.local.get([
		"auth_token",
		"apiKey",
		"refresh_token",
		"expires_at",
	])) as StoredAuth;

	let accessToken = local.auth_token || local.apiKey;
	let refreshToken = local.refresh_token;
	let expiresAt = parseExpiresAt(local.expires_at);

	if (!accessToken) {
		const sync = (await chrome.storage.sync.get(["apiKey"])) as StoredAuth;
		if (sync.apiKey) {
			accessToken = sync.apiKey;
			await chrome.storage.local.set({ auth_token: sync.apiKey, apiKey: sync.apiKey });
		}
	}

	if (!accessToken) return undefined;

	const now = Math.floor(Date.now() / 1000);
	if (!expiresAt || expiresAt > now) {
        console.log("[WEB EXTENSION] Access token is valid, no need to refresh.");
		return accessToken;
	}

	if (!refreshToken) {
		await clearStoredAuth();
		return undefined;
	}

	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		return undefined;
	}

	try {
		const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				apikey: SUPABASE_ANON_KEY,
			},
			body: JSON.stringify({ refresh_token: refreshToken }),
		});

		if (!response.ok) {
			await clearStoredAuth();
			return undefined;
		}

        console.log("Successfully refreshed token from extension!");

		const data = await response.json();
		const nextAccessToken = data.access_token as string | undefined;
		const nextRefreshToken = (data.refresh_token as string | undefined) || refreshToken;
		const nextExpiresAt =
			typeof data.expires_at === "number"
				? data.expires_at
				: typeof data.expires_in === "number"
					? now + data.expires_in
					: null;

		if (!nextAccessToken) {
			await clearStoredAuth();
			return undefined;
		}

		const payload: Record<string, string | number> = {
			auth_token: nextAccessToken,
			apiKey: nextAccessToken,
			refresh_token: nextRefreshToken,
		};
		if (nextExpiresAt !== null) {
			payload.expires_at = nextExpiresAt;
		}

		await chrome.storage.local.set(payload);
		await chrome.storage.sync.set({ apiKey: nextAccessToken });

		return nextAccessToken;
	} catch {
		await clearStoredAuth();
		return undefined;
	}
}
