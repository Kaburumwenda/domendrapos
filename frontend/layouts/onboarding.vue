<template>
  <v-app theme="light">
    <v-main class="auth3d-wrap">
      <Auth3DScene class="auth3d-bg" />

      <v-row no-gutters class="auth3d-row">
        <!-- Left side - branding overlay (above 3D scene) -->
        <v-col cols="12" md="5" class="onboard-brand d-none d-md-flex align-center justify-center pa-8">
          <div class="brand-glass" style="max-width: 26rem; position: relative; z-index: 10">
            <div class="d-flex align-center ga-3 mb-6">
              <div class="d-flex align-center justify-center brand-logo">
                <v-icon size="32" color="white">mdi-monitor</v-icon>
              </div>
              <h1 class="text-h5 font-weight-bold brand-title" style="letter-spacing: -0.02em">DomendraPOS</h1>
            </div>
            <h2 class="text-h6 font-weight-bold brand-title mb-3">Launch your store in minutes</h2>
            <p class="text-body-2 brand-lede mb-6">
              Get an isolated workspace with inventory, POS, billing, and analytics —
              ready to go in under a minute.
            </p>
            <div class="d-flex flex-column ga-3">
              <div v-for="benefit in benefits" :key="benefit.text" class="d-flex align-start ga-3">
                <div class="benefit-icon">
                  <v-icon size="16" color="white">{{ benefit.icon }}</v-icon>
                </div>
                <span class="benefit-text">{{ benefit.text }}</span>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Right side - onboarding form -->
        <v-col cols="12" md="7" class="onboard-content d-flex align-center justify-center pa-4 pa-sm-6">
          <div class="w-100" style="max-width: 34rem; position: relative; z-index: 10">
            <div class="glass-card">
              <OnboardingForm />
            </div>
            <p class="text-center text-caption mt-6 auth3d-footer">
              &copy; 2026 DomendraPOS. All rights reserved.
            </p>
          </div>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script setup>
const benefits = [
  { icon: 'mdi-shield-check-outline', text: 'Isolated Database schema per tenant' },
  { icon: 'mdi-package-variant-closed', text: 'Inventory, POS, and branch sync included' },
  { icon: 'mdi-chart-line', text: 'Real-time analytics and reports' },
  { icon: 'mdi-account-group-outline', text: 'Role-based access for your whole team' },
]
</script>

<style scoped>
.auth3d-wrap { position: relative; overflow: hidden; background: #f8fafc; }
.auth3d-bg { position: absolute; inset: 0; z-index: 0; }
.auth3d-row { position: relative; z-index: 2; min-height: 100vh; }

.brand-glass {
  background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  border: 1px solid rgba(125, 211, 252, 0.30);
  border-radius: 28px; padding: 36px 32px;
  box-shadow: 0 12px 40px rgba(30, 64, 175, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.65);
}
.brand-title { color: #0f172a; }
.brand-lede { color: #475569; }
.brand-logo {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 24px rgba(52, 120, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.30);
}
.benefit-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%);
  box-shadow: 0 4px 14px rgba(52, 120, 246, 0.30);
}
.benefit-text { color: #334155; font-size: 0.875rem; line-height: 1.45; }

.glass-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(203, 213, 225, 0.70);
  border-radius: 28px; padding: 40px 36px 32px;
  box-shadow:
    0 20px 60px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255, 255, 255, 0.80) inset;
  transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s ease;
}
.glass-card:hover {
  box-shadow:
    0 28px 80px rgba(15, 23, 42, 0.14),
    0 1px 0 rgba(255, 255, 255, 0.90) inset,
    0 0 0 1px rgba(52, 120, 246, 0.20);
}

.auth3d-footer { color: #94a3b8; }

@media (max-width: 959px) {
  .onboard-content { padding-top: 56px; padding-bottom: 32px; }
}
</style>
