<script setup lang="ts">
import { reactive, ref } from 'vue';
import { CURRENCIES } from '../../constants/currencies';
import BaseButton from '../UI/BaseButton.vue';
import BaseInput from '../UI/BaseInput.vue';
import BaseSelect from '../UI/BaseSelect.vue';
import EditableList from '../blocks/EditableList.vue';
import WrapperContainer from '../UI/WrapperContainer.vue';
import { useCurrentFinanceStore } from '../../stores/financeStoreRegistry';
import { router } from '../../router';

const steps = [
  {
    title: 'Starting Balance',
    description: 'Set your current balance and choose your currency',
    required: true,
  },
  {
    title: 'Spending Categories',
    description: 'Organize your expenses into categories that fit your lifestyle',
    required: true,
  },
  {
    title: 'Spending Goals',
    description: 'Set spending limits for each category to keep your expenses under control',
    required: false,
  },
  {
    title: 'Income Categories',
    description: 'Create categories to track where your money comes from',
    required: true,
  },
  {
    title: 'Income Goals',
    description: 'Set income goals for each category and track your progress',
    required: false,
  },
] as const;

const currentStep = ref(0);

const settings = reactive({
  balance: '',
  currency: CURRENCIES[0],
  spendingCategories: {} as Record<string, string>,
  incomeCategories: {} as Record<string, string>,
});

const isLoading = ref<boolean>(false);
const isNextDisabled = () => {
  if (isLoading.value) return true;

  const step = steps[currentStep.value];

  if (step.required) {
    switch (currentStep.value) {
      case 0:
        return +settings.balance < 0 || !settings.currency;
      case 1:
        return Object.keys(settings.spendingCategories).length === 0;
      case 3:
        return Object.keys(settings.incomeCategories).length === 0;
    }
  }

  return false;
};

const financeStore = useCurrentFinanceStore();
const { saveSettings } = financeStore;
const isError = ref<boolean>(false);
const handleFinish = async () => {
  isLoading.value = true;

  const saved = await saveSettings({
    ...settings,
    currency: settings.currency.code,
  });

  if (!saved) {
    isError.value = true;
    isLoading.value = false;
    return;
  }

  router.push({ name: 'main' });
};
</script>
<template>
  <div class="flex flex-col h-full pt-6 pb-12 gap-4">
    <div class="text-lg text-center w-full">Welcome to MintSheets!</div>

    <div class="w-[50%] mx-auto h-2 bg-dark-secondary rounded" aria-label="Progress bar">
      <div
        class="h-full bg-mint-primary rounded transition-all duration-300 ease-in-out"
        :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
      ></div>
    </div>

    <div>
      <div class="mb-2">{{ steps[currentStep].title }}</div>
      <div class="text-sm">{{ steps[currentStep].description }}</div>
      <div v-if="!steps[currentStep].required" class="mt-2 text-gray-500 text-xs">You can skip this step for now.</div>
    </div>

    <WrapperContainer v-if="currentStep === 0" :gap="2">
      <BaseInput
        v-model.number="settings.balance"
        name="balance"
        placeholder="100 000"
        type="number"
        label="Initial balance"
      />
      <BaseSelect v-model="settings.currency" name="currency" label="Currency" :options="CURRENCIES" label-key="name" />
    </WrapperContainer>

    <WrapperContainer v-else-if="currentStep === 1" class="flex-grow overflow-y-hidden" :gap="2">
      <EditableList
        :model-value="Object.keys(settings.spendingCategories)"
        placeholder="Food"
        name="spendingCategories"
        empty-text="Add at least one spending category"
        max-height="calc(100% - 60px)"
        @on-add="(value) => (settings.spendingCategories[value] = '')"
        @on-delete="(value) => delete settings.spendingCategories[value]"
      />
    </WrapperContainer>

    <WrapperContainer v-else-if="currentStep === 2" :gap="2" class="flex-grow overflow-y-auto">
      <div v-for="(goal, category) in settings.spendingCategories" :key="category" class="flex gap-2 items-center">
        <div class="flex-2 leading-none">{{ category }}</div>
        <BaseInput
          :model-value="goal"
          class="flex-1"
          type="number"
          placeholder="0"
          name="spendingGoals"
          @update:model-value="(value) => (settings.spendingCategories[category] = value ? `${value}` : '')"
        />
      </div>
    </WrapperContainer>

    <WrapperContainer v-else-if="currentStep === 3" :gap="2" class="flex-grow overflow-y-hidden">
      <EditableList
        :model-value="Object.keys(settings.incomeCategories)"
        placeholder="Salary"
        name="incomeCategories"
        empty-text="Add at least one income category"
        max-height="20vh"
        @on-add="(value) => (settings.incomeCategories[value] = '')"
        @on-delete="(value) => delete settings.incomeCategories[value]"
      />
    </WrapperContainer>

    <WrapperContainer v-else-if="currentStep === 4" :gap="2" class="flex-grow overflow-y-auto">
      <div v-for="(goal, category) in settings.incomeCategories" :key="category" class="flex gap-2 items-center">
        <div class="flex-2 leading-none">{{ category }}</div>
        <BaseInput
          :model-value="goal"
          class="flex-1"
          type="number"
          placeholder="0"
          name="incomeGoals"
          @update:model-value="(value) => (settings.incomeCategories[category] = value ? `${value}` : '')"
        />
      </div>
    </WrapperContainer>

    <div v-if="isError" class="text-red-primary">Something went wrong, try again...</div>

    <div class="mt-auto">
      <div class="flex justify-between" :class="{ 'justify-end': !currentStep }">
        <BaseButton v-if="currentStep !== 0" visual="link" @click="currentStep--">Back</BaseButton>
        <BaseButton v-if="currentStep + 1 === steps.length" :disabled="isNextDisabled()" @click="handleFinish">
          Finish
        </BaseButton>
        <BaseButton v-else :disabled="isNextDisabled()" @click="currentStep++">Next</BaseButton>
      </div>
    </div>
  </div>
</template>
