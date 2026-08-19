<template>
  <v-card rounded="xl" flat border class="chart-card">
    <div class="chart-card__header">
      <GradientIcon :icon="icon" :color="color" class="chart-card__icon" />
      <div class="chart-card__titles">
        <h3 class="chart-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="chart-card__subtitle">{{ subtitle }}</p>
      </div>
      <v-btn
        v-if="to"
        variant="text"
        size="x-small"
        class="ml-auto"
        :to="to"
        prepend-icon="mdi-arrow-right"
      >
        View
      </v-btn>
      <v-btn
        v-else-if="onView"
        variant="text"
        size="x-small"
        class="ml-auto"
        prepend-icon="mdi-arrow-right"
        @click="onView"
      >
        View
      </v-btn>
    </div>
    <v-card-text class="chart-card__body">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
type ChartColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'teal' | 'rose' | 'amber' | 'indigo'

interface Props {
  icon: string
  title: string
  subtitle?: string
  color?: ChartColor
  to?: string
  onView?: () => void
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  subtitle: '',
  to: '',
})
</script>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  min-height: 380px;
  overflow: hidden;
}
.chart-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.chart-card__icon { width: 38px !important; height: 38px !important; border-radius: 10px !important; }
.chart-card__titles { flex: 1; min-width: 0; }
.chart-card__title {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.chart-card__subtitle {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-top: 1px;
}
.chart-card__body {
  flex: 1;
  padding: 14px 20px 20px;
}
</style>
