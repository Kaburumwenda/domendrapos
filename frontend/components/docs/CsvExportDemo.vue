<template>
  <v-card rounded="xl" flat border class="pa-6 csv-demo-card">
    <div class="d-flex align-center mb-2 ga-2">
      <v-icon color="success" size="24">mdi-file-delimited-outline</v-icon>
      <span class="text-h6 font-weight-bold">{{ title }}</span>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-4">{{ description }}</p>

    <!-- Live data preview -->
    <v-data-table
      :headers="headers"
      :items="rows"
      density="compact"
      class="mb-4 csv-table"
      items-per-page="5"
    />

    <!-- CSV preview -->
    <v-btn
      color="success"
      variant="flat"
      prepend-icon="mdi-download"
      @click="exportCsv(filename, rows, { columns: columns })"
    >
      Download CSV
    </v-btn>
    <v-btn
      variant="outlined"
      class="ml-2"
      prepend-icon="mdi-eye-outline"
      @click="showPreview = !showPreview"
    >
      {{ showPreview ? 'Hide' : 'Preview' }} CSV
    </v-btn>

    <v-expand-transition>
      <div v-show="showPreview">
        <pre class="csv-preview mt-3">{{ csvText }}</pre>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  filename?: string
  rows: Record<string, any>[]
  columns: string[]
}>(), {
  title: 'CSV Export Demo',
  description: 'Export sample data as a CSV file for spreadsheet analysis or record-keeping.',
  filename: 'export.csv',
})

const showPreview = ref(false)

const headers = computed(() =>
  props.columns.map(c => ({
    title: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' '),
    key: c,
    sortable: true,
  })),
)

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let str = typeof value === 'string' ? value : String(value)
  if (/["\n\r,]/.test(str)) str = `"${str.replace(/"/g, '""')}"`
  return str
}

const csvText = computed(() => {
  const header = props.columns.map(c => escapeCell(c)).join(',')
  const body = props.rows.map(r => props.columns.map(c => escapeCell(r[c])).join(',')).join('\n')
  return `${header}\n${body}`
})
</script>

<style scoped>
.csv-demo-card { background: #ffffff; }

.csv-table :deep(th) {
  background: #f8fafc; font-weight: 600;
}

.csv-preview {
  background: #0f172a; color: #94a3b8;
  padding: 16px; border-radius: 12px;
  font-size: 13px; line-height: 1.6;
  overflow-x: auto; white-space: pre;
  font-family: 'Cascadia Code', 'Consolas', monospace;
}
</style>
