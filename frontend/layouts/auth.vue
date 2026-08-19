<template>
  <v-app>
    <v-main class="auth3d-wrap">
      <Auth3DScene class="auth3d-bg" />

      <v-row no-gutters class="auth3d-row">
        <!-- Left side - branding overlay (above 3D scene) -->
        <v-col cols="12" md="6" class="auth3d-brand d-none d-md-flex align-center justify-center pa-12">
          <div class="brand-glass" style="max-width: 30rem; position: relative; z-index: 10">
            <div class="d-flex align-center ga-3 mb-8">
              <div class="d-flex align-center justify-center brand-logo">
                <v-icon size="32" color="white">mdi-monitor</v-icon>
              </div>
              <h1 class="text-h4 font-weight-bold brand-title" style="letter-spacing: -0.02em">DomendraPOS</h1>
            </div>
            <p class="text-h6 mb-8 brand-lede">
              The complete multi-tenant Point-of-Sale platform for modern retail.
            </p>
            <div class="d-flex flex-column ga-4">
              <div v-for="feature in features" :key="feature" class="d-flex align-center ga-3">
                <div class="d-flex align-center justify-center feature-chip">
                  <v-icon size="20" color="white">mdi-check</v-icon>
                </div>
                <span class="feature-text">{{ feature }}</span>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Right side - content (glass card) -->
        <v-col cols="12" md="6" class="auth3d-content d-flex align-center justify-center pa-4 pa-sm-6">
          <div class="w-100" style="max-width: 30rem; position: relative; z-index: 10">
            <div class="glass-card">
              <slot />
            </div>
            <p class="text-center text-caption mt-6 auth3d-footer">
              &copy; 2026 DomendraPOS. All rights reserved.
            </p>
          </div>
        </v-col>
      </v-row>

      <!-- small floating theme switch hint (read during 3D scene) -->
    </v-main>
  </v-app>
</template>

<script setup>
const features = [
  'Multi-branch inventory sync',
  'Built-in payments and billing',
  'Real-time analytics dashboard',
  'Role-based access control',
  'Customer loyalty and CRM',
]
</script>

<style scoped>
.auth3d-wrap { position: relative; overflow: hidden; background: #f8fafc; }
.auth3d-bg { position: absolute; inset: 0; z-index: 0; }
.auth3d-row { position: relative; z-index: 2; min-height: 100vh; }

.auth3d-brand { position: relative; }
.brand-glass {
  background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  border: 1px solid rgba(125, 211, 252, 0.30);
  border-radius: 28px; padding: 40px 36px;
  box-shadow: 0 12px 40px rgba(30, 64, 175, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.65);
}
.brand-logo {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 24px rgba(52, 120, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.30);
}
.brand-title { color: #0f172a; }
.brand-lede { color: #475569; line-height: 1.6; }
.feature-chip {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%);
  box-shadow: 0 6px 16px rgba(52, 120, 246, 0.30);
}
.feature-text { color: #334155; font-weight: 500; }

.auth3d-content { position: relative; }
.glass-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(203, 213, 225, 0.70);
  border-radius: 28px; padding: 44px 40px 36px;
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

/* On mobile, hide right-side card background tint so the card floats above the 3D scene full-bleed */
@media (max-width: 959px) {
  .auth3d-content { padding-top: 84px; padding-bottom: 32px; }
}
</style>
