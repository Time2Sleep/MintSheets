<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';
</script>

<template>
  <div class="w-full" role="status">
    <span class="sr-only">Loading data</span>
    <BaseIcon icon="arrow-clockwise" class="animate-spin mx-auto" />
  </div>
</template>
