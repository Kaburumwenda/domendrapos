<template>
  <v-app theme="light">
    <!-- Public top bar for documentation -->
    <v-app-bar flat density="comfortable" class="docs-appbar">
      <v-container class="d-flex align-center ga-3" style="max-width: 1600px">
        <div class="d-flex align-center ga-2 mr-4">
          <div class="brand-mini">D</div>
          <span class="text-h6 font-weight-bold brand-name">DomendraPOS</span>
          <v-chip size="x-small" variant="tonal" color="primary" class="ml-2">Docs</v-chip>
        </div>

        <v-spacer />

        <v-btn
          v-for="section in navSections"
          :key="section.id"
          variant="text"
          size="small"
          @click="scrollTo(section.id)"
        >
          {{ section.label }}
        </v-btn>

        <v-divider vertical class="mx-2 d-none d-sm-block" />

        <v-btn
          to="/login"
          variant="flat"
          color="primary"
          size="small"
          prepend-icon="mdi-login"
          class="docs-signin-btn"
        >
          Sign in
        </v-btn>

        <v-btn
          to="/signup"
          variant="outlined"
          size="small"
          class="d-none d-sm-flex"
        >
          Get started
        </v-btn>
    </v-container>
    </v-app-bar>

    <v-main>
      <v-container fluid class="px-4 px-md-8 py-6" style="max-width: 1600px">
        <slot />
      </v-container>

      <!-- Footer -->
      <v-footer class="docs-footer justify-center">
        <span class="text-body-2">
          © 2026 DomendraPOS — Multi-tenant SaaS Point-of-Sale Platform ·
          <a href="/login" class="docs-footer-link">Sign in</a>
        </span>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const navSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'modules', label: 'Modules' },
  { id: 'roles', label: 'Roles' },
  { id: 'api-and-exports', label: 'API and Exports' },
  { id: 'faq', label: 'FAQ' },
]

function scrollTo(id: string) {
  if (import.meta.client) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.docs-appbar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(203, 213, 225, 0.5);
}
.brand-mini {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #3478f6 0%, #1a5fd0 100%);
  color: white; font-weight: 800; font-size: 18px;
  box-shadow: 0 4px 12px rgba(52, 120, 246, 0.3);
}
.brand-name { color: #0f172a; }

.docs-signin-btn {
  border-radius: 10px; font-weight: 600;
}

.docs-footer {
  background: transparent; border-top: 1px solid rgba(203, 213, 225, 0.4);
  padding: 24px 0;
}
.docs-footer-link {
  color: #2563eb; text-decoration: none; font-weight: 600;
}
.docs-footer-link:hover { text-decoration: underline; }
</style>
