
<template>
  <div class="bg-white shadow rounded p-6 flex flex-col gap-4">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl font-bold text-gray-900">{{ snippet.title }}</h2>
      <a v-if="snippet.url" :href="snippet.url" target="_blank" class="text-blue-600 hover:underline text-sm">Source</a>
    </div>
    <blockquote class="border-l-4 border-blue-400 pl-4 italic text-gray-800 text-lg">
      {{ snippet.text }}
    </blockquote>
    <div class="flex items-center justify-between mt-2">
      <span v-if="snippet.created_at" class="text-gray-400 text-xs">Added: {{ snippet.created_at }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { Snippet } from '../store/snippets';

defineProps<{ snippet: Snippet }>();
</script>
