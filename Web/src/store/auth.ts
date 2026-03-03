import { defineStore } from "pinia";
import { useSnippetsStore } from "./snippets";
import { useFeedStore } from "./feed";
import { useArticleStore } from "./articles";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: null as any,
		session: null as any,
		loading: false,
		error: null as string | null,
	}),
	getters: {
		isAuthenticated(): boolean {
			return !!this.session?.access_token;
		},
		userId(): string | null {
			return this.user?.id || null;
		},
		userEmail(): string | null {
			return this.user?.email || null;
		},
	},
	actions: {
		resetUserScopedStores() {
			const snippetsStore = useSnippetsStore();
			const feedStore = useFeedStore();
			const articleStore = useArticleStore();

			snippetsStore.resetSnippetsState();
			feedStore.resetFeedState();
			articleStore.resetArticlesState();
		},

		async signUp(email: string, password: string) {
			this.loading = true;
			this.error = null;
			try {
				const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						apikey: SUPABASE_ANON_KEY,
					},
					body: JSON.stringify({ email, password }),
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.message || "Sign up failed");
				}

				const data = await response.json();
				// TODO when you start asking for email confirmation
				// you'll need to change this flow
				this.user = data.user;
				localStorage.setItem("auth_token", data.access_token);
				localStorage.setItem("refresh_token", data.refresh_token);
				localStorage.setItem("expires_at", data.expires_at);
			} catch (err: any) {
				this.error = err.message || "Sign up failed";
				throw err;
			} finally {
				this.loading = false;
			}
		},
		async refreshToken() {
			const refreshToken = localStorage.getItem("refresh_token");
			if (!refreshToken) {
				this.signOut();
				return;
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
					this.signOut();
					return;
				}

				const data = await response.json();
				this.session = { access_token: data.access_token };
				localStorage.setItem("auth_token", data.access_token);
				localStorage.setItem("refresh_token", data.refresh_token);
				localStorage.setItem("expires_at", data.expires_at);
			} catch {
				this.signOut();
			}
		},
		async signIn(email: string, password: string) {
			this.loading = true;
			this.error = null;
			this.resetUserScopedStores();
			try {
				const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						apikey: SUPABASE_ANON_KEY,
					},
					body: JSON.stringify({ email, password }),
				});

				if (!response.ok) {
					const data = await response.json();
					if (response.status === 400) {
						throw new Error(data.error_description || "Invalid credentials");
					}
					throw new Error(data.error_description || "Sign in failed");
				}

				const data = await response.json();
				console.log("Sign in response:", data);

				this.session = { access_token: data.access_token };
				this.user = { id: data.user?.id, email: data.user?.email };
				localStorage.setItem("auth_token", data.access_token);
				localStorage.setItem("refresh_token", data.refresh_token);
				localStorage.setItem("expires_at", data.expires_at);
			} catch (err: any) {
				this.error = err.message || "Sign in failed";
				throw err;
			} finally {
				this.loading = false;
			}
		},

		async signOut() {
			this.loading = true;
			try {
				this.user = null;
				this.session = null;
				this.resetUserScopedStores();
				localStorage.removeItem("auth_token");
			} finally {
				this.loading = false;
			}
		},

		async restoreSession() {
			const token = localStorage.getItem("auth_token");
			if (!token) return false;

			try {
				const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
					headers: {
						Authorization: `Bearer ${token}`,
						apikey: SUPABASE_ANON_KEY,
					},
				});

				if (!response.ok) {
					this.resetUserScopedStores();
					this.user = null;
					this.session = null;
					localStorage.removeItem("auth_token");
					return false;
				}

				const user = await response.json();
				this.user = user;
				this.session = { access_token: token };
				return true;
			} catch {
				this.resetUserScopedStores();
				this.user = null;
				this.session = null;
				localStorage.removeItem("auth_token");
				return false;
			}
		},

		getAuthToken(): string | null {
			return localStorage.getItem("auth_token");
		},
	},
});
