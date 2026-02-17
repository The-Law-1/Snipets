function byId<T extends HTMLElement = HTMLElement>(id: string): T {
	const el = document.getElementById(id);
	if (!el) throw new Error(`Missing element: #${id}`);
	return el as T;
}

const emailInput = byId<HTMLInputElement>("email");
const passwordInput = byId<HTMLInputElement>("password");
const signInButton = byId<HTMLButtonElement>("signIn");
const statusSpan = byId<HTMLSpanElement>("status");
const authSection = byId<HTMLDivElement>("authSection");

const SUPABASE_URL = "https://lsnbxwsivlwbpdxjhyma.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_-aycBC_FDZAmZFwt-a0uJw_nfOd5Tdb"
const EDGE_URL = "https://lsnbxwsivlwbpdxjhyma.supabase.co/functions/v1";

// Sign in to Supabase and store JWT
signInButton.addEventListener("click", async () => {
	const email = emailInput.value.trim();
	const password = passwordInput.value.trim();

	if (!email || !password) {
		statusSpan.textContent = "Please enter email and password";
		return;
	}

	signInButton.disabled = true;
	statusSpan.textContent = "Signing in...";

	try {
		// For now, we'll use the API to get auth token via the web frontend
		// In production, you'd use Supabase Auth directly or get token from web session
		const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
			method: "POST",
			headers: { 
				"Content-Type": "application/json",
				apikey: SUPABASE_ANON_KEY,

			},
			body: JSON.stringify({ email, password }),
		});

		if (!response.ok) {
			throw new Error("Sign in failed");
		}

		const data = await response.json();
		const token = data.access_token;

		chrome.storage.sync.set(
			{ apiKey: token, endpoint: EDGE_URL },
			() => {
				statusSpan.textContent = "Signed in successfully! Select some text then right-click to save it.";
				//authSection.style.display = "none";
				//setTimeout(() => (statusSpan.textContent = ""), 2000);
			}
		);
	} catch (err: any) {
		statusSpan.textContent = `Sign in failed: ${err.message}`;
	} finally {
		signInButton.disabled = false;
	}
});