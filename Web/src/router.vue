<script setup lang="ts">
import { ref, computed } from 'vue'
import Snippets from './pages/snippets.vue'
import Articles from './pages/Articles.vue'

const routes = {
  '/': Snippets,
  "/articles": Articles,
  // articles
  // 404
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>

<template>
  <component :is="currentView" />
</template>