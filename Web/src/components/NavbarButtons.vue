<template>
	<div class="p-4 flex gap-3 justify-between items-center flex-wrap">
		<div class="flex gap-3">
			<a
				v-for="(path, name) in paths"
				:key="name"
				:href="path"
				:class="['nav-button', currentPath === path ? 'nav-button--active' : '']"
			>
				{{ name }}
			</a>
		</div>

		<div class="flex gap-3 items-center">
			<span v-if="userEmail" class="text-sm text-gray-400">{{ userEmail }}</span>
			<button @click="logout" class="logout-btn">Logout</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();

const paths = {
	Snippets: "#/",
	Articles: "#/articles",
	Feed: "#/feed",
	Friends: "#/friends",
};

const currentPath = ref(window.location.hash);
const userEmail = computed(() => authStore.userEmail);

window.addEventListener("hashchange", () => {
	currentPath.value = window.location.hash;
});

function logout() {
	authStore.signOut();
	window.location.hash = "#/auth";
}
</script>

<style scoped>
.logout-btn {
	padding: 0.4rem 0.75rem;
	border-radius: 9999px;
	background: #ff6b6b;
	color: white;
	border: none;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.logout-btn:hover {
	background: #ff5a5a;
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.nav-button {
	display: inline-flex;
	align-items: center;
	padding: 0.4rem 0.75rem;
	border-radius: 9999px;
	background: transparent;
	color: var(--text);
	border: 1px solid rgba(255, 255, 255, 0.04);
	font-weight: 600;
	text-decoration: none;
	transition: all 0.2s ease;
}

.nav-button--active {
	background: linear-gradient(180deg, rgba(255, 122, 24, 0.95) 0%, rgba(255, 107, 0, 0.95) 100%);
	color: #071018;
	box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}

.nav-button:not(.nav-button--active):hover {
	background: rgba(255, 255, 255, 0.05);
	cursor: pointer;
}
</style>


