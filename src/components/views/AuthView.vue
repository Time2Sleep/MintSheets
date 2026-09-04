<script setup lang="ts">
import { storeToRefs } from 'pinia';
import BaseButton from '../UI/BaseButton.vue';
import { loginWithGoogle, refreshGoogleToken } from '../../services/googleAuth';
import { useGoogleStore } from '../../stores/google';

const googleStore = useGoogleStore();
const { isAuthError, mintsWasConnected } = storeToRefs(googleStore);
</script>

<template>
  <div class="flex flex-col items-center h-full justify-center gap-8">
    <h1 class="text-2xl">Welcome to MintSheets</h1>

    <BaseButton v-if="!mintsWasConnected" @click="loginWithGoogle">Connect Google Sheets</BaseButton>
    <BaseButton v-else @click="refreshGoogleToken">Continue</BaseButton>

    <div v-if="isAuthError" class="text-red-primary">Sorry, something went wrong there. Try again.</div>
  </div>
</template>
