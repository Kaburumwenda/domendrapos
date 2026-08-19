<template>
  <v-dialog :model-value="show" @update:model-value="$emit('close')" max-width="500">
    <v-card rounded="xl">
      <v-card-title class="text-h6 font-weight-bold pa-6 pb-2">
        <v-icon start color="indigo">mdi-shape-outline</v-icon>
        {{ isEdit ? 'Edit Category' : 'Add Category' }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          ref="nameInput"
          v-model="form.name"
          label="Category Name"
          variant="outlined"
          density="comfortable"
          placeholder="e.g., Beverages, Electronics, Groceries"
          class="mb-3"
          :error-messages="error"
        />
        <v-select
          v-model="form.parent"
          :items="parentItems"
          item-title="name"
          item-value="id"
          label="Parent Category"
          variant="outlined"
          density="comfortable"
          clearable
          class="mb-3"
        />
        <v-textarea
          v-model="form.description"
          label="Description"
          variant="outlined"
          density="comfortable"
          rows="2"
          placeholder="Optional category description..."
          class="mb-2"
        />
        <v-checkbox
          v-model="form.is_active"
          label="Active — Inactive categories are hidden from POS"
          density="compact"
          hide-details
        />
      </v-card-text>
      <v-card-actions class="justify-end pa-4">
        <v-btn variant="text" @click="$emit('close')">Cancel</v-btn>
        <v-btn color="primary" :disabled="saving" @click="save">{{ isEdit ? 'Update' : 'Create' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  category: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()
const saving = ref(false)
const error = ref('')
const nameInput = ref(null)

const isEdit = computed(() => !!props.category)

// Exclude self and children from parent options (can't be own parent)
const parentCategories = computed(() => {
  if (!props.category) return props.categories
  return props.categories.filter(c => c.id !== props.category.id)
})

// For v-select items (needs array of {id, name})
const parentItems = computed(() => parentCategories.value)

const form = reactive({
  name: '',
  parent: null,
  description: '',
  is_active: true,
})

watch(() => props.show, (val) => {
  if (val) {
    if (props.category) {
      Object.assign(form, {
        name: props.category.name || '',
        parent: props.category.parent || null,
        description: props.category.description || '',
        is_active: props.category.is_active !== false,
      })
    } else {
      Object.assign(form, { name: '', parent: null, description: '', is_active: true })
    }
    error.value = ''
    nextTick(() => nameInput.value?.focus())
  }
})

async function save() {
  if (!form.name.trim()) {
    error.value = 'Category name is required'
    return
  }
  error.value = ''
  saving.value = true
  try {
    const payload = { ...form, parent: form.parent || null }
    if (isEdit.value) {
      await useApi()(`/products/categories/${props.category.id}/`, { method: 'PATCH', body: payload })
      toast.success('Category updated')
    } else {
      await useApi()('/products/categories/', { method: 'POST', body: payload })
      toast.success('Category created')
    }
    emit('saved')
  } catch (e) {
    if (e?.data?.name) {
      error.value = Array.isArray(e.data.name) ? e.data.name.join(', ') : e.data.name
    } else {
      toast.error('Failed to save category')
    }
  } finally {
    saving.value = false
  }
}
</script>
