import { defineStore } from "pinia";
import { getValidAccessToken } from "../gateways/refresh";

const EDGE_URL = import.meta.env.VITE_EDGE_URL;
const BASE_URL = EDGE_URL;

export interface Snippet {
	id: string;
	title: string;
	text: string;
	url: string;
	created_at?: string;
	user_id?: string;
}

export const useSnippetsStore = defineStore("snippets", {
	state: () => ({
		snippets: [] as Snippet[],
		loading: false,
		error: null as string | null,
	}),
	actions: {
		resetSnippetsState() {
			this.snippets = [];
			this.error = null;
			this.loading = false;
		},

		async getSnippets(token: string, titleSearch: string = "") {
			this.loading = true;
			this.error = null;
			try {
				const validToken = await getValidAccessToken(token);
				if (!validToken) {
					throw new Error("Unauthorized. Please sign in again.");
				}

				const res = await fetch(`${BASE_URL}/snippets?title=${titleSearch}`, {
					headers: {
						Authorization: `Bearer ${validToken}`,
					},
				});
				const json = await res.json();
				if (!res.ok) {
					if (res.status === 401) {
						throw new Error("Unauthorized. Please sign in again.");
					}
					this.error = json.message || "Failed to fetch snippets";
					return;
				}
				this.snippets = json.data;
			} catch (err: any) {
				this.error = err.message || "Failed to fetch snippets";
			} finally {
				this.loading = false;
			}
		},
		async createSnippet(snippet: Omit<Snippet, "id" | "created_at">, token: string) {
			this.loading = true;
			this.error = null;
			try {
				const validToken = await getValidAccessToken(token);
				if (!validToken) {
					throw new Error("Unauthorized. Please sign in again.");
				}

				const res = await fetch(`${BASE_URL}/snippets`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${validToken}`,
					},
					body: JSON.stringify(snippet),
				});
				const json = await res.json();
				if (!res.ok) {
					if (res.status === 401) {
						throw new Error("Unauthorized. Please sign in again.");
					}
					this.error = json.message || "Failed to create snippet";
					return;
				}
				this.snippets.push(json.data);
			} catch (err: any) {
				this.error = err.message || "Failed to create snippet";
			} finally {
				this.loading = false;
			}
		},
		async deleteSnippet(id: string, token: string) {
			this.loading = true;
			this.error = null;
			try {
				const validToken = await getValidAccessToken(token);
				if (!validToken) {
					throw new Error("Unauthorized. Please sign in again.");
				}

				const encodedId = encodeURIComponent(id);
				const res = await fetch(`${BASE_URL}/snippets/${encodedId}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${validToken}`,
					},
				});
				if (!res.ok) {
					if (res.status === 401) {
						throw new Error("Unauthorized. Please sign in again.");
					}
					this.error = "Failed to delete snippet";
					return;
				}
				this.snippets = this.snippets.filter((s) => s.id !== id);
			} catch (err: any) {
				this.error = err.message || "Failed to delete snippet";
			} finally {
				this.loading = false;
			}
		},
	},
});
