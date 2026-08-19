<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="500">
    <v-card rounded="xl">
      <v-card-title class="text-h6 font-weight-bold pa-6 pb-2">{{ unit ? 'Edit' : 'Add' }} Unit</v-card-title>
      <v-card-text>
        <v-text-field
          ref="nameInput"
          v-model="form.name"
          label="Name"
          variant="outlined"
          density="comfortable"
          required
          placeholder="e.g. Kilogram"
          class="mb-3"
        />
        <v-text-field
          v-model="form.abbreviation"
          label="Abbreviation"
          variant="outlined"
          density="comfortable"
          required
          maxlength="10"
          placeholder="e.g. kg"
          class="mb-3"
        />
        <v-textarea
          v-model="form.description"
          label="Description"
          variant="outlined"
          density="comfortable"
          rows="2"
          placeholder="Optional description"
          class="mb-2"
        />
        <v-checkbox v-model="form.is_active" label="Active" density="compact" hide-details />
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-3">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions class="justify-end pa-4">
        <v-btn variant="text" @click="$emit('close')">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: Boolean,
  unit: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])

const toast = useToast()
const nameInput = ref(null)
const saving = ref(false)
const error = ref('')

const form = ref({ name: '', abbreviation: '', description: '', is_active: true })

watch(() => props.show, async (val) => {
  if (val) {
    error.value = ''
    if (props.unit) {
      form.value = { ...props.unit }
    } else {
      form.value = { name: '', abbreviation: '', description: '', is_active: true }
      await nextTick()
      nameInput.value?.focus()
    }
  }
})

async function save() {
  saving.value = true
  error.value = ''
  try {
    if (props.unit) {
      await useApi()(`/products/units/${props.unit.id}/`, {
        method: 'PATCH',
        body: form.value,
      })
    } else {
      await useApi()('/products/units/', {
        method: 'POST',
        body: form.value,
      })
    }
    toast.success(props.unit ? 'Unit updated' : 'Unit created')
    emit('saved')
  } catch (e) {
    const detail = e?.data?.name?.[0] || e?.data?.abbreviation?.[0] || 'Failed to save unit'
    error.value = detail
  } finally {
    saving.value = false
  }
}
</script>
