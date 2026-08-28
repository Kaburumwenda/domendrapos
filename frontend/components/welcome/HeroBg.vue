<template>
  <div class="welcome-bg" aria-hidden="true">
    <!-- Soft gradient base -->
    <div class="welcome-bg__base" />

    <!-- Floating animated blobs -->
    <div class="welcome-blob welcome-blob--1" />
    <div class="welcome-blob welcome-blob--2" />
    <div class="welcome-blob welcome-blob--3" />
    <div class="welcome-blob welcome-blob--4" />

    <!-- Orbiting rings -->
    <div class="welcome-ring welcome-ring--1">
      <div class="welcome-ring__dot welcome-ring__dot--a" />
      <div class="welcome-ring__dot welcome-ring__dot--b" />
    </div>
    <div class="welcome-ring welcome-ring--2">
      <div class="welcome-ring__dot welcome-ring__dot--c" />
    </div>

    <!-- Faint grid -->
    <div class="welcome-bg__grid" />

    <!-- Pulsing status dot bottom-right -->
    <div class="welcome-pulse-dot" />

    <!-- Vignette -->
    <div class="welcome-bg__vignette" />
  </div>
</template>

<script setup lang="ts">
// Pure-CSS animated background — no JS listeners, no deps.
// Mouse parallax is intentionally omitted so this page is cheap to render
// (unlike Auth3DScene which adds window listeners).
</script>

<style scoped>
.welcome-bg {
  position: absolute; inset: 0; overflow: hidden; z-index: 0;
  pointer-events: none;
}

.welcome-bg__base {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 15%, rgba(52, 120, 246, 0.18), transparent 70%),
    radial-gradient(ellipse 70% 55% at 85% 20%, rgba(139, 92, 246, 0.16), transparent 70%),
    radial-gradient(ellipse 90% 70% at 50% 95%, rgba(13, 148, 136, 0.14), transparent 70%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f8 50%, #f5f3ff 100%);
}

/* Blobs */
.welcome-blob {
  position: absolute; border-radius: 50%;
  filter: blur(48px); opacity: 0.55;
  will-change: transform;
}
.welcome-blob--1 { width: 360px; height: 360px; top: -80px; left: -60px;
  background: radial-gradient(circle, #3478f6, transparent 70%);
  animation: welcome-float 14s ease-in-out infinite; }
.welcome-blob--2 { width: 300px; height: 300px; top: 10%; right: 4%;
  background: radial-gradient(circle, #8b5cf6, transparent 70%);
  animation: welcome-float-slow 18s ease-in-out infinite; }
.welcome-blob--3 { width: 280px; height: 280px; bottom: -60px; left: 30%;
  background: radial-gradient(circle, #0d9488, transparent 70%);
  animation: welcome-float 22s ease-in-out infinite reverse; }
.welcome-blob--4 { width: 220px; height: 220px; bottom: 12%; right: 18%;
  background: radial-gradient(circle, #f59e0b, transparent 70%);
  opacity: 0.32;
  animation: welcome-float-slow 16s ease-in-out infinite; }

/* Orbiting rings with small dots */
.welcome-ring { position: absolute; border-radius: 50%; border: 1px dashed rgba(52, 120, 246, 0.25); }
.welcome-ring--1 { width: 520px; height: 520px; top: 40%; left: 50%; margin: -260px 0 0 -260px;
  animation: welcome-spin 40s linear infinite; }
.welcome-ring--2 { width: 760px; height: 760px; top: 40%; left: 50%; margin: -380px 0 0 -380px;
  border-color: rgba(139, 92, 246, 0.20);
  animation: welcome-spin-reverse 55s linear infinite; }

.welcome-ring__dot {
  position: absolute; width: 10px; height: 10px; border-radius: 50%;
  box-shadow: 0 0 10px 2px rgba(52, 120, 246, 0.5);
}
.welcome-ring__dot--a { top: -5px; left: 50%; background: #3478f6; }
.welcome-ring__dot--b { bottom: -5px; right: 20%; background: #8b5cf6;
  box-shadow: 0 0 10px 2px rgba(139, 92, 246, 0.5); }
.welcome-ring__dot--c { top: 25%; right: -5px; width: 8px; height: 8px;
  background: #0d9488; box-shadow: 0 0 10px 2px rgba(13, 148, 136, 0.5); }

/* Faint grid */
.welcome-bg__grid {
  position: absolute; inset: 0; opacity: 0.4;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 40%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 90% 70% at 50% 40%, #000 30%, transparent 75%);
}

/* Status pulse dot */
.welcome-pulse-dot {
  position: absolute; bottom: 28px; right: 28px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #22c55e; box-shadow: 0 0 14px 3px rgba(34, 197, 94, 0.55);
  animation: welcome-pulse 2.5s ease-in-out infinite;
}

/* Vignette */
.welcome-bg__vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 100% 80% at 50% 50%, transparent 60%, rgba(15, 23, 42, 0.08) 100%);
}
</style>
