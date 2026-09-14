<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue';
import { router } from '../../router';
import { CURRENCIES, type Currency } from '../../constants/currencies';
import BaseLayout from '../BaseLayout.vue';
import BaseButton from '../UI/BaseButton.vue';
import BaseInput from '../UI/BaseInput.vue';
import BaseSelect from '../UI/BaseSelect.vue';
import WrapperContainer from '../UI/WrapperContainer.vue';

const handleSubmit = () => {
  console.log('Handled settings submit');

  router.push({ name: 'main' });
};

const form = reactive<{
  categories: string[];
  balance: string;
  currency?: Currency;
}>({
  categories: [],
  balance: '',
  currency: undefined,
});

const categoryName = ref<string>('');
const isAddCategoryDisabled = computed<boolean>(
  () => !categoryName.value || form.categories.includes(categoryName.value),
);

const scrollableList = ref<HTMLElement>();

const handleAdd = async () => {
  form.categories.push(categoryName.value);
  categoryName.value = '';

  await nextTick();
  scrollableList.value?.scrollTo({ top: scrollableList.value.scrollHeight });
};

const isContinueDisabled = computed<boolean>(() => !form.categories.length || !form.currency || form.balance === '');

const removeCategory = (category: string) => {
  form.categories = form.categories.filter((cat) => category !== cat);
};
</script>

<template>
  <BaseLayout :hide-nav="true">
    <form @submit.prevent="handleSubmit">
      <WrapperContainer :gap="4">
        <BaseSelect v-model="form.currency" placeholder="Currency" :options="CURRENCIES" label-key="name" />

        <BaseInput v-model.number="form.balance" placeholder="Initial Balance" type="number" />

        <div v-if="!form.categories.length" class="px-2">Add at least one category to continue</div>
        <div v-else class="px-2">
          <h2 class="text-lg">Categories</h2>
          <div ref="scrollableList" class="max-h-[40vh] overflow-y-auto">
            <div v-for="(cat, index) in form.categories" :key="cat" class="my-2 flex gap-4 items-center">
              <BaseButton type="button" class="py-1" @click="removeCategory(cat)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-x"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                  />
                </svg>
              </BaseButton>
              <div>{{ index + 1 }}. {{ cat }}</div>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <BaseInput v-model="categoryName" class="flex-1" placeholder="Category name" />

          <BaseButton type="button" aria-label="Add category" :disabled="isAddCategoryDisabled" @click="handleAdd">
            Add
          </BaseButton>
        </div>

        <BaseButton :disabled="isContinueDisabled">Continue</BaseButton>
      </WrapperContainer>
    </form>
  </BaseLayout>
</template>
