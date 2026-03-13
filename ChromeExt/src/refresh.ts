const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

type StoredAuth = {
	auth_token?: string;
	refresh_token?: string;
	expires_at?: number | string;
};

const SESSION_KEYS = ["auth_token", "refresh_token", "expires_at"] as const;
const LEGACY_CREDENTIAL_KEYS = ["auth_email", "auth_password"] as const;

function parseExpiresAt(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

async function clearStoredAuth(): Promise<void> {
	await chrome.storage.session.remove([...SESSION_KEYS, ...LEGACY_CREDENTIAL_KEYS]);
}

export async function getValidAuthToken(): Promise<string | undefined> {
	const session = (await chrome.storage.session.get([
		"auth_token",
		"refresh_token",
		"expires_at",
	])) as StoredAuth;

	const accessToken = session.auth_token;
	const refreshToken = session.refresh_token;
	const expiresAt = parseExpiresAt(session.expires_at);

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
			refresh_token: nextRefreshToken,
		};
		if (nextExpiresAt !== null) {
			payload.expires_at = nextExpiresAt;
		}

		await chrome.storage.session.set(payload);

		return nextAccessToken;
	} catch {
		await clearStoredAuth();
		return undefined;
	}
}
