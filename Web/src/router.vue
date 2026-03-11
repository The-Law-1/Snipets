<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Landing from "./pages/Landing.vue";
import Snippets from "./pages/snippets.vue";
import Articles from "./pages/Articles.vue";
import Auth from "./pages/Auth.vue";
import Feed from "./pages/Feed.vue";
import Friends from "./pages/Friends.vue";
import { useAuthStore } from "./store/auth";

const authStore = useAuthStore();
const isInitialized = ref(false);

const routes: any = {
	"/": Landing,
	"/snippets": Snippets,
	"/articles": Articles,
	"/feed": Feed,
	"/friends": Friends,
	"/auth": Auth,
};

const currentPath = ref(window.location.hash);

window.addEventListener("hashchange", () => {
	currentPath.value = window.location.hash;
});

const currentView = computed(() => {
	const path = currentPath.value.slice(1) || "/";
	const protectedPaths = new Set(["/snippets", "/articles", "/feed", "/friends"]);

	// Route protected pages to auth if not logged in
	if (!authStore.isAuthenticated && protectedPaths.has(path)) {
		return Auth;
	}

	// Route to auth page if explicitly requested
	if (path === "/auth") {
		return Auth;
	}

	return routes[path] || Landing;
});

onMounted(async () => {
	await authStore.restoreSession();
	isInitialized.value = true;
});
</script>

<template>
	<component v-if="isInitialized" :is="currentView" />
	<div v-else class="loading">Loading...</div>
</template>

<style scoped>
.loading {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	color: #e6eef8;
	font-size: 1.2rem;
}
</style>


