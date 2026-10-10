<script setup lang="ts">
import WrapperContainer from '../UI/WrapperContainer.vue';

defineProps<{
  links: { name: string; to: string }[];
}>();
</script>
<template>
  <WrapperContainer class="divide-y-1 divide-solid divide-light-secondary py-0 w-full">
    <RouterLink v-for="link in links" :key="link.name" class="w-full bordered py-4" :to="link.to">
      <span>{{ link.name }}</span>
    </RouterLink>
  </WrapperContainer>
</template>
