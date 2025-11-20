<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto">
      <SearchBar @search="onSearch" />

      <NavbarButtons />

      <div v-if="loading" class="text-center py-8 text-gray-500">Loading...</div>
      <div v-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
      <div v-if="snippets.length === 0 && !loading" class="text-center py-8 text-gray-400">No snippets found.</div>
      <div v-if="snippets.length > 0" class="grid gap-6 mt-6">
        <SnippetCard v-for="snippet in snippets" :key="snippet.id" :snippet="snippet" @delete="onDelete" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSnippetsStore } from '@/store/snippets';
import SearchBar from '@/components/SearchBar.vue';
import SnippetCard from '@/components/SnippetCard.vue';
import NavbarButtons from '@/components/NavbarButtons.vue';

const store = useSnippetsStore();
const snippets = computed(() => store.snippets);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const onSearch = async (query: string) => {
  await store.getSnippets(query);
};

const onDelete = async (id: number) => {
  await store.deleteSnippet(id);
};

onMounted(() => {
  console.log("Current snippets on mount: ", snippets.value);
  store.getSnippets();
});
</script>