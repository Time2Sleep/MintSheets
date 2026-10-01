<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

const props = withDefaults(
  defineProps<{
    icon: string;
    size?: string;
    color?: string;
  }>(),
  {
    size: '20px',
    color: 'var(--color-light-primary)',
  },
);

const style = computed(() => ({
  width: props.size,
  height: props.size,
  fill: props.color,
}));

const iconComponent = computed(() => defineAsyncComponent(() => import(`@/assets/icons/${props.icon}.svg`)));
</script>

<template>
  <component :is="iconComponent" :style="style" aria-hidden="true" />
</template>
