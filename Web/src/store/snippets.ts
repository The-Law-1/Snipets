
import { defineStore } from 'pinia';

const API_URL = import.meta.env.VITE_API_URL || process.env.API_URL;
const API_PORT = import.meta.env.VITE_API_PORT || process.env.API_PORT;
const BASE_URL = `${API_URL}:${API_PORT}`;

export interface Snippet {
	id: number;
	title: string;
	content: string;
	language: string;
	created_at?: string;
}

export const useSnippetsStore = defineStore('snippets', {
	state: () => ({
		snippets: [] as Snippet[],
      loading: false,
		error: null as string | null,
	}),
	actions: {
		async getSnippets(titleSearch: string = '') {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/snippets?title=${titleSearch}`);
				this.snippets = await res.json();
			} catch (err: any) {
				this.error = err.message || 'Failed to fetch snippets';
			} finally {
				this.loading = false;
			}
		},
		async createSnippet(snippet: Omit<Snippet, 'id' | 'created_at'>) {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/snippets`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(snippet),
				});
				this.snippets.push(await res.json());
			} catch (err: any) {
				this.error = err.message || 'Failed to create snippet';
			} finally {
				this.loading = false;
			}
		},
		async deleteSnippet(id: number) {
			this.loading = true;
			this.error = null;
			try {
				await fetch(`${BASE_URL}/snippets/${id}`, {
					method: "DELETE",
				});
				this.snippets = this.snippets.filter(s => s.id !== id);
			} catch (err: any) {
				this.error = err.message || 'Failed to delete snippet';
			} finally {
				this.loading = false;
			}
		},
	},
});
