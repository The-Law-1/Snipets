import { defineStore } from "pinia";

const API_URL = import.meta.env.VITE_API_URL || process.env.API_URL;
const API_PORT = import.meta.env.VITE_API_PORT || process.env.API_PORT;
const BASE_URL = `${API_URL}:${API_PORT}`;

export interface Article {
	title: string;
	url: string;
	snippet_count: number;
}

export const useArticleStore = defineStore("articles", {
	state: () => ({
		articles: [] as Article[],
		loading: false,
		error: null as string | null
	}),
	actions: {
		async getArticles(titleSearch: string = "") {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/articles?title=${titleSearch}`);
				const json = await res.json();
				if (!res.ok) {
					this.error = json.message || "Failed to fetch articles";
					return;
				}
				this.articles = json.data;
			} catch (err: any) {
				this.error = err.message || "Failed to fetch articles";
			} finally {
				this.loading = false;
			}
		}
	}
});
