<template>
  <div class="snapshot-root">
    <v-card
      rounded="xl"
      flat
      border
      class="snapshot-card pa-0 overflow-hidden"
      elevation="0"
    >
      <!-- Snapshot toolbar -->
      <div class="snapshot-toolbar d-flex align-center ga-2 pa-2">
        <div class="snapshot-dots d-flex ga-1">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <v-spacer />
        <span class="text-caption text-medium-emphasis">{{ label }}</span>
        <v-spacer />
        <v-btn
          icon="mdi-open-in-new"
          size="x-small"
          variant="text"
          title="Open full size"
          @click="openFull"
        />
        <v-btn
          icon="mdi-download"
          size="x-small"
          variant="text"
          title="Download snapshot"
          @click="downloadSvg"
        />
      </div>

      <!-- Snapshot image -->
      <div class="snapshot-frame" @click="openFull">
        <img :src="src" :alt="alt" class="snapshot-img" />
        <div class="snapshot-hover-overlay d-flex align-center justify-center">
          <v-btn color="white" variant="elevated" size="small" prepend-icon="mdi-magnify-plus">
            View full screen
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Fullscreen dialog (client-only to avoid SSR id mismatches) -->
    <ClientOnly>
      <v-dialog v-model="dialog" max-width="95vw" transition="dialog-bottom-transition">
        <v-card rounded="xl" class="pa-0 overflow-hidden" max-height="95vh">
          <div class="d-flex align-center pa-4 ga-2">
            <span class="text-h6 font-weight-bold">{{ label }}</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
          </div>
          <v-divider />
          <div class="d-flex justify-center align-center pa-4" style="background: #f8fafc; overflow: auto;">
            <img :src="src" :alt="alt" style="max-width: 100%; height: auto; border-radius: 12px;" />
          </div>
        </v-card>
      </v-dialog>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  alt?: string
  label?: string
}>(), {
  alt: 'Screenshot',
  label: 'Screenshot',
})

const dialog = ref(false)

function openFull() {
  dialog.value = true
}

async function downloadSvg() {
  if (!import.meta.client) return
  try {
    const response = await fetch(props.src)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name = props.src.split('/').pop() || 'snapshot.svg'
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    // fallback: open in new tab
    window.open(props.src, '_blank')
  }
}
</script>

<style scoped>
.snapshot-root { width: 100%; }
.snapshot-card { background: #ffffff; }

.snapshot-toolbar {
  background: #f8fafc;
  border-bottom: 1px solid rgba(203, 213, 225, 0.3);
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-red { background: #ef4444; }
.dot-yellow { background: #f59e0b; }
.dot-green { background: #22c55e; }

.snapshot-frame {
  position: relative; cursor: pointer;
  overflow: hidden; background: #f8fafc;
}
.snapshot-img {
  width: 100%; height: auto; display: block;
  transition: transform 0.3s ease;
}
.snapshot-hover-overlay {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0; transition: opacity 0.25s ease;
  pointer-events: none;
}
.snapshot-frame:hover .snapshot-hover-overlay { opacity: 1; }
.snapshot-frame:hover .snapshot-img { transform: scale(1.02); }
</style>
