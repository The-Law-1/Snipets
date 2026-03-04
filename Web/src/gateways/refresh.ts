const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function clearAuthStorage() {
	localStorage.removeItem("auth_token");
	localStorage.removeItem("refresh_token");
	localStorage.removeItem("expires_at");
}

function readExpiresAt(): number | null {
	const raw = localStorage.getItem("expires_at");
	if (!raw) return null;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return null;
	return parsed;
}

export async function refreshAccessToken(): Promise<string | null> {
	const refreshToken = localStorage.getItem("refresh_token");
	if (!refreshToken) {
		clearAuthStorage();
		return null;
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
			clearAuthStorage();
			return null;
		}

		console.log("Token refreshed successfully from web app!");

		const data = await response.json();
		const accessToken: string | undefined = data.access_token;
		if (!accessToken) {
			clearAuthStorage();
			return null;
		}

		const refreshTokenValue: string | undefined = data.refresh_token;
		const expiresAtValue: number | undefined = data.expires_at;
		const expiresInValue: number | undefined = data.expires_in;

		localStorage.setItem("auth_token", accessToken);
		if (refreshTokenValue) {
			localStorage.setItem("refresh_token", refreshTokenValue);
		}

		const nextExpiresAt =
			typeof expiresAtValue === "number"
				? expiresAtValue
				: typeof expiresInValue === "number"
					? Math.floor(Date.now() / 1000) + expiresInValue
					: null;

		if (nextExpiresAt !== null) {
			localStorage.setItem("expires_at", String(nextExpiresAt));
		}

		return accessToken;
	} catch {
		clearAuthStorage();
		return null;
	}
}

export async function getValidAccessToken(token?: string): Promise<string | null> {
	const now = Math.floor(Date.now() / 1000);
	const expiresAt = readExpiresAt();

	if (expiresAt !== null && expiresAt <= now) {
		console.log("[WEB APP] Access token expired, attempting to refresh...");
		return await refreshAccessToken();
	} else {
		console.log("[WEB APP] Access token is valid, no need to refresh.");
	}

	return token || localStorage.getItem("auth_token");
}