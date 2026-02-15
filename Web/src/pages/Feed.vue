<template>
	<div class="min-h-screen bg-gray-900 p-6 text-gray-100">
		<div class="max-w-4xl mx-auto">
			<div class="text-center text-3xl font-bold mb-6">Friend Activity Feed</div>

			<div v-if="loading" class="text-center py-8 text-gray-400">Loading feed...</div>
			<div v-if="error" class="text-center py-8 text-red-400">{{ error }}</div>
			<div v-if="items.length === 0 && !loading" class="text-center py-8 text-gray-400">
				No activity yet. Follow some users to see their snippets!
			</div>

			<div v-if="items.length > 0" class="grid gap-6">
				<div v-for="(item, idx) in items" :key="idx" class="feed-item">
					<div class="feed-header">
						<span class="username">{{ item.snippet.username }}</span>
						<span class="timestamp">{{ formatDate(item.snippet.created_at) }}</span>
					</div>
					<blockquote class="border-l-4 border-orange-400 pl-4 italic text-gray-200 text-lg bg-transparent my-3">
						{{ item.snippet.text }}
					</blockquote>
					<div class="feed-footer">
						<a
							v-if="item.snippet.url"
							:href="item.snippet.url"
							target="_blank"
							rel="noopener noreferrer"
							class="link-button text-sm"
						>
							{{ item.snippet.title }} ↗
						</a>
						<span v-else class="text-gray-400 text-sm">{{ item.snippet.title }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFeedStore } from "@/store/feed";
import { useAuthStore } from "@/store/auth";

const feedStore = useFeedStore();
const authStore = useAuthStore();

const items = computed(() => feedStore.items);
const loading = computed(() => feedStore.loading);
const error = computed(() => feedStore.error);

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

onMounted(async () => {
	const token = authStore.getAuthToken();
	if (token) {
		await feedStore.getFeed(token);
	}
});
</script>

<style scoped>
.feed-item {
	background: #0b1220;
	border-radius: 12px;
	padding: 1.5rem;
	border-left: 4px solid var(--accent);
}

.feed-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.username {
	font-weight: 700;
	color: var(--accent);
	font-size: 1.1rem;
}

.timestamp {
	font-size: 0.85rem;
	color: var(--muted);
}

.feed-footer {
	margin-top: 1rem;
	display: flex;
	gap: 1rem;
}

.link-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.45rem 0.8rem;
	background: linear-gradient(180deg, var(--accent) 0%, var(--accent-600) 100%);
	color: #0b0b0b;
	border-radius: 9999px;
	font-weight: 600;
	text-decoration: none;
	transition: transform 0.08s ease, box-shadow 0.12s ease;
}

.link-button:hover {
	transform: translateY(-1px);
	box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}
</style>
