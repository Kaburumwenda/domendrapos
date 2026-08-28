<template>
  <div class="login-content">
    <!-- Brand header (visible on all breakpoints; piggybacks on the glass card) -->
    <div class="d-flex align-center ga-3 mb-6">
      <div class="d-flex align-center justify-center logo-badge">
        <v-icon size="28" color="white">mdi-monitor</v-icon>
      </div>
      <div>
        <div class="text-h5 font-weight-bold brand-title">DomendraPOS</div>
        <div class="text-caption text-muted">Sign in to continue</div>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="text-h5 font-weight-semibold brand-title">Welcome back</h2>
      <p class="text-body-2 text-muted mt-1">Sign in to your DomendraPOS account</p>
    </div>

    <v-form @submit.prevent="handleLogin">
      <!-- Email -->
      <v-text-field
        v-model="form.email"
        label="Email address"
        type="email"
        variant="outlined"
        density="comfortable"
        placeholder="you@example.com"
        prepend-inner-icon="mdi-email-outline"
        class="mb-4 field-glass"
        :rules="[v => !!v || 'Email is required']"
      />

      <!-- Password -->
      <v-text-field
        v-model="form.password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        density="comfortable"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        @click:append-inner="showPassword = !showPassword"
        class="mb-2 field-glass"
        :rules="[v => !!v || 'Password is required']"
      />

      <div class="d-flex align-center justify-space-between mb-4">
        <v-checkbox
          v-model="form.remember"
          label="Remember me"
          density="compact"
          hide-details
          color="primary"
          class="remember-glass"
        />
        <a href="/forgot-password" class="text-body-2 text-link text-decoration-none">Forgot password?</a>
      </div>

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

      <!-- Submit -->
      <v-btn
        type="submit"
        block
        size="large"
        color="primary"
        :loading="loading"
        :disabled="loading"
        class="signin-btn"
      >
        Sign in
      </v-btn>
    </v-form>

    <!-- Sign up link -->
    <p class="text-center text-body-2 mt-6 text-muted">
      New to DomendraPOS?
      <NuxtLink to="/signup" class="signup-link">Create a workspace</NuxtLink>
    </p>

    <!-- Documentation / User Guidelines -->
    <v-divider class="my-6 docs-divider" />
    <div class="docs-cta d-flex align-center justify-center ga-2">
      <v-icon color="teal" size="20">mdi-book-open-page-variant-outline</v-icon>
      <span class="text-body-2 text-muted">First time here?</span>
      <NuxtLink to="/docs" class="docs-link font-weight-bold">Read the User Guidelines</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const toast = useToast()

const form = reactive({ email: '', password: '', remember: false })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.email, form.password)
  } catch (e: any) {
    error.value = e.data?.detail || 'Invalid credentials. Please try again.'
    loading.value = false
    return
  }
  loading.value = false
  toast.success('Welcome back!')
  // Redirect: superadmins → /superadmin, users with analytics → /dashboard,
  // everyone else (e.g. cashier without analytics) → /pos (checkout)
  let redirectTo = '/dashboard'
  if (auth.isSuperAdmin) {
    redirectTo = '/superadmin'
  } else if (!auth.isManager) {
    // Non-managers: check analytics permission (now available because login()
    // awaits fetchPermissions). If no analytics → /pos (their work area).
    // Fallback: if permissions failed to load, role-based guess.
    if (auth.canAccess('analytics')) {
      redirectTo = '/dashboard'
    } else if (auth.canAccess('sales')) {
      redirectTo = '/pos'
    } else {
      // No analytics and no sales access — go to profile as a safe default
      redirectTo = '/settings/profile'
    }
  }
  navigateTo(redirectTo)
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

:deep(.remember-glass .v-label) { color: #475569; }
:deep(.remember-glass .v-selection-control__input) { color: #3478f6; }

.text-link { color: #2563eb; font-weight: 600; }
.text-link:hover { color: #1d4ed8; }

.signup-link {
  color: #2563eb; font-weight: 700; text-decoration: none;
  transition: color 0.2s ease;
}
.signup-link:hover { color: #1d4ed8; text-decoration: underline; }

.docs-divider { border-color: rgba(203, 213, 225, 0.6); }
.docs-cta { flex-wrap: wrap; }
.docs-link {
  color: #0d9488; text-decoration: none;
  transition: color 0.2s ease;
}
.docs-link:hover { color: #0f766e; text-decoration: underline; }

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

/* Make Vuetify alert legible on light glass */
:deep(.v-alert) {
  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.30);
  color: #b91c1c;
}
</style>
