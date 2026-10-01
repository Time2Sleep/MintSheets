<script setup lang="ts">
import { useRoute } from 'vue-router';
import { router } from '../router';
import BaseIcon from './UI/BaseIcon.vue';

const { meta } = useRoute();
const goBack = () => {
  router.go(-1);
};

withDefaults(
  defineProps<{
    hideNav?: boolean;
  }>(),
  {
    hideNav: false,
  },
);
</script>
<template>
  <div class="flex items-center gap-6 pt-6 mb-4">
    <button v-if="!hideNav" class="flex items-center gap-2 w-fit" aria-label="Back" @click="goBack">
      <BaseIcon icon="arrow-left" size="24px" />
    </button>

    <h1 class="text-2xl">{{ meta.title }}</h1>
  </div>

  <slot />
</template>
