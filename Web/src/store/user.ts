import { defineStore } from "pinia";

const API_URL = import.meta.env.VITE_API_URL || process.env.API_URL;
const API_PORT = import.meta.env.VITE_API_PORT || process.env.API_PORT;
const BASE_URL = `${API_URL}:${API_PORT}`;

export interface User {
	id: string;
	username: string;
}

export const useUserStore = defineStore("user", {
	state: () => ({
		profile: null as User | null,
		loading: false,
		error: null as string | null,
	}),
	actions: {
		async createProfile(username: string, token: string) {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/auth/profile/`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ username }),
				});

				const json = await res.json();
				if (!res.ok) {
					this.error = json.detail || "Failed to create profile";
					throw new Error(json.detail);
				}

				this.profile = json.user;
				return json.user;
			} catch (err: any) {
				this.error = err.message || "Failed to create profile";
				throw err;
			} finally {
				this.loading = false;
			}
		},

		async searchUsers(query: string) {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
				const json = await res.json();
				if (!res.ok) {
					throw new Error(json.detail || "Failed to search users");
				}
				return json.data || [];
			} catch (err: any) {
				this.error = err.message || "Failed to search users";
				return [];
			} finally {
				this.loading = false;
			}
		},

		async followUser(username: string, token: string) {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/users/follow?username=${encodeURIComponent(username)}`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const json = await res.json();
				if (!res.ok) {
					throw new Error(json.detail || "Failed to follow user");
				}
				return json;
			} catch (err: any) {
				this.error = err.message || "Failed to follow user";
				throw err;
			} finally {
				this.loading = false;
			}
		},
	},
});
