<script setup lang="ts">
import { storeToRefs } from 'pinia';
import BaseButton from '../UI/BaseButton.vue';
import { loginWithGoogle, refreshGoogleToken } from '../../services/googleAuth';
import { useGoogleStore } from '../../stores/google';
import { computed, nextTick } from 'vue';
import { SessionStatus } from '../../types/auth';
import { logout } from '../../services/application';

const googleStore = useGoogleStore();
const { hasCachedSession, sessionStatus } = storeToRefs(googleStore);

const connecting = computed(() => sessionStatus.value === SessionStatus.INITIALIZING);

const relogin = async () => {
  logout(true);
  await nextTick();
  loginWithGoogle();
};
</script>

<template>
  <div class="flex flex-col items-center h-full justify-center gap-8">
    <h1 class="text-2xl">Welcome to MintSheets</h1>

    <BaseButton v-if="connecting" :disabled="true"> Connecting... </BaseButton>
    <BaseButton v-else-if="!hasCachedSession" @click="loginWithGoogle"> Connect spreadhseet </BaseButton>
    <template v-else>
      <BaseButton @click="refreshGoogleToken"> Continue </BaseButton>
      <BaseButton visual="link" @click="relogin">Connect another spreadsheet</BaseButton>
    </template>

    <div v-if="sessionStatus === SessionStatus.ERROR" class="text-red-primary">
      Sorry, something went wrong there. Try again.
    </div>
  </div>
</template>
