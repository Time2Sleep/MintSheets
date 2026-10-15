<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';

defineProps<{
  size?: string;
}>();
</script>

<template>
  <div class="w-full" role="status">
    <span class="sr-only">Loading data</span>
    <BaseIcon :size="size" icon="arrow-clockwise" class="animate-spin mx-auto" />
  </div>
</template>
