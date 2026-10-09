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
    hideTitle?: boolean;
    title?: string;
  }>(),
  {
    hideNav: false,
    hideTitle: false,
    title: '',
  },
);
</script>
<template>
  <div class="flex flex-col h-full pt-4 pb-6 gap-4">
    <div class="flex items-center gap-6 mb-4">
      <button v-if="!hideNav" class="flex items-center gap-2 w-fit" aria-label="Back" @click="goBack">
        <BaseIcon icon="arrow-left" size="24px" />
      </button>

      <h1 v-show="!hideTitle" class="text-xl leading-none capitalize">{{ title || meta.title }}</h1>
    </div>

    <slot />
  </div>
</template>
