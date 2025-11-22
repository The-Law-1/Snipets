<template>
	<div class="card-panel shadow-md flex flex-col gap-4">
		<h2 class="text-xl font-bold text-gray-100">{{ props.article.title }}</h2>
		<div class="flex items-center gap-3">
			<a
				:href="props.article.url"
				target="_blank"
				rel="noopener noreferrer"
				class="link-button">
				Source
			</a>

			<button
				@click="$emit('expand', props.article.title)"
				class="px-3 py-1 rounded-full bg-gray-700 text-gray-100 cursor-pointer hover:bg-gray-600">
				Snippets: {{ props.article.snippet_count }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Article } from "@/store/articles";

const props = defineProps<{ article: Article }>();
</script>
