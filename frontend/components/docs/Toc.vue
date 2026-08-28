<template>
  <div class="toc-nav">
    <v-card rounded="xl" flat border class="pa-4">
      <div class="text-overline text-medium-emphasis mb-2 px-1">On this page</div>
      <v-list density="compact" class="toc-list" :items="items" @click:select="onSelect" />
    </v-card>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sections: { id: string; title: string; level?: number }[]
}>()

type ListItem = {
  title: string
  value: string
  props: {prependIcon?: string;class?: string}
}

const items = computed<ListItem[]>(() =>
  props.sections.map(s => ({
    title: s.title,
    value: s.id,
    props: {
      class: s.level === 2 ? 'toc-sub' : 'toc-main',
    },
  })),
)

function onSelect(item: { id: string; value: string }) {
  if (import.meta.client) {
    const el = document.getElementById(item.value as string)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.toc-nav { position: sticky; top: 80px; }

.toc-list :deep(.toc-sub) {
  padding-left: 24px !important; font-size: 13px !important; color: #64748b;
}
.toc-list :deep(.toc-main) {
  font-weight: 600; font-size: 14px;
}
.toc-list :deep(.v-list-item--active) {
  color: rgb(var(--v-theme-primary));
}
</style>
