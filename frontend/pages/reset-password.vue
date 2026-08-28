<template>
  <div class="login-content">
    <!-- Brand header -->
    <div class="d-flex align-center ga-3 mb-6">
      <div class="d-flex align-center justify-center logo-badge">
        <v-icon size="28" color="white">mdi-monitor</v-icon>
      </div>
      <div>
        <div class="text-h5 font-weight-bold brand-title">DomendraPOS</div>
        <div class="text-caption text-muted">Set a New Password</div>
      </div>
    </div>

    <!-- Success state -->
    <div v-if="success" class="text-center py-8">
      <v-icon size="56" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold brand-title mb-2">Password Reset!</h3>
      <p class="text-body-2 text-muted mb-6">
        Your password has been reset successfully. You can now log in with your new password.
      </p>
      <v-btn variant="tonal" color="primary" rounded="lg" prepend-icon="mdi-login" @click="navigateTo('/login')">
        Go to Login
      </v-btn>
    </div>

    <!-- Form state -->
    <div v-else-if="!validToken" class="text-center py-8">
      <v-icon size="56" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold brand-title mb-2">Invalid Link</h3>
      <p class="text-body-2 text-muted mb-6">
        This password reset link is invalid or has expired.
      </p>
      <v-btn variant="tonal" color="primary" rounded="lg" prepend-icon="mdi-refresh" @click="navigateTo('/forgot-password')">
        Request New Link
      </v-btn>
    </div>

    <!-- Reset form -->
    <div v-else>
      <div class="mb-6">
        <h2 class="text-h5 font-weight-semibold brand-title">Reset Password</h2>
        <p class="text-body-2 text-muted mt-1">Enter your new password below.</p>
      </div>

      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="form.password"
          label="New password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          placeholder="Enter your new password"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          class="mb-4 field-glass"
          :rules="[
            v => !!v || 'Password is required',
            v => v.length >= 8 || 'Password must be at least 8 characters',
          ]"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-text-field
          v-model="form.confirmPassword"
          label="Confirm new password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          placeholder="Re-enter your new password"
          prepend-inner-icon="mdi-lock-check-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          class="mb-4 field-glass"
          :rules="[
            v => !!v || 'Please confirm your password',
            v => v === form.password || 'Passwords do not match',
          ]"
          @click:append-inner="showPassword = !showPassword"
        />

        <!-- Error -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="comfortable"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <v-btn
          type="submit"
          block
          size="large"
          color="primary"
          :loading="loading"
          :disabled="loading"
          class="signin-btn"
        >
          Reset Password
        </v-btn>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()

const token = computed(() => (route.query.token as string) || '')
const validToken = computed(() => !!token.value)

const form = reactive({ password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')
const success = ref(false)
const showPassword = ref(false)

async function handleSubmit() {
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await $fetch(`${config.public.apiBase}/auth/reset-password/`, {
      method: 'POST',
      body: { token: token.value, password: form.password },
    })
    success.value = true
    toast.success('Password reset successfully!')
  } catch (e: any) {
    const msg = e?.data?.detail || e?.data?.password?.[0] || 'Failed to reset password. Please try again.'
    error.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.brand-title { color: #0f172a; }
.text-muted { color: #64748b; }

.logo-badge {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%);
  box-shadow: 0 8px 24px rgba(52, 120, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

:deep(.field-glass .v-field) {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(203, 213, 225, 0.90);
  border-radius: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
:deep(.field-glass .v-field:hover) { border-color: rgba(52, 120, 246, 0.50); }
:deep(.field-glass .v-field--focused) {
  border-color: #3478f6;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(52, 120, 246, 0.12);
}
:deep(.field-glass .v-field__input) { color: #0f172a; }
:deep(.field-glass .v-field input::placeholder) { color: rgba(100, 116, 139, 0.60); }
:deep(.field-glass .v-icon) { color: rgba(100, 116, 139, 0.90); opacity: 1; }
:deep(.field-glass .v-label) { color: rgba(71, 85, 105, 0.80); }
:deep(.field-glass .v-label--active) { color: #3478f6; }

.signin-btn {
  border-radius: 14px; font-weight: 700; letter-spacing: 0.02em;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%) !important;
  box-shadow: 0 10px 30px rgba(52, 120, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.signin-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 36px rgba(52, 120, 246, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

:deep(.v-alert) {
  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.30);
  color: #b91c1c;
}
</style>
