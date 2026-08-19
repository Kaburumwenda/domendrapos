<template>
  <div class="d-flex align-center justify-space-between px-4 py-3 border-t-thin">
    <!-- Left: count info -->
    <div class="text-body-2 text-medium-emphasis">
      <span class="font-weight-medium text-medium-emphasis-high">{{ count }}</span> items total
      <span class="d-none d-sm-inline ml-2">— Page {{ page }} of {{ totalPages }}</span>
    </div>

    <!-- Right: pagination -->
    <v-pagination
      :model-value="page"
      :length="totalPages"
      :total-visible="7"
      density="compact"
      @update:model-value="$emit('page-change', $event)"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  count: { type: Number, default: 0 },
  next: { type: String, default: null },
  previous: { type: String, default: null },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  totalPages: { type: Number, default: 1 },
})

defineEmits(['page-change'])
</script>
