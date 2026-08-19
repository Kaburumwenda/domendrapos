<template>
  <div class="profile-page">
    <div class="profile-header">
      <h1 class="text-h5 font-weight-bold mb-1">My Profile</h1>
      <p class="text-body-2 text-medium-emphasis">Manage your personal details and login credentials</p>
    </div>

    <v-row class="mt-1">
      <!-- ===== Left: Avatar & quick info ===== -->
      <v-col cols="12" md="4">
        <v-card rounded="xl" variant="outlined" class="pa-6 text-center">
          <div class="profile-avatar-wrap mx-auto mb-4" @click="openAvatarPicker">
            <v-avatar
              v-if="!avatarPreview && !auth.user?.avatar"
              color="primary"
              size="96"
              class="profile-avatar"
            >
              <span class="text-h4 font-weight-bold text-white">{{ initials }}</span>
            </v-avatar>
            <img v-else-if="avatarPreview || auth.user?.avatar" :src="avatarPreview || avatarUrl" class="profile-avatar__img" alt="Avatar" />
            <div class="profile-avatar-overlay">
              <v-icon color="white" size="22">mdi-camera</v-icon>
              <span class="text-caption">Change</span>
            </div>
          </div>
          <input ref="avatarRef" type="file" accept="image/*" class="d-none" @change="onAvatarSelected" />

          <h3 class="text-h6 font-weight-bold">{{ form.first_name }} {{ form.last_name }}</h3>
          <p class="text-body-2 text-medium-emphasis">{{ auth.user?.email }}</p>
          <v-chip size="small" variant="tonal" :color="roleColor" class="mt-2 text-capitalize">
            {{ auth.role.replace('_', ' ') }}
          </v-chip>

          <v-btn
            variant="tonal"
            color="primary"
            rounded="lg"
            class="mt-4 text-none"
            prepend-icon="mdi-camera"
            @click="openAvatarPicker"
          >
            Change Photo
          </v-btn>
        </v-card>
      </v-col>

      <!-- ===== Right: Forms ===== -->
      <v-col cols="12" md="8">
        <!-- Personal details -->
        <v-card rounded="xl" variant="outlined" class="mb-4">
          <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account-details-outline</v-icon>
            Personal Details
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <v-row density="compact">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.first_name"
                  label="First name"
                  density="comfortable"
                  variant="outlined"
                  hide-details="auto"
                  rounded="lg"
                  prepend-inner-icon="mdi-account-outline"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.last_name"
                  label="Last name"
                  density="comfortable"
                  variant="outlined"
                  hide-details="auto"
                  rounded="lg"
                  prepend-inner-icon="mdi-account-outline"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.trim="form.phone"
                  label="Phone"
                  density="comfortable"
                  variant="outlined"
                  hide-details="auto"
                  rounded="lg"
                  prepend-inner-icon="mdi-phone-outline"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="form.email"
                  label="Email (read-only)"
                  density="comfortable"
                  variant="outlined"
                  hide-details="auto"
                  rounded="lg"
                  readonly
                  disabled
                  prepend-inner-icon="mdi-email-outline"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn
              variant="flat"
              color="primary"
              rounded="lg"
              class="text-none"
              :loading="savingProfile"
              prepend-icon="mdi-content-save-outline"
              @click="saveProfile"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Change password -->
        <v-card rounded="xl" variant="outlined">
          <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-lock-reset</v-icon>
            Change Password
          </v-card-title>
          <v-divider as="div" />
          <v-card-text class="pt-4">
            <v-row density="compact">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.trim="pwdForm.current_password"
                  label="Current password"
                  :type="showCurrentPwd ? 'text' : 'password'"
                  :append-inner-icon="showCurrentPwd ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  density="comfortable"
                  variant="outlined"
                  hide-details="auto"
                  rounded="lg"
                  prepend-inner-icon="mdi-lock-outline"
                  @click:append-inner="showCurrentPwd = !showCurrentPwd"
                />
              </v-col>
              <v-col cols="12" sm="6" />
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="pwdForm.new_password"
                  label="New password"
                  :type="showNewPwd ? 'text' : 'password'"
                  :append-inner-icon="showNewPwd ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  density="comfortable"
                  variant="outlined"
                  hide-details="auto"
                  rounded="lg"
                  prepend-inner-icon="mdi-lock-plus-outline"
                  hint="Minimum 8 characters"
                  persistent-hint
                  @click:append-inner="showNewPwd = !showNewPwd"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="pwdForm.confirm_password"
                  label="Confirm new password"
                  :type="showConfirmPwd ? 'text' : 'password'"
                  :append-inner-icon="showConfirmPwd ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  density="comfortable"
                  variant="outlined"
                  hide-details="auto"
                  rounded="lg"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :error-messages="confirmError"
                  @click:append-inner="showConfirmPwd = !showConfirmPwd"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn
              variant="flat"
              color="primary"
              rounded="lg"
              class="text-none"
              :loading="savingPassword"
              :disabled="!canChangePassword"
              prepend-icon="mdi-lock-reset"
              @click="changePassword"
            >
              Update Password
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const toast = useToast()
const config = useRuntimeConfig()

