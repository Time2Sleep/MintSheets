<script setup lang="ts">
withDefaults(
  defineProps<{
    options: string[];
    placeholder?: string;
  }>(),
  {
    placeholder: '',
  },
);

const value = defineModel<string>();
</script>

<template>
  <select
    v-model="value"
    :aria-label="placeholder"
    class="select appearance-none block w-full bg-dark-primary text-light placeholder:text-light-secondary border border-dark-primary focus:outline-none focus:border-mint-primary rounded-xl p-3"
    :class="{ 'text-light-secondary': !value }"
  >
    <option value="" disabled selected hidden>{{ placeholder }}</option>
    <option v-for="option in options" :key="option" class="flex p-4" :value="option">
      {{ option }}
    </option>
  </select>
</template>

<style scoped>
.select {
  background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="rgb(167,167,167)"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 20px;
}

.select:focus {
  background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 15L12 9L18 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="rgb(167,167,167)"/></svg>');
}
</style>
