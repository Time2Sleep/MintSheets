<script setup lang="ts">
import BaseInput from '../UI/BaseInput.vue';
import BaseButton from '../UI/BaseButton.vue';
import { computed, nextTick, ref } from 'vue';

const props = defineProps<{
  name: string;
  label?: string;
  placeholder?: string;
  maxHeight?: string;
  emptyText?: string;
}>();

const input = ref<string>('');
const list = defineModel<string[]>();
const scrollableList = ref<HTMLElement>();
const isAddDisabled = computed(() => !input.value || list.value?.includes(input.value));

const handleAdd = async () => {
  if (!list.value) return;

  list.value.push(input.value);
  input.value = '';

  await nextTick();
  scrollableList.value?.scrollTo({ top: scrollableList.value.scrollHeight });
};

const removeItem = (category: string) => {
  list.value = list.value?.filter((cat) => category !== cat);
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
  <div v-if="list?.length" class="px-2">
    <div ref="scrollableList" class="overflow-y-auto" :style="getStyle">
      <div v-for="(item, index) in list" :key="item" class="my-2 flex gap-2 items-center">
        <BaseButton type="button" :aria-label="`Remove ${item}`" class="!p-1" @click="removeItem(item)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
            />
          </svg>
        </BaseButton>

        <div>{{ index + 1 }}. {{ item }}</div>
      </div>
    </div>
  </div>
</template>
