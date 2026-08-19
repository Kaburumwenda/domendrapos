<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-progress-circular indeterminate color="primary" size="48" width="4" />
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
const accessToken = useCookie('access_token')
onMounted(() => {
  if (!accessToken.value) {
    navigateTo('/login')
    return
  }
  // Decode the JWT to check the role so we can route superadmins to the
  // platform dashboard instead of the tenant-scoped one.
  let role = ''
  try {
    const parts = accessToken.value.split('.')
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      role = payload.role || ''
    }
  } catch { /* malformed token — let the middleware handle it */ }
  navigateTo(role === 'super_admin' ? '/superadmin' : '/dashboard')
})
</script>
