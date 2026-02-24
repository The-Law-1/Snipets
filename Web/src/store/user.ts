import { defineStore } from "pinia";

const EDGE_URL = import.meta.env.VITE_EDGE_URL;
const BASE_URL = EDGE_URL;

export interface User {
	id: string;
	username: string;
}

export interface SearchUserResult extends User {
	is_following: boolean;
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
				const res = await fetch(`${BASE_URL}/auth/`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ username }),
				});

				const json = await res.json();
				if (!res.ok) {
					if (res.status === 400) {
						throw new Error("Username already in use.");
					}
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

		async searchUsers(query: string, token?: string): Promise<SearchUserResult[]> {
			this.loading = true;
			this.error = null;
			try {
				const headers: Record<string, string> = {};
				if (token) {
					headers.Authorization = `Bearer ${token}`;
				}

				const res = await fetch(`${BASE_URL}/users?q=${encodeURIComponent(query)}`, { headers });
				const json = await res.json();
				if (!res.ok) {
					if (res.status === 401) {
						throw new Error("Unauthorized. Please sign in again.");
					}
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
				const res = await fetch(`${BASE_URL}/users?username=${encodeURIComponent(username)}`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const json = await res.json();
				if (!res.ok) {
					if (res.status === 401) {
						throw new Error("Unauthorized. Please sign in again.");
					}
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

		async unfollowUser(username: string, token: string) {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/users?username=${encodeURIComponent(username)}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const json = await res.json();
				if (!res.ok) {
					if (res.status === 401) {
						throw new Error("Unauthorized. Please sign in again.");
					}
					throw new Error(json.detail || "Failed to unfollow user");
				}
				return json;
			} catch (err: any) {
				this.error = err.message || "Failed to unfollow user";
				throw err;
			} finally {
				this.loading = false;
			}
		},
	},
});
