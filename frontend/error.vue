<template>
  <NuxtLayout name="auth">
    <div class="error-page">
      <div class="error-page__code">{{ error ? (error.statusCode || 500) : 500 }}</div>
      <h2 class="text-h5 font-weight-bold mt-4 mb-2 brand-title">
        {{ title }}
      </h2>
      <p class="text-body-1 text-medium-emphasis mb-6 brand-lede">
        {{ message }}
      </p>

      <div class="d-flex ga-3 justify-center">
        <v-btn
          variant="flat"
          color="primary"
          prepend-icon="mdi-home"
          @click="handleHome"
        >
          Go Home
        </v-btn>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-arrow-left"
          @click="handleBack"
        >
          Try Again
        </v-btn>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const title = computed(() => {
  const code = props.error?.statusCode
  if (code === 404) return 'Page Not Found'
  if (code === 403) return 'Access Denied'
  if (code === 500) return 'Server Error'
  if (code === 503) return 'Maintenance'
  return 'Something Went Wrong'
})

const message = computed(() => {
  const code = props.error?.statusCode
  if (code === 404) return 'The page you are looking for does not exist or may have been moved.'
  if (code === 403) return 'You do not have permission to access this resource. Contact your administrator if you believe this is an error.'
  if (code === 500) return 'An unexpected server error occurred. Please try again in a moment.'
  if (code === 503) return 'The system is temporarily down for maintenance. Please check back shortly.'
  return props.error?.message || 'An unexpected error occurred. Please try again.'
})

function handleHome() {
  clearError({ redirect: '/dashboard' })
}

function handleBack() {
  clearError()
}
</script>

<style scoped>
.error-page {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-page__code {
  font-size: 4.5rem;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #1976D2, #42A5F5);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
}
</style>
