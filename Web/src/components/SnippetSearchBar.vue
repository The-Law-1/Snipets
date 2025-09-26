<template>
  <form @submit.prevent="onSubmit" class="flex items-center gap-2 mb-6">
    <input
      v-model="search"
      type="text"
      placeholder="Search snippets by title..."
      class="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">Search</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits(['search']);
const search = ref('');

function onSubmit() {
  emit('search', search.value);
}
</script>
