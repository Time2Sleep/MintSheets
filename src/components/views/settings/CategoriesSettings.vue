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

const route = useRoute();
const type = route.query.type as TransactionType;

const financeStore = useCurrentFinanceStore();
const { categories } = storeToRefs(financeStore);

const list = ref(Object.entries(categories.value[type]));

const addNew = () => {
  list.value.push(['', '']);
};

const deleteCategory = (index: number) => {
  list.value.splice(index, 1);
};

const isLoading = ref(false);
const isError = ref(false);

const save = () => {
  isLoading.value = true;
  isError.value = false;

  const categoriesToSave = list.value.reduce(
    (acc, [category, goal]) => ({ ...acc, [category]: goal }),
    {} as Record<string, string>,
  );

  try {
    financeStore.saveCategories(categoriesToSave, type as TransactionType);
  } catch (error) {
    console.warn('Failed to save categories', error);

    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const isSaveDisabled = computed(() => {
  const hasEmpty = list.value.some(([category]) => !category);

  if (hasEmpty) return true;

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

    <BaseButton class="mt-auto" :disabled="isSaveDisabled" @click="save">Save</BaseButton>
  </BaseLayout>
</template>
