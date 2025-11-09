<template>
  <div class="p-4 flex space-x-4">
    <a v-for="(path, name) in paths" :key="name"
       :href="path"
       :class="currentPath === path ? 'text-blue-700 font-bold' : 'text-blue-500 hover:underline'">
      {{ name }}
    </a>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';

const paths = {
  "Snippets": '#/',
  "Articles": '#/articles',
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  if (window.location.hash in paths) {
    currentPath.value = window.location.hash
  }
})

</script>