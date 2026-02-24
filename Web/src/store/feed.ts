import { defineStore } from "pinia";

const EDGE_URL = import.meta.env.VITE_EDGE_URL;
const BASE_URL = EDGE_URL;

export interface FeedItem {
	snippet: {
		id: string;
		text: string;
		title: string;
		url: string;
		created_at: string;
		username: string;
	};
}

export const useFeedStore = defineStore("feed", {
	state: () => ({
		items: [] as FeedItem[],
		loading: false,
		error: null as string | null,
	}),
	actions: {
		async getFeed(token: string) {
			this.loading = true;
			this.error = null;
			try {
				const res = await fetch(`${BASE_URL}/feed`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const json = await res.json();
				if (!res.ok) {
					if (res.status === 401) {
						throw new Error("Unauthorized. Please sign in again.");
					}
					this.error = json.detail || "Failed to fetch feed";
					return;
				}

				this.items = json.data || [];
			} catch (err: any) {
				this.error = err.message || "Failed to fetch feed";
			} finally {
				this.loading = false;
			}
		},
	},
});
