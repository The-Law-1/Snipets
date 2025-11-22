<template>
	<div class="min-h-screen bg-gray-900 p-6 text-gray-100">
		<div class="max-w-2xl mx-auto">
			<div class="text-center text-3xl font-bold mb-4">Articles</div>
			<SearchBar
				@search="onSearch"
				placeholder="Search articles by title..." />

			<NavbarButtons />

			<div v-if="loading" class="text-center py-8 text-gray-400">Loading...</div>
			<div v-if="error" class="text-center py-8 text-red-400">{{ error }}</div>
			<div v-if="articles.length === 0 && !loading" class="text-center py-8 text-gray-400">No articles found.</div>
			<div
				v-if="articles.length > 0"
				class="grid gap-6 mt-6">
				<ArticleCard
					v-for="article in articles"
					:key="article.id"
					:article="article"
					@expand="onExpandArticle" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useArticleStore } from "@/store/articles";
import SearchBar from "@/components/SearchBar.vue";
import ArticleCard from "@/components/ArticleCard.vue";
import NavbarButtons from "@/components/NavbarButtons.vue";
import { useSnippetsStore } from "@/store/snippets";

const store = useArticleStore();
const articles = computed(() => store.articles);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const snippetsStore = useSnippetsStore();

const onExpandArticle = async (articleTitle: string) => {
	await snippetsStore.getSnippets(articleTitle);
  window.location.hash = `/`;
};

const onSearch = async (query: string) => {
	await store.getArticles(query);
};

onMounted(() => {
	store.getArticles();
});
</script>
