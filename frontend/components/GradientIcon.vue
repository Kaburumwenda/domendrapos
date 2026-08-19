<template>
  <div class="gradient-icon" :class="`gradient-icon--${color}`">
    <v-icon size="20">{{ icon }}</v-icon>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'teal' | 'rose' | 'amber' | 'indigo'
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
})
</script>

<style scoped>
.gradient-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary)));
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.gradient-icon--primary   { background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.85)); box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.28); }
.gradient-icon--success   { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.28); }
.gradient-icon--warning   { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.28); }
.gradient-icon--error     { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.28); }
.gradient-icon--info      { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.28); }
.gradient-icon--secondary { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.28); }
.gradient-icon--teal      { background: linear-gradient(135deg, #14b8a6, #0d9488); box-shadow: 0 4px 12px rgba(20, 184, 166, 0.28); }
.gradient-icon--rose      { background: linear-gradient(135deg, #f43f5e, #e11d48); box-shadow: 0 4px 12px rgba(244, 63, 94, 0.28); }
.gradient-icon--amber     { background: linear-gradient(135deg, #fbbf24, #f59e0b); box-shadow: 0 4px 12px rgba(251, 191, 36, 0.28); }
.gradient-icon--indigo    { background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.28); }
</style>
