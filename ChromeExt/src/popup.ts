function byId<T extends HTMLElement = HTMLElement>(id: string): T {
	const el = document.getElementById(id);
	if (!el) throw new Error(`Missing element: #${id}`);
	return el as T;
}

const emailInput = byId<HTMLInputElement>("email");
const passwordInput = byId<HTMLInputElement>("password");
const confirmPasswordInput = byId<HTMLInputElement>("confirmPassword");
const confirmPasswordRow = byId<HTMLDivElement>("confirmPasswordRow");
const signInButton = byId<HTMLButtonElement>("signIn");
const signUpButton = byId<HTMLButtonElement>("signUp");
const modeToggleButton = byId<HTMLButtonElement>("modeToggle");
const statusSpan = byId<HTMLSpanElement>("status");
const authSection = byId<HTMLDivElement>("authSection");
const readySection = byId<HTMLDivElement>("readySection");
const readyMessage = byId<HTMLParagraphElement>("readyMessage");
const webAppLink = byId<HTMLAnchorElement>("webAppLink");
const logoutButton = byId<HTMLButtonElement>("logout");

let isCreateMode = false;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SNIPPETS_WEB_APP_URL = process.env.SNIPPETS_WEB_APP_URL;

const SESSION_KEYS = ["auth_token", "refresh_token", "expires_at", "auth_email", "auth_password"] as const;

type StoredAuth = {
	auth_token?: string;
	refresh_token?: string;
	expires_at?: number;
	auth_email?: string;
	auth_password?: string;
};

function setStatus(message: string, isError = false): void {
	statusSpan.textContent = message;
	statusSpan.classList.toggle("error", isError);
}

function setLoading(loading: boolean): void {
	signInButton.disabled = loading;
	signUpButton.disabled = loading;
	logoutButton.disabled = loading;
	modeToggleButton.disabled = loading;
}

function setCreateMode(enabled: boolean): void {
	isCreateMode = enabled;
	confirmPasswordRow.classList.toggle("hidden", !enabled);
	signInButton.classList.toggle("hidden", enabled);
	signUpButton.classList.toggle("hidden", !enabled);
	modeToggleButton.textContent = enabled
		? "Already have an account? Click here to sign in"
		: "Don't have an account yet? Click here to create one";
	setStatus("");
}

function showAuthUi(): void {
	authSection.classList.remove("hidden");
	readySection.classList.add("hidden");
}

function showReadyUi(email?: string): void {
	authSection.classList.add("hidden");
	readySection.classList.remove("hidden");
	readyMessage.textContent = email
		? `You're all set, ${email}.`
		: "You're all set. Credentials are available in this session.";

	if (SNIPPETS_WEB_APP_URL) {
		webAppLink.href = SNIPPETS_WEB_APP_URL;
		webAppLink.textContent = SNIPPETS_WEB_APP_URL;
	} else {
		webAppLink.href = "#";
		webAppLink.textContent = "SNIPPETS_WEB_APP_URL is not configured";
	}
}

async function clearSessionCredentials(): Promise<void> {
	await chrome.storage.session.remove([...SESSION_KEYS]);
}

async function persistSessionAuth(payload: {
	email: string;
	password: string;
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
}): Promise<void> {
	const data: Record<string, string | number> = {
		auth_email: payload.email,
		auth_password: payload.password,
	};

	if (payload.accessToken) {
		data.auth_token = payload.accessToken;
	}
	if (payload.refreshToken) {
		data.refresh_token = payload.refreshToken;
	}
	if (typeof payload.expiresAt === "number") {
		data.expires_at = payload.expiresAt;
	}

	await chrome.storage.session.set(data);
}

function getExpiresAtFromResponse(data: Record<string, unknown>): number | undefined {
	if (typeof data.expires_at === "number") {
		return data.expires_at;
	}
	if (typeof data.expires_in === "number") {
		return Math.floor(Date.now() / 1000) + data.expires_in;
	}
	return undefined;
}

async function signIn(email: string, password: string): Promise<void> {
	const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			apikey: SUPABASE_ANON_KEY,
		},
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const data = (await response.json().catch(() => ({}))) as Record<string, string>;
		if (response.status === 400) {
			throw new Error(data.error_description || "Invalid credentials");
		}
		throw new Error(data.error_description || "Sign in failed");
	}

	const data = (await response.json()) as Record<string, unknown>;
	await persistSessionAuth({
		email,
		password,
		accessToken: data.access_token as string | undefined,
		refreshToken: data.refresh_token as string | undefined,
		expiresAt: getExpiresAtFromResponse(data),
	});
}

async function signUp(email: string, password: string): Promise<void> {
	const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			apikey: SUPABASE_ANON_KEY,
		},
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const data = (await response.json().catch(() => ({}))) as Record<string, string>;
		throw new Error(data.message || data.error_description || "Sign up failed");
	}

	const data = (await response.json()) as Record<string, unknown>;
	await persistSessionAuth({
		email,
		password,
		accessToken: data.access_token as string | undefined,
		refreshToken: data.refresh_token as string | undefined,
		expiresAt: getExpiresAtFromResponse(data),
	});
}

async function handleAuthAction(kind: "signin" | "signup"): Promise<void> {
	const email = emailInput.value.trim();
	const password = passwordInput.value.trim();
	const confirmPassword = confirmPasswordInput.value.trim();

	if (!email || !password) {
		setStatus("Please enter email and password", true);
		return;
	}

	if (kind === "signup" && password !== confirmPassword) {
		setStatus("Passwords do not match", true);
		return;
	}

	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		setStatus("Missing SUPABASE_URL or SUPABASE_ANON_KEY in build environment.", true);
		return;
	}

	setLoading(true);
	setStatus(kind === "signin" ? "Signing in..." : "Creating account...");

	try {
		if (kind === "signin") {
			await signIn(email, password);
			setStatus("Signed in successfully.");
		} else {
			await signUp(email, password);
			setStatus("Account created successfully.");
		}
		showReadyUi(email);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Authentication failed";
		setStatus(message, true);
	} finally {
		setLoading(false);
	}
}

signInButton.addEventListener("click", async () => {
	await handleAuthAction("signin");
});

signUpButton.addEventListener("click", async () => {
	await handleAuthAction("signup");
});

modeToggleButton.addEventListener("click", () => {
	setCreateMode(!isCreateMode);
});

logoutButton.addEventListener("click", async () => {
	setLoading(true);
	try {
		await clearSessionCredentials();
		emailInput.value = "";
		passwordInput.value = "";
		setStatus("Logged out.");
		showAuthUi();
	} finally {
		setLoading(false);
	}
});

async function init(): Promise<void> {
	setLoading(false);
	const stored = (await chrome.storage.session.get([...SESSION_KEYS])) as StoredAuth;
	const hasStoredToken = Boolean(stored.auth_token);
	const hasStoredCredentials = Boolean(stored.auth_email && stored.auth_password);

	if (stored.auth_email) {
		emailInput.value = stored.auth_email;
	}
	if (stored.auth_password) {
		passwordInput.value = stored.auth_password;
	}

	if (hasStoredToken || hasStoredCredentials) {
		showReadyUi(stored.auth_email);
		setStatus("");
		return;
	}

	setCreateMode(false);
	showAuthUi();
	setStatus("");
}

void init();