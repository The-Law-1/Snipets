<template>
	<div class="page-header">
		<a href="#/" class="home-button">Home</a>
		<div class="page-title">{{ title }}</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<style scoped>
.page-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1.5rem;
}

.home-button {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.45rem 0.9rem;
	border-radius: 9999px;
	background: rgba(214, 189, 152, 0.12);
	color: var(--text);
	border: 1px solid var(--border-soft);
	text-decoration: none;
	font-weight: 600;
	transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
	align-self: flex-start;
}

.home-button:hover {
	transform: translateY(-1px);
	background: rgba(214, 189, 152, 0.2);
	box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.page-title {
	text-align: center;
	font-size: 1.875rem;
	font-weight: 700;
}
</style>
