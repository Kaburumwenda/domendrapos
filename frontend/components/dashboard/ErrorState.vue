<template>
  <div class="dash-error">
    <v-icon color="error" size="48">mdi-alert-circle-outline</v-icon>
    <h3 class="dash-error__title">{{ title }}</h3>
    <p class="dash-error__subtitle">{{ subtitle }}</p>
    <v-btn v-if="onRetry" color="primary" variant="flat" prepend-icon="mdi-refresh" @click="onRetry">
      Retry
    </v-btn>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  onRetry?: () => void
}

withDefaults(defineProps<Props>(), {
  title: 'Failed to load data',
  subtitle: 'Something went wrong while fetching the dashboard. Please try again.',
})
</script>

<style scoped>
.dash-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  gap: 12px;
}
.dash-error__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}
.dash-error__subtitle {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  max-width: 360px;
  margin: 0;
}
</style>
