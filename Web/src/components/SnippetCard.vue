<template>
	<div class="card-panel shadow-sm flex flex-col gap-4">
		<div class="flex items-center justify-between mb-2">
			<h2 class="text-xl">{{ snippet.title }}</h2>
			<div class="flex items-center gap-2">
				<a
					v-if="snippet.url"
					:href="snippet.url"
					target="_blank"
					rel="noopener noreferrer"
					class="link-button text-sm">
					Source
				</a>

				<button
					@click="onDelete"
					class="ml-2 danger-button hover:cursor-pointer text-xs delete-snippet-button">
					Delete
				</button>
			</div>
		</div>

		<blockquote class="blockquote-accent">
			{{ snippet.text }}
		</blockquote>

		<div class="flex items-center justify-between mt-2">
			<span v-if="snippet.created_at" class="text-muted text-xs">Added: {{ snippet.created_at.split("T")[0] }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Snippet } from "../store/snippets";

const props = defineProps<{ snippet: Snippet }>();
const emit = defineEmits(["delete"]);

function onDelete() {
	emit("delete", props.snippet.id);
}
</script>

<style scoped>
.delete-snippet-button {
	padding-inline: 0.85rem;
}

.text-muted {
	color: var(--muted);
}
</style>