const roleColors = {
  super_admin: 'purple',
  tenant_admin: 'indigo',
  manager: 'blue',
  cashier: 'teal',
  inventory_clerk: 'orange',
  accountant: 'green',
  sales_associate: 'cyan',
  viewer: 'grey',
}
const roleColor = computed(() => roleColors[auth.role] || 'grey')
const initials = computed(() => {
  const name = auth.fullName || ''
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?'
})

const avatarUrl = computed(() => {
  const raw = auth.user?.avatar
  if (!raw) return null
  if (raw.startsWith('http')) return raw
  return config.public.apiBase.replace('/api', '') + raw
})

// ===== Profile form =====
const form = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
})

const savingProfile = ref(false)
const avatarRef = ref(null)
const avatarPreview = ref(null)
let avatarFile = null

function openAvatarPicker() {
  avatarRef.value?.click()
}

function onAvatarSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Image must be under 2 MB')
    return
  }
  avatarFile = file
  const reader = new FileReader()
  reader.onload = () => { avatarPreview.value = reader.result }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  savingProfile.value = true
  try {
    const body = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
    }
    if (avatarFile) {
      const fd = new FormData()
      fd.append('first_name', form.first_name)
      fd.append('last_name', form.last_name)
      fd.append('phone', form.phone)
      fd.append('avatar', avatarFile)
      await useApi()('/users/staff/me/', { method: 'PATCH', body: fd })
    } else {
      await useApi()('/users/staff/me/', { method: 'PATCH', body })
    }
    // Update auth store user
    if (auth.user) {
      auth.user.first_name = form.first_name
      auth.user.last_name = form.last_name
      auth.user.phone = form.phone
    }
    toast.success('Profile updated successfully')
    avatarFile = null
    avatarPreview.value = null
  } catch {
    toast.error('Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

// ===== Password form =====
const showCurrentPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)
const savingPassword = ref(false)

const pwdForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const confirmError = computed(() => {
  if (!pwdForm.confirm_password) return ''
  if (pwdForm.confirm_password !== pwdForm.new_password) return 'Passwords do not match'
  return ''
})

const canChangePassword = computed(() =>
  pwdForm.current_password.length > 0 &&
  pwdForm.new_password.length >= 8 &&
  pwdForm.confirm_password === pwdForm.new_password
)

async function changePassword() {
  if (!canChangePassword.value) return
  savingPassword.value = true
  try {
    await useApi()('/users/staff/me/change-password/', {
      method: 'POST',
      body: {
        current_password: pwdForm.current_password,
        new_password: pwdForm.new_password,
      },
    })
    toast.success('Password changed successfully')
    pwdForm.current_password = ''
    pwdForm.new_password = ''
    pwdForm.confirm_password = ''
  } catch (e) {
    const data = e?.data || e?.response?._data || {}
    const msg = data.current_password?.[0] || data.detail || 'Failed to change password'
    toast.error(typeof msg === 'string' ? msg : 'Failed to change password')
  } finally {
    savingPassword.value = false
  }
}

// ===== Init =====
async function loadProfile() {
  try {
    const data = await useApi()('/users/staff/me/')
    form.first_name = data.first_name || ''
    form.last_name = data.last_name || ''
    form.phone = data.phone || ''
    form.email = data.email || ''
    if (data.avatar && auth.user) {
      auth.user.avatar = data.avatar
    }
  } catch {
    // Fall back to auth store data
    form.first_name = auth.user?.first_name || ''
    form.last_name = auth.user?.last_name || ''
    form.phone = auth.user?.phone || ''
    form.email = auth.user?.email || ''
  }
}

onMounted(() => {
  form.first_name = auth.user?.first_name || ''
  form.last_name = auth.user?.last_name || ''
  form.phone = auth.user?.phone || ''
  form.email = auth.user?.email || ''
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.profile-avatar-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
}

.profile-avatar {
  border: 3px solid rgba(var(--v-theme-surface), 0.12);
}

.profile-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 50%;
}

.profile-avatar-wrap:hover .profile-avatar-overlay {
  opacity: 1;
}
</style>
