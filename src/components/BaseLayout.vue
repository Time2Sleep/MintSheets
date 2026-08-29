<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { router } from '../router';

const { name, meta } = useRoute();
const isBackButtonShown = computed(() => name !== 'main');
const goBack = () => {
  router.go(-1);
};
</script>
<template>
  <div class="flex items-center gap-6">
    <button v-if="isBackButtonShown" class="flex items-center gap-2 w-fit" @click="goBack">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="w-[24px] h-[24px]"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
        />
      </svg>
    </button>

    <h1 class="text-2xl">{{ meta.title }}</h1>
  </div>

  <slot />
</template>
