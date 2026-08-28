<template>
  <v-card rounded="xl" flat border class="low-stock-card">
    <div class="low-stock-card__header">
      <GradientIcon icon="mdi-package-down" color="rose" />
      <div class="low-stock-card__titles">
        <h3 class="low-stock-card__title">Low Stock Alerts</h3>
        <p class="low-stock-card__subtitle">{{ items.length }} items need attention</p>
      </div>
      <v-btn variant="text" size="x-small" class="ml-auto" to="/inventory/low-stock" prepend-icon="mdi-arrow-right">
        View All
      </v-btn>
    </div>
    <v-card-text class="low-stock-card__body">
      <DashboardEmptyState
        v-if="!items.length && !loading"
        icon="mdi-check-circle-outline"
        icon-color="success"
        title="All stock levels are healthy!"
      />
      <v-skeleton-loader v-else-if="loading" type="list-item-three-line@6" boilerplate />
      <div v-else class="low-stock-list">
        <div v-for="(item, i) in limitedItems" :key="item.sku" class="low-stock-item dash-stagger-row" :style="{ animationDelay: `${0.05 + i * 0.04}s` }">
          <div class="low-stock-item__info">
            <p class="low-stock-item__name">{{ item.product }}</p>
            <p class="low-stock-item__sku">SKU: {{ item.sku }} · {{ item.branch }}</p>
          </div>
          <div class="low-stock-item__qty">
            <span class="low-stock-badge">{{ item.on_hand }}</span>
            <span class="low-stock-divider">/</span>
            <span class="low-stock-reorder">{{ item.reorder_level }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface LowStockItem {
  sku: string
  product: string
  branch: string
  on_hand: number
  reorder_level: number
}

interface Props {
  items: LowStockItem[]
  loading?: boolean
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  limit: 8,
})

const limitedItems = computed(() => props.items.slice(0, props.limit))
</script>

<style scoped>
.low-stock-card {
  display: flex;
  flex-direction: column;
  min-height: 380px;
  overflow: hidden;
}
.low-stock-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.low-stock-card__icon { width: 38px !important; height: 38px !important; border-radius: 10px !important; }
.low-stock-card__titles { flex: 1; min-width: 0; }
.low-stock-card__title {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.low-stock-card__subtitle {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-top: 1px;
}
.low-stock-card__body { flex: 1; padding: 14px 20px 16px; overflow-y: auto; }
.low-stock-list { display: flex; flex-direction: column; gap: 2px; }
@keyframes dash-stagger-in {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0); }
}
.dash-stagger-row {
  animation: dash-stagger-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}
.low-stock-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}
.low-stock-item:last-child { border-bottom: none; }
.low-stock-item__info { min-width: 0; flex: 1; }
.low-stock-item__name {
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.low-stock-item__sku {
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-top: 2px;
}
.low-stock-item__qty {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
  padding-left: 12px;
}
.low-stock-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
  animation: dash-badge-pulse 2s ease-in-out infinite;
}
.low-stock-divider { color: rgba(var(--v-theme-on-surface), 0.3); }
.low-stock-reorder { color: rgba(var(--v-theme-on-surface), 0.4); }
</style>
