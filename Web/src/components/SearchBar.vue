<template>
	<form
		@submit.prevent="onSubmit"
		class="flex items-center gap-2 mb-6">
		<input
			v-model="search"
			type="text"
			:placeholder="props.placeholder || 'Search snippets by title...'"
			class="form-input flex-1" />
		<button
			type="submit"
			class="button-primary px-4">
			Search
		</button>
	</form>
</template>

<script setup lang="ts">
import { ref } from "vue";
const emit = defineEmits(["search"]);
const search = ref("");

const props = defineProps<{
	placeholder?: string;
}>();

function onSubmit() {
	emit("search", search.value);
}
</script>
