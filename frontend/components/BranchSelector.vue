<template>
  <v-select
    v-model="branchStore.branchId"
    :items="branchStore.branchOptions"
    item-title="name"
    item-value="id"
    :loading="branchStore.loading"
    variant="outlined"
    density="compact"
    hide-details
    rounded="lg"
    prepend-inner-icon="mdi-store-outline"
    class="branch-selector"
    @update:model-value="onChange"
  />
</template>

<script setup lang="ts">
const branchStore = useBranchStore()

onMounted(() => {
  if (!branchStore.loaded && !branchStore.loading) {
    branchStore.init()
  }
})

function onChange(id: number | null) {
  const br = branchStore.branches.find(b => b.id === id)
  branchStore.setBranch(id, br?.name)
}
</script>

<style scoped>
.branch-selector {
  max-width: 180px;
  min-width: 140px;
}
</style>
