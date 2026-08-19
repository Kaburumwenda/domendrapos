<template>
  <v-chip
    :color="chipColor"
    size="small"
    label
  >
    {{ display || status }}
  </v-chip>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string
  display?: string
}>()

const chipColor = computed(() => {
  const map: Record<string, string> = {
    draft: '',
    pending: 'warning',
    approved: 'info',
    rejected: 'error',
    posted: 'success',
    cancelled: '',
  }
  return map[props.status] || ''
})
</script>
