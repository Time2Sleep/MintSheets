<script setup lang="ts">
import { ref } from 'vue';
import BaseInput from './UI/BaseInput.vue';
import BaseSelect from './UI/BaseSelect.vue';
import FinanceCard from './UI/FinanceCard.vue';
import WrapperContainer from './UI/WrapperContainer.vue';
import BaseButton from './UI/BaseButton.vue';

const select = ref<string>('');
</script>

<template>
  <div class="flex flex-col gap-4 px-4 py-6">
    <h1 class="text-2xl">Hello, User!</h1>

    <div class="flex gap-4">
      <FinanceCard class="flex-1" title="Spending" :value="100000" bar-color-class="bg-red-primary" />

      <FinanceCard class="flex-1" title="Income" :value="100000" bar-color-class="bg-mint-primary" />
    </div>

    <WrapperContainer :gap="4">
      <BaseInput placeholder="Input 1" />
      <BaseSelect v-model="select" placeholder="Select 1" :options="['option 1', 'option 2']" />
      <BaseInput placeholder="Input 2" />
      <BaseInput placeholder="Input 3" />
      <BaseButton>Confirm</BaseButton>
    </WrapperContainer>

    <WrapperContainer> List of transactions will be here... </WrapperContainer>
  </div>
</template>
