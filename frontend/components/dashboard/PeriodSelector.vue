<template>
  <v-btn-group density="compact" variant="outlined" color="primary" class="period-selector">
    <v-btn
      v-for="opt in options"
      :key="opt.value"
      :variant="model === opt.value ? 'flat' : 'text'"
      :color="model === opt.value ? 'primary' : undefined"
      size="small"
      @click="model = opt.value"
    >
      {{ opt.short }}
    </v-btn>
    <v-btn
      :variant="model === 'custom' ? 'flat' : 'text'"
      :color="model === 'custom' ? 'primary' : undefined"
      size="small"
      @click="customDialog = true"
    >
      Custom
    </v-btn>
  </v-btn-group>

  <v-dialog v-model="customDialog" max-width="420">
    <v-card rounded="xl">
      <v-card-title class="text-h6">Custom Date Range</v-card-title>
      <v-card-text>
        <v-text-field v-model="customRange.from" type="date" label="From" variant="outlined" density="compact" class="mb-3" />
        <v-text-field v-model="customRange.to" type="date" label="To" variant="outlined" density="compact" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="customDialog = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="applyCustom">Apply</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: 'thisMonth' })

const emit = defineEmits<{ (e: 'custom', range: { from: string; to: string }): void }>()

const options = [
  { value: 'today', short: 'Today' },
  { value: '7d', short: '7D' },
  { value: '30d', short: '30D' },
  { value: 'thisMonth', short: 'Month' },
  { value: 'ytd', short: 'YTD' },
  { value: 'all', short: 'All' },
]

const customDialog = ref(false)
const customRange = ref({ from: '', to: '' })

function applyCustom() {
  model.value = 'custom'
  emit('custom', { ...customRange.value })
  customDialog.value = false
}
</script>

<style scoped>
.period-selector { display: inline-flex; }
</style>
