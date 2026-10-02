<script setup lang="ts">
import BaseInput from '../UI/BaseInput.vue';
import BaseButton from '../UI/BaseButton.vue';
import { computed, nextTick, ref } from 'vue';
import BaseIcon from '../UI/BaseIcon.vue';

const props = defineProps<{
  name: string;
  label?: string;
  placeholder?: string;
  maxHeight?: string;
  emptyText?: string;
}>();
const emits = defineEmits<{
  (e: 'on-add', value: string): void;
  (e: 'on-delete', value: string): void;
}>();

const input = ref<string>('');
const list = defineModel<string[]>();
const scrollableList = ref<HTMLElement>();
const isAddDisabled = computed(() => !input.value || list.value?.includes(input.value));

const handleAdd = async () => {
  if (!list.value) return;

  list.value.push(input.value);
  emits('on-add', input.value);
  input.value = '';

  await nextTick();
  scrollableList.value?.scrollTo({ top: scrollableList.value.scrollHeight });
};

const removeItem = (category: string) => {
  list.value = list.value?.filter((cat) => category !== cat);
  emits('on-delete', category);
};

const getStyle = computed(() => {
  if (!props.maxHeight) return '';

  return `max-height: ${props.maxHeight}`;
});
</script>

<template>
  <div class="flex gap-2 items-end">
    <BaseInput v-model.trim="input" :label="label" :name="name" class="flex-1" :placeholder="placeholder" />

    <BaseButton class="h-[42px]" type="button" :aria-label="placeholder" :disabled="isAddDisabled" @click="handleAdd">
      Add
    </BaseButton>
  </div>

  <div v-if="!list?.length && emptyText" class="px-2 text-sm">{{ emptyText }}</div>
  <div v-if="list?.length" ref="scrollableList" class="px-2 overflow-y-auto" :style="getStyle">
    <div v-for="(item, index) in list" :key="item" class="my-3 flex gap-3 items-center">
      <BaseButton type="button" :aria-label="`Remove ${item}`" class="!p-1" @click="removeItem(item)">
        <BaseIcon icon="crest" size="16px" />
      </BaseButton>

      <div class="leading-none">{{ index + 1 }}. {{ item }}</div>
    </div>
  </div>
</template>
