<template>
  <div class="login-content">
    <!-- Brand header -->
    <div class="d-flex align-center ga-3 mb-6">
      <div class="d-flex align-center justify-center logo-badge">
        <v-icon size="28" color="white">mdi-monitor</v-icon>
      </div>
      <div>
        <div class="text-h5 font-weight-bold brand-title">DomendraPOS</div>
        <div class="text-caption text-muted">Password Recovery</div>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="text-h5 font-weight-semibold brand-title">Forgot Password</h2>
      <p class="text-body-2 text-muted mt-1">
        Enter your email address and we'll send you a link to reset your password.
      </p>
    </div>

    <!-- Success state -->
    <div v-if="sent" class="text-center py-8">
      <v-icon size="56" color="success" class="mb-4">mdi-email-check-outline</v-icon>
      <h3 class="text-h6 font-weight-bold brand-title mb-2">Check Your Email</h3>
      <p class="text-body-2 text-muted mb-6">
        If an account exists for <strong>{{ form.email }}</strong>, a password reset link has been sent.
        Check your inbox (and spam folder) for the email.
      </p>
      <v-btn variant="tonal" color="primary" rounded="lg" prepend-icon="mdi-arrow-left" @click="navigateTo('/login')">
        Back to Login
      </v-btn>
    </div>

    <!-- Form state -->
    <v-form v-else @submit.prevent="handleSubmit">
      <v-text-field
        v-model="form.email"
        label="Email address"
        type="email"
        variant="outlined"
        density="comfortable"
        placeholder="you@example.com"
        prepend-inner-icon="mdi-email-outline"
        class="mb-4 field-glass"
        :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Enter a valid email']"
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
        Send Reset Link
      </v-btn>
    </v-form>

    <p class="text-center text-body-2 mt-6 text-muted">
      Remember your password?
      <NuxtLink to="/login" class="signup-link">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const config = useRuntimeConfig()

const form = reactive({ email: '' })
const loading = ref(false)
const error = ref('')
const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch(`${config.public.apiBase}/auth/forgot-password/`, {
      method: 'POST',
      body: { email: form.email },
    })
    sent.value = true
  } catch (e: any) {
    // For security, the API always returns 200 even if the email doesn't exist.
    // But in case of a network error, show it.
    if (e?.statusCode >= 500) {
      error.value = 'A server error occurred. Please try again later.'
    } else {
      // Treat as success for UX (don't reveal which emails exist)
      sent.value = true
    }
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

.signup-link {
  color: #2563eb; font-weight: 700; text-decoration: none;
  transition: color 0.2s ease;
}
.signup-link:hover { color: #1d4ed8; text-decoration: underline; }

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
