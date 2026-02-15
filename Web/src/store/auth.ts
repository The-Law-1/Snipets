import { defineStore } from "pinia";

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
				this.session = data.session;
				this.user = data.user;
				localStorage.setItem("auth_token", data.session.access_token);
			} catch (err: any) {
				this.error = err.message || "Sign up failed";
				throw err;
			} finally {
				this.loading = false;
			}
		},

		async signIn(email: string, password: string) {
			this.loading = true;
			this.error = null;
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
					throw new Error(data.error_description || "Sign in failed");
				}

				const data = await response.json();
				this.session = { access_token: data.access_token };
				this.user = { id: data.user?.id, email: data.user?.email };
				localStorage.setItem("auth_token", data.access_token);
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
					localStorage.removeItem("auth_token");
					return false;
				}

				const user = await response.json();
				this.user = user;
				this.session = { access_token: token };
				return true;
			} catch {
				localStorage.removeItem("auth_token");
				return false;
			}
		},

		getAuthToken(): string | null {
			return localStorage.getItem("auth_token");
		},
	},
});
