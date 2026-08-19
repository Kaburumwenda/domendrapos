<template>
  <div class="position-fixed d-flex flex-column ga-2"
    style="position: fixed; top: 16px; right: 16px; z-index: 9999; min-width: 280px; max-width: 400px;">
    <TransitionGroup name="toast">
      <v-alert
        v-for="toast in toasts"
        :key="toast.id"
        :type="toast.type === 'warning' ? 'warning' : toast.type"
        :icon="iconFor(toast.type)"
        density="comfortable"
        closable
        @click:close="dismiss(toast.id)"
        class="mb-2"
        style="backdrop-filter: blur(12px);"
      >
        {{ toast.message }}
      </v-alert>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const toasts = useState<Toast[]>('toasts', () => [])
const { dismiss } = useToast()

function iconFor(type: string) {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'info': return 'mdi-information'
    default: return 'mdi-information'
  }
}
</script>
