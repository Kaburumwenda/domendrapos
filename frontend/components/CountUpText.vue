<template>
  <span>{{ formatted }}</span>
</template>

<script setup lang="ts">
interface Props {
  value: number
  format?: 'currency' | 'number' | 'percent' | 'none'
  decimals?: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  format: 'none',
  decimals: 0,
  duration: 800,
})

const { currency, number, percent } = useFormat()

const source = computed(() => Number(props.value) || 0)
const animated = useCountUp(() => source.value, props.duration)

const formatted = computed(() => {
  switch (props.format) {
    case 'currency':
      return currency(animated.value)
    case 'number':
      return number(Math.round(animated.value))
    case 'percent':
      return percent(animated.value, props.decimals)
    default:
      return props.decimals > 0 ? animated.value.toFixed(props.decimals) : number(Math.round(animated.value))
  }
})
</script>
