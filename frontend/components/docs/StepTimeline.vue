<template>
  <v-card rounded="xl" flat border class="pa-4 section-card">
    <v-timeline align="start" density="compact" class="mt-2">
      <v-timeline-item
        v-for="(step, i) in steps"
        :key="i"
        size="small"
        :dot-color="step.color || 'primary'"
        :icon="step.icon || 'mdi-numeric-' + (i + 1) + '-circle'"
      >
        <div class="mb-2">
          <div class="d-flex align-center ga-2">
            <span class="text-subtitle-1 font-weight-bold">{{ step.title }}</span>
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ step.description }}</div>
          <v-alert
            v-if="step.tip"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-2"
            icon="mdi-lightbulb-on-outline"
          >
            {{ step.tip }}
          </v-alert>
        </div>
      </v-timeline-item>
    </v-timeline>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  steps: {
    title: string
    description: string
    icon?: string
    color?: string
    tip?: string
  }[]
}>()
</script>

<style scoped>
.section-card { background: #ffffff; }
</style>
