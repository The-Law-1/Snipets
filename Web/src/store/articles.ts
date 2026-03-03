import { defineStore } from "pinia";
import { getValidAccessToken } from "../gateways/auth";

const EDGE_URL = import.meta.env.VITE_EDGE_URL;
const BASE_URL = EDGE_URL;

export interface Article {
	title: string;
	url: string;
	snippet_count: number;
}

export const useArticleStore = defineStore("articles", {
	state: () => ({
		articles: [] as Article[],
		loading: false,
		error: null as string | null,
	}),
	actions: {
		resetArticlesState() {
			this.articles = [];
			this.error = null;
			this.loading = false;
		},

		async getArticles(titleSearch: string = "", token: string = "") {
			this.loading = true;
			this.error = null;
			try {
				const validToken = await getValidAccessToken(token);
				if (!validToken) {
					throw new Error("Unauthorized. Please sign in again.");
				}

				const headers: Record<string, string> = {};
				if (validToken) {
					headers["Authorization"] = `Bearer ${validToken}`;
				}

				const res = await fetch(`${BASE_URL}/articles?title=${titleSearch}`, {
					headers,
				});
				const json = await res.json();
				if (!res.ok) {
					if (res.status === 401) {
						throw new Error("Unauthorized. Please sign in again.");
					}
					this.error = json.message || "Failed to fetch articles";
					return;
				}
				this.articles = json.data;
			} catch (err: any) {
				this.error = err.message || "Failed to fetch articles";
			} finally {
				this.loading = false;
			}
		},
	},
});
