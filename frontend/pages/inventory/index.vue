<template>
  <div />
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
// Redirect the legacy /inventory tabbed page to the Stock on Hand sub-page.
onMounted(() => navigateTo('/inventory/stock', { replace: true }))
</script>
