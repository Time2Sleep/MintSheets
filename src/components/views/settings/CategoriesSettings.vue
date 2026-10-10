<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseLayout from '../../BaseLayout.vue';
import { useCurrentFinanceStore } from '../../../stores/financeStoreRegistry.ts';
import { storeToRefs } from 'pinia';
import BaseIcon from '../../UI/BaseIcon.vue';
import WrapperContainer from '../../UI/WrapperContainer.vue';
import BaseInput from '../../UI/BaseInput.vue';
import BaseButton from '../../UI/BaseButton.vue';
import { useRoute } from 'vue-router';
import type { TransactionType } from '../../../types/finances';
import { useAsyncAction } from '../../../composables/useAsyncAction';

const route = useRoute();
const type = route.query.type as TransactionType;
const isValidType = type === 'spending' || type === 'income';

const financeStore = useCurrentFinanceStore();
const { categories } = storeToRefs(financeStore);

const list = ref(isValidType ? Object.entries(categories.value[type]) : []);

const addNew = () => {
  list.value.push(['', '']);
};

const deleteCategory = (index: number) => {
  list.value.splice(index, 1);
};

const { isError, isLoading, isSuccess, execute } = useAsyncAction();

const save = async () => {
  const categoriesToSave = list.value
    .filter(([category]) => category)
    .reduce((acc, [category, goal]) => ({ ...acc, [category]: goal }), {} as Record<string, string>);

  await execute(() => financeStore.saveCategories(categoriesToSave, type as TransactionType));
};

const isSaveDisabled = computed(() => {
  if (isLoading.value) return true;

  const namesCounts = list.value.reduce(
    (acc, [category]) => {
      const key = category.toLowerCase();

      if (acc[key]) {
        acc[key]++;
        return acc;
      }

      return { ...acc, [key]: 1 };
    },
    {} as Record<string, number>,
  );

  const hasDuplicates = Object.values(namesCounts).some((count) => count > 1);

  return hasDuplicates;
});
</script>

<template>
  <BaseLayout :title="`${type} categories`">
    <WrapperContainer v-if="!(type === 'spending' || type === 'income')">Something went wrong...</WrapperContainer>

    <WrapperContainer v-else :gap="2" class="relative overflow-y-auto pt-0">
      <div class="grid grid-cols-[4fr_4fr_1fr_1fr] gap-2 sticky top-0 left-0 pt-2 bg-dark-secondary z-1">
        <div>Name</div>
        <div>Goal</div>
      </div>

      <div v-for="(_, index) in list" :key="index" class="grid grid-cols-[4fr_5fr_1fr] gap-2 items-center">
        <BaseInput v-model="list[index][0]" placeholder="Food" name="categoryName" />
        <BaseInput v-model.number="list[index][1]" placeholder="0" name="categoryGoal" type="number" />

        <BaseIcon icon="trash" @click="deleteCategory(index)" />
      </div>

      <BaseButton class="mt-2" @click="addNew">Add new category</BaseButton>
    </WrapperContainer>

    <div class="mt-auto w-full">
      <div v-if="isError" class="text-red-primary mb-2">Something went wrong, try again.</div>
      <div v-if="isSuccess" class="text-green-primary mb-2">Saved successfully.</div>

      <BaseButton class="w-full" :disabled="isSaveDisabled" @click="save">
        {{ isLoading ? 'Saving...' : 'Save' }}
      </BaseButton>
    </div>
  </BaseLayout>
</template>
