<script setup lang="ts">
import WrapperContainer from '../UI/WrapperContainer.vue';
import BaseButton from '../UI/BaseButton.vue';
import BaseIcon from '../UI/BaseIcon.vue';
import { type CSSProperties } from 'vue';

defineProps<{
  title?: string;
  containerStyle?: CSSProperties;
}>();

const open = defineModel<boolean>('open');

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const handleClose = () => {
  open.value = false;
  emits('close');
};
</script>
<template>
  <Transition>
    <div
      v-if="open"
      class="absolute z-10 top-0 left-0 fixed inset-0 flex items-center justify-center w-[100vw] h-[100vh]"
      role="dialog"
      aria-modal="true"
      :aria-label="`${title} modal window`"
    >
      <div class="absolute top-0 left-0 bg-dark-primary w-full h-full opacity-70" @click="handleClose" />

      <WrapperContainer class="relative z-11 min-h-[100px] min-w-[50%]" :style="containerStyle">
        <div class="flex justify-between mb-4">
          <div>{{ title }}</div>

          <BaseButton class="self-end" visual="link" aria-label="Close modal" @click="handleClose">
            <BaseIcon icon="crest" />
          </BaseButton>
        </div>

        <slot />
      </WrapperContainer>
    </div>
  </Transition>
</template>
