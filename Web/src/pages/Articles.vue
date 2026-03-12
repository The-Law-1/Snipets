<template>
	<div class="app-shell p-6">
		<div class="max-w-2xl mx-auto">
			<div class="text-center text-3xl font-bold mb-4">Articles</div>
			<SearchBar
				@search="onSearch"
				placeholder="Search articles by title..." />

			<NavbarButtons />

			<div v-if="loading" class="text-center py-8 text-muted">Loading...</div>
			<div v-if="error" class="text-center py-8 text-error">{{ error }}</div>
			<div v-if="articles.length === 0 && !loading" class="text-center py-8 text-muted">No articles found.</div>
			<div
				v-if="articles.length > 0"
				class="grid gap-6 mt-6">
				<ArticleCard
					v-for="(article, idx) in articles"
					:key="idx"
					:article="article"
					@expand="onExpandArticle" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useArticleStore } from "@/store/articles";
import { useSnippetsStore } from "@/store/snippets";
import { useAuthStore } from "@/store/auth";
import SearchBar from "@/components/SearchBar.vue";
import ArticleCard from "@/components/ArticleCard.vue";
import NavbarButtons from "@/components/NavbarButtons.vue";

const store = useArticleStore();
const snippetsStore = useSnippetsStore();
const authStore = useAuthStore();

const articles = computed(() => store.articles);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const onExpandArticle = async (articleTitle: string) => {
	const token = authStore.getAuthToken();
	if (token) {
		await snippetsStore.getSnippets(token, articleTitle);
		window.location.hash = "#/snippets";
	}
};

const onSearch = async (query: string) => {
	const token = authStore.getAuthToken();
	if (token) {
		await store.getArticles(query, token);
	}
};

onMounted(async () => {
	const token = authStore.getAuthToken();
	if (token) {
		await store.getArticles("", token);
	}
});
</script>

<style scoped>
.text-muted {
	color: var(--muted);
}

.text-error {
	color: var(--danger);
}
</style>

