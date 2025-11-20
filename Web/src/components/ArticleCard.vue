<template>
  <div class="bg-white shadow rounded p-6 flex flex-col gap-4">
    <h2 class="text-xl font-bold">{{ props.article.title }}</h2>
    <a :href="props.article.url" target="_blank" class="text-blue-600 hover:underline w-fit">Source</a>
    <p
      @click="$emit('expand', props.article.title)"
      class="cursor-pointer text-gray-600 hover:text-gray-800"
    >Snippets: {{ props.article.snippet_count }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Article } from '@/store/articles';

const props = defineProps<{ article: Article }>();

</script>