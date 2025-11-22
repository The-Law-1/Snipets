<template>
	<div class="card-panel shadow-sm flex flex-col gap-4">
		<div class="flex items-center justify-between mb-2">
			<h2 class="text-xl font-bold text-gray-100">{{ snippet.title }}</h2>
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
					class="ml-2 danger-button hover:cursor-pointer text-xs">
					Delete
				</button>
			</div>
		</div>

		<blockquote class="border-l-4 border-orange-400 pl-4 italic text-gray-200 text-lg bg-transparent">
			{{ snippet.text }}
		</blockquote>

		<div class="flex items-center justify-between mt-2">
			<span v-if="snippet.created_at" class="text-gray-400 text-xs">Added: {{ snippet.created_at }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { Snippet } from "../store/snippets";

const props = defineProps<{ snippet: Snippet }>();
const emit = defineEmits(["delete"]);

function onDelete() {
	emit("delete", props.snippet.id);
}
</script>
