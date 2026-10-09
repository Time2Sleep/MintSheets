<script setup lang="ts">
import BaseLayout from '../../BaseLayout.vue';
import LinksList from '../../UI/LinksList.vue';

const links = [
  { name: 'Initial Balance and currency', to: '/settings/balance' },
  { name: 'Spending categories', to: '/settings/categories?type=spending' },
  { name: 'Income categories', to: '/settings/categories?type=income' },
];
</script>

<template>
  <BaseLayout>
    <LinksList :links="links" />
  </BaseLayout>
</template>
