function byId<T extends HTMLElement = HTMLElement>(id: string): T {
	const el = document.getElementById(id);
	if (!el) throw new Error(`Missing element: #${id}`);
	return el as T;
}

const endpointInput = byId<HTMLInputElement>("endpoint");
const emailInput = byId<HTMLInputElement>("email");
const passwordInput = byId<HTMLInputElement>("password");
const signInButton = byId<HTMLButtonElement>("signIn");
const saveButton = byId<HTMLButtonElement>("save");
const statusSpan = byId<HTMLSpanElement>("status");
const authSection = byId<HTMLDivElement>("authSection");
const settingsSection = byId<HTMLDivElement>("settingsSection");

// Load saved settings into the form
chrome.storage.sync.get(["endpoint", "apiKey"], (items) => {
	endpointInput.value = items.endpoint || "";
	if (items.apiKey) {
		authSection.style.display = "none";
		settingsSection.style.display = "block";
	}
});

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
		const response = await fetch("http://localhost:3000/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		if (!response.ok) {
			throw new Error("Sign in failed");
		}

		const data = await response.json();
		const token = data.access_token;

		chrome.storage.sync.set(
			{ apiKey: token, endpoint: "http://localhost:54321/functions/v1/api" },
			() => {
				statusSpan.textContent = "Signed in successfully!";
				authSection.style.display = "none";
				settingsSection.style.display = "block";
				setTimeout(() => (statusSpan.textContent = ""), 2000);
			}
		);
	} catch (err: any) {
		statusSpan.textContent = `Sign in failed: ${err.message}`;
	} finally {
		signInButton.disabled = false;
	}
});

saveButton.addEventListener("click", () => {
	const endpoint = endpointInput.value.trim();
	chrome.storage.sync.set({ endpoint }, () => {
		statusSpan.textContent = "Saved.";
		setTimeout(() => (statusSpan.textContent = ""), 1500);
	});
});
