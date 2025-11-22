import { defineStore } from "pinia";

const API_URL = import.meta.env.VITE_API_URL || process.env.API_URL;
const API_PORT = import.meta.env.VITE_API_PORT || process.env.API_PORT;
const BASE_URL = `${API_URL}:${API_PORT}`;

export interface Snippet {
	Id: string;
	title: string;
	text: string;
	url: string;
	created_at?: string;
}

export const useSnippetsStore = defineStore("snippets", {
	state: () => ({
		snippets: [] as Snippet[],
		loading: false,
		error: null as string | null
	}),
	actions: {
		async getSnippets(titleSearch: string = "") {
			console.log("Fetching snippets with title search:", titleSearch);
			this.loading = true;
			this.error = null;
			try {
				console.log("Constructed URL:", `${BASE_URL}/snippets?title=${titleSearch}`);
				const res = await fetch(`${BASE_URL}/snippets?title=${titleSearch}`);
				const json = await res.json();
				if (!res.ok) {
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
		async createSnippet(snippet: Omit<Snippet, "id" | "created_at">) {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/snippets`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(snippet)
				});
				const json = await res.json();
				if (!res.ok) {
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
		async deleteSnippet(id: string) {
			this.loading = true;
			this.error = null;
			try {
				// urlencode id
				const encodedId = encodeURIComponent(id);

				await fetch(`${BASE_URL}/snippets/${encodedId}`, {
					method: "DELETE"
				});
				this.snippets = this.snippets.filter((s) => s.Id !== id);
			} catch (err: any) {
				this.error = err.message || "Failed to delete snippet";
			} finally {
				this.loading = false;
			}
		}
	}
});
