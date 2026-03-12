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
			<span v-if="userEmail" class="text-sm user-email">{{ userEmail }}</span>
			<button @click="logout" class="logout-btn">Logout</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();

const paths = {
	Snippets: "#/snippets",
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
	padding: 0.4rem 0.82rem;
	border-radius: 9999px;
	background: linear-gradient(180deg, var(--danger-600), var(--danger-700));
	color: var(--danger-ink);
	border: 1px solid rgba(255, 107, 107, 0.36);
	font-weight: 700;
	cursor: pointer;
	transition: transform 0.16s ease, box-shadow 0.2s ease, filter 0.18s ease;
}

.logout-btn:hover {
	transform: translateY(-1px);
	box-shadow: 0 8px 20px rgba(255, 74, 74, 0.2);
	filter: saturate(1.05);
}

.user-email {
	color: var(--muted);
}
</style>


