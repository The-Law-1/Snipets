<template>
	<div class="min-h-screen bg-gray-900 p-6 text-gray-100">
		<div class="max-w-2xl mx-auto">
			<PageHeader title="Find People" />

			<form @submit.prevent="handleSearch" class="mb-8">
				<div class="flex gap-2">
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Search by username..."
						class="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
					/>
					<button
						type="submit"
						class="px-6 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-600 cursor-pointer font-bold"
					>
						Search
					</button>
				</div>
			</form>

			<div v-if="loading" class="text-center py-8 text-gray-400">Searching...</div>
			<div v-if="error" class="text-center py-8 text-red-400">{{ error }}</div>
			<div v-if="results.length === 0 && searched" class="text-center py-8 text-gray-400">
				No users found
			</div>

			<div v-if="results.length > 0" class="grid gap-4">
				<div v-for="user in results" :key="user.id" class="user-card">
					<div class="user-info">
						<h3 class="username">{{ user.username }}</h3>
					</div>
					<button
						@click="toggleFollow(user)"
						:disabled="loadingFollow === user.username"
						class="follow-btn"
					>
						{{
							loadingFollow === user.username
								? user.is_following
									? "Unfollowing..."
									: "Following..."
								: user.is_following
									? "Unfollow"
									: "Follow"
						}}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore, type SearchUserResult } from "@/store/user";
import { useAuthStore } from "@/store/auth";
import PageHeader from "@/components/PageHeader.vue";

const userStore = useUserStore();
const authStore = useAuthStore();

const searchQuery = ref("");
const results = ref<SearchUserResult[]>([]);
const loading = ref(false);
const loadingFollow = ref<string | null>(null);
const error = ref("");
const searched = ref(false);

async function handleSearch() {
	if (!searchQuery.value.trim()) return;

	loading.value = true;
	error.value = "";
	searched.value = true;

	try {
		const token = authStore.getAuthToken() || undefined;
		const currentUserId = authStore.userId;
		const users = await userStore.searchUsers(searchQuery.value, token);
		results.value = currentUserId
			? users.filter((user: SearchUserResult) => user.id !== currentUserId)
			: users;
	} catch (err: any) {
		error.value = err.message || "Failed to search users";
		results.value = [];
	} finally {
		loading.value = false;
	}
}

async function toggleFollow(user: SearchUserResult) {
	const token = authStore.getAuthToken();
	if (!token) return;

	loadingFollow.value = user.username;
	error.value = "";

	try {
		if (user.is_following) {
			await userStore.unfollowUser(user.username, token);
			user.is_following = false;
		} else {
			await userStore.followUser(user.username, token);
			user.is_following = true;
		}
	} catch (err: any) {
		error.value = err.message;
	} finally {
		loadingFollow.value = null;
	}
}
</script>

<style scoped>
.user-card {
	background: #0b1220;
	border-radius: 12px;
	padding: 1.5rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 1px solid rgba(255, 255, 255, 0.05);
	transition: all 0.2s ease;
}

.user-card:hover {
	border-color: var(--accent);
	box-shadow: 0 8px 24px rgba(255, 122, 24, 0.1);
}

.user-info {
	flex: 1;
}

.username {
	font-size: 1.1rem;
	font-weight: 700;
	color: var(--text);
	margin: 0;
}

.follow-btn {
	padding: 0.6rem 1.2rem;
	background: linear-gradient(180deg, var(--accent) 0%, var(--accent-600) 100%);
	color: #0b0b0b;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.follow-btn:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(255, 122, 24, 0.3);
}

.follow-btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
</style>
