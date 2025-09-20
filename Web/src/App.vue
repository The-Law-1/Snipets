<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto">
      <SnippetSearchBar @search="onSearch" />
      <div v-if="loading" class="text-center py-8 text-gray-500">Loading...</div>
      <div v-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
      <div v-if="snippets.length === 0 && !loading" class="text-center py-8 text-gray-400">No snippets found.</div>
      <div v-if="snippets.length > 0" class="grid gap-6 mt-6">
        <SnippetCard v-for="snippet in snippets" :key="snippet.id" :snippet="snippet" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSnippetsStore } from './store/snippets';
import SnippetSearchBar from './components/SnippetSearchBar.vue';
import SnippetCard from './components/SnippetCard.vue';

const store = useSnippetsStore();
const snippets = computed(() => store.snippets);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const onSearch = async (query: string) => {
  await store.getSnippets(query);
};

onMounted(() => {
  store.getSnippets();
});
</script>