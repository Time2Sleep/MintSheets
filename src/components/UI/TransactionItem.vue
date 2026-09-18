<script setup lang="ts">
import { TransactionTypes, type Transaction } from '../../types/finances';

defineProps<{
  title: string;
  data: Transaction[];
  currency: string;
}>();
</script>

<template>
  <h2 class="text-xl pb-3">{{ title }}</h2>

  <div
    v-for="{ id, amount, comment, category, type, pending } in data"
    :key="id"
    class="flex justify-between items-center pb-1"
    :class="{ 'animate-pulse': pending }"
  >
    <div>
      <div>{{ comment }}</div>
      <div class="text-light-secondary text-xs">{{ category }}</div>
    </div>

    <div class="text-xl" :class="{ 'text-green-primary': type === TransactionTypes.INCOME }">
      <span>{{ type === TransactionTypes.INCOME ? '+' : '-' }}</span>
      <span>{{ amount }} {{ currency }}</span>
    </div>
  </div>
</template>
