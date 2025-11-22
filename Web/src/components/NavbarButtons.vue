<template>
	<div class="p-4 flex gap-3">
		<a
			v-for="(path, name) in paths"
			:key="name"
			:href="path"
			:class="[ 'nav-button', currentPath === path ? 'nav-button--active' : '' ]">
			{{ name }}
		</a>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const paths = {
	Snippets: "#/",
	Articles: "#/articles"
};

const currentPath = ref(window.location.hash);

window.addEventListener("hashchange", () => {
	currentPath.value = window.location.hash;
});
</script>
