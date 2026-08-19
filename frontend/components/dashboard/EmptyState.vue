<template>
  <div class="dash-empty">
    <v-icon :color="iconColor" size="40">{{ icon }}</v-icon>
    <p class="dash-empty__title text-body-2 text-medium-emphasis mt-2">{{ title }}</p>
    <p v-if="subtitle" class="dash-empty__subtitle text-caption text-medium-emphasis">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  subtitle?: string
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  iconColor: 'grey-lighten-1',
})
</script>

<style scoped>
.dash-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}
.dash-empty__title { font-weight: 500; }
.dash-empty__subtitle { margin-top: 4px; }
</style>
