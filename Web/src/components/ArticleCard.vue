<template>
  This is an article.
</template>

<script setup lang="ts">
import type { Article } from '@/store/articles';

const props = defineProps<{ article: Article }>();

</script>