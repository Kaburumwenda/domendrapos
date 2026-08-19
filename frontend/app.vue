<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
// Global state for toasts
const toasts = useState<Toast[]>('toasts', () => [])
</script>
