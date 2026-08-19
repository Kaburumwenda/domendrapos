<template>
  <div
    ref="sceneEl"
    class="auth3d-root"
    aria-hidden="true"
  >
    <!-- depth layers driven by --rx / --ry -->
    <div class="layer-grain" />
    <div class="layer-grid" :style="depthStyle(0)" />
    <div class="orbits" :style="depthStyle(1)">
      <div class="orbit l1" />
      <div class="orbit l2" />
      <div class="orbit l3" />
    </div>

    <!-- floating geometric objects -->
    <div class="floats" :style="depthStyle(2)">
      <!-- cube -->
      <div class="shape cube" style="--x: -22%; --y: -18%; --z: 110; --delay: 0s; --dur: 14s">
        <div class="face fx"><div class="cube-knot" /></div>
        <div class="face fx back" />
        <div class="face fy" />
        <div class="face fy back" />
        <div class="face fz" />
        <div class="face fz back" />
      </div>
      <!-- pyramid -->
      <div class="shape pyramid" style="--x: 26%; --y: -8%; --z: 90; --delay: -3s; --dur: 16s">
        <div class="py-face px1" /><div class="py-face px2" />
        <div class="py-face px3" /><div class="py-face px4" />
      </div>
      <!-- torus knot -->
      <div class="shape torus" style="--x: 18%; --y: 24%; --z: 70; --delay: -6s; --dur: 20s" />
      <!-- diamond -->
      <div class="shape diamond" style="--x: -28%; --y: 22%; --z: 130; --delay: -1.5s; --dur: 13s" />
      <!-- ring -->
      <div class="shape ring" style="--x: 5%; --y: -32%; --z: 150; --delay: -9s; --dur: 22s" />
      <!-- small icosahedron-ish (use star poly via clipped divs) -->
      <div class="shape star" style="--x: -10%; --y: 8%; --z: 60; --delay: -4s; --dur: 18s" />
    </div>

    <!-- hero POS mark -->
    <div class="hero-mark" :style="depthStyle(3)">
      <div class="hm-icon"><div class="hm-core" /><div class="hm-bar" /></div>
      <div class="hm-text">
        <span class="hm-line">POS</span>
        <span class="hm-line sub">.cloud</span>
      </div>
    </div>

    <!-- vignette -->
    <div class="vignette" />
  </div>
</template>

<script setup lang="ts">
/** 3D background scene for the auth/login route — pure CSS, zero deps. */
const sceneEl = ref<HTMLElement | null>(null)
const tx = useState('auth3d-tx', () => 0)
const ty = useState('auth3d-ty', () => 0)

const rotX = computed(() => `${(-ty.value * 14).toFixed(2)}deg`)
const rotY = computed(() => `${(tx.value * 18).toFixed(2)}deg`)

function depthStyle(layer: number) {
  const f = 0.35 + layer * 0.22
  return {
    transform: `translate3d(${(tx.value * 26 * f).toFixed(2)}px, ${(ty.value * 26 * f).toFixed(2)}px, ${(layer * 30).toFixed(0)}px) rotateX(${(parseFloat(rotX.value) * f).toFixed(2)}deg) rotateY(${(parseFloat(rotY.value) * f).toFixed(2)}deg)`,
  }
}

function setFromXY(x: number, y: number) {
  const r = sceneEl.value?.getBoundingClientRect()
  if (!r) return
  tx.value = (x - (r.left + r.width / 2)) / (r.width / 2)
  ty.value = (y - (r.top + r.height / 2)) / (r.height / 2)
}

function handleMouseMove(e: MouseEvent) { setFromXY(e.clientX, e.clientY) }
function handleTouchMove(e: TouchEvent) {
  if (e.touches[0]) setFromXY(e.touches[0].clientX, e.touches[0].clientY)
}
function handleLeave() { tx.value = 0; ty.value = 0 }

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: true })
  window.addEventListener('mouseleave', handleLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('mouseleave', handleLeave)
  tx.value = 0; ty.value = 0
})
</script>

<style scoped>
.auth3d-root {
  position: absolute; inset: 0; overflow: hidden;
  background:
    radial-gradient(120% 90% at 18% 12%, #dbeafe 0%, rgba(219,234,254,0) 55%),
    radial-gradient(120% 90% at 92% 88%, #cffafe 0%, rgba(207,250,254,0) 50%),
    linear-gradient(160deg, #f8fafc 0%, #f1f5f9 42%, #f3f4f6 72%, #ffffff 100%);
  perspective: 1300px;
  perspective-origin: 50% 45%;
  user-select: none; -webkit-user-select: none;
  touch-action: none;
  will-change: transform;
}

/* root transform driven by global tilt */
.auth3d-root > * { transform-style: preserve-3d; }

.layer-grain {
  position: absolute; inset: 0; pointer-events: none; z-index: 1; opacity: 0.22;
  background-image:
    radial-gradient(circle at 25% 30%, rgba(59,130,246,0.10) 0 2px, transparent 3px),
    radial-gradient(circle at 75% 60%, rgba(14,165,233,0.08) 0 2px, transparent 3px),
    radial-gradient(circle at 50% 80%, rgba(167,139,250,0.08) 0 2px, transparent 3px);
  background-size: 7px 7px, 11px 11px, 13px 13px;
  mix-blend-mode: multiply;
}

.layer-grid {
  position: absolute; inset: -20%; z-index: 2; opacity: 0.07;
  background-image:
    linear-gradient(rgba(30,64,175,0.7) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30,64,175,0.7) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(circle at 50% 50%, black 35%, transparent 75%);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 35%, transparent 75%);
}

/* orbits */
.orbits { position: absolute; inset: 0; z-index: 3; }
.orbit {
  position: absolute; top: 50%; left: 50%; border-radius: 50%;
  border: 1px solid rgba(125,211,252,0.22);
  transform: translate(-50%, -50%) rotateX(74deg);
  box-shadow: 0 0 60px rgba(56,189,248,0.06) inset;
}
.orbit.l1 { width: 80vmax; height: 80vmax; animation: spin 60s linear infinite; }
.orbit.l2 { width: 58vmax; height: 58vmax; border-color: rgba(167,139,250,0.20); animation: spin 42s linear infinite reverse; transform: translate(-50%, -50%) rotateX(74deg) rotateZ(20deg); }
.orbit.l3 { width: 40vmax; height: 40vmax; border-color: rgba(34,211,238,0.25); animation: spin 30s linear infinite; transform: translate(-50%, -50%) rotateX(74deg) rotateZ(-12deg); }
@keyframes spin { to { transform: translate(-50%, -50%) rotateX(74deg) rotateZ(360deg); } }

/* floating shapes container */
.floats { position: absolute; inset: 0; z-index: 5; transform-style: preserve-3d; }
.shape {
  position: absolute; top: 50%; left: 50%;
  --size: 64px; width: var(--size); height: var(--size);
  margin: calc(var(--size) * -0.5) 0 0 calc(var(--size) * -0.5);
  transform: translate3d(var(--x), var(--y), calc(var(--z) * 1px));
  animation: float var(--dur, 16s) ease-in-out var(--delay, 0s) infinite;
  transform-style: preserve-3d;
}
@keyframes float {
  0%, 100% { transform: translate3d(var(--x), var(--y), calc(var(--z) * 1px)) rotateY(0deg) rotateX(8deg); }
  50%      { transform: translate3d(var(--x), calc(var(--y) - 26px), calc((var(--z) + 30) * 1px)) rotateY(180deg) rotateX(-8deg); }
}

/* cube */
.cube { --size: 72px; }
.cube > .face {
  position: absolute; inset: 0; border-radius: 8px;
  background: linear-gradient(135deg, rgba(96,165,250,0.55), rgba(59,130,246,0.28));
  border: 1px solid rgba(147,197,253,0.55);
  box-shadow: 0 0 22px rgba(56,189,248,0.18), inset 0 0 14px rgba(255,255,255,0.10);
  backdrop-filter: blur(2px);
}
.face.fx        { transform: translateZ(calc(var(--size) * 0.5)); }
.face.fx.back   { transform: rotateY(180deg) translateZ(calc(var(--size) * 0.5)); }
.face.fy        { transform: rotateY(90deg)  translateZ(calc(var(--size) * 0.5)); }
.face.fy.back   { transform: rotateY(-90deg) translateZ(calc(var(--size) * 0.5)); }
.face.fz        { transform: rotateX(90deg)  translateZ(calc(var(--size) * 0.5)); }
.face.fz.back   { transform: rotateX(-90deg) translateZ(calc(var(--size) * 0.5)); }
.cube-knot::before, .cube-knot::after {
  content: ""; position: absolute; inset: 10%; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3);
}
.cube-knot::after { transform: rotate(45deg) scale(0.7); }

/* pyramid */
.pyramid { --size: 84px; }
.py-face {
  position: absolute; inset: 0;
  border-left: calc(var(--size) * 0.5) solid transparent;
  border-right: calc(var(--size) * 0.5) solid transparent;
  border-bottom: calc(var(--size) * 0.86) solid rgba(167,139,250,0.42);
  filter: drop-shadow(0 0 20px rgba(167,139,250,0.25));
}
.py-face { transform-origin: 50% 100%; }
.py-face.px1 { transform: rotateY(0)   translateZ(calc(var(--size) * 0.24)); border-bottom-color: rgba(167,139,250,0.50); }
.py-face.px2 { transform: rotateY(90deg) translateZ(calc(var(--size) * 0.24)); border-bottom-color: rgba(196,181,253,0.42); }
.py-face.px3 { transform: rotateY(180deg) translateZ(calc(var(--size) * 0.24)); border-bottom-color: rgba(196,181,253,0.34); }
.py-face.px4 { transform: rotateY(270deg) translateZ(calc(var(--size) * 0.24)); border-bottom-color: rgba(167,139,250,0.46); }

/* torus — rotating ring stack */
.torus {
  --size: 90px; border-radius: 50%; border: 6px solid rgba(34,211,238,0.45);
  box-shadow: 0 0 30px rgba(34,211,238,0.25), inset 0 0 16px rgba(34,211,238,0.10);
}
.torus::before, .torus::after {
  content: ""; position: absolute; inset: -6px; border-radius: 50%;
  border: 4px solid rgba(125,211,252,0.35);
}
.torus::before { transform: rotateX(60deg); }
.torus::after  { transform: rotateY(60deg); border-color: rgba(96,165,250,0.45); }

/* diamond — two stacked rotated squares */
.diamond { --size: 56px; }
.diamond::before, .diamond::after {
  content: ""; position: absolute; inset: 0; border-radius: 8px;
  background: linear-gradient(135deg, rgba(251,191,36,0.5), rgba(245,158,11,0.0));
  border: 1px solid rgba(253,224,71,0.5); box-shadow: 0 0 18px rgba(251,191,36,0.22);
}
.diamond::before { transform: rotateX(45deg) rotateZ(45deg); }
.diamond::after  { transform: rotateY(45deg) rotateZ(45deg); }

/* ring (flat orbit) */
.ring {
  --size: 120px; border-radius: 50%; border: 2px solid rgba(56,189,248,0.4);
  box-shadow: 0 0 40px rgba(56,189,248,0.16), inset 0 0 20px rgba(56,189,248,0.06);
}
.ring::after {
  content: ""; position: absolute; inset: 22%; border-radius: 50%;
  border: 1px solid rgba(125,211,252,0.5); background: radial-gradient(circle at 35% 30%, rgba(125,211,252,0.18), transparent 60%);
}

/* star poly — clip-path flower */
.star {
  --size: 44px; background: conic-gradient(from 0deg, rgba(244,114,182,0.5), rgba(251,191,36,0.4), rgba(244,114,182,0.5));
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  box-shadow: 0 0 24px rgba(244,114,182,0.3);
}

/* hero mark — POS monogram */
.hero-mark {
  position: absolute; left: 50%; top: 38%;
  transform: translate(-50%, -50%); z-index: 6;
  display: flex; align-items: center; gap: 14px;
  color: rgba(30, 64, 175, 0.10);
  pointer-events: none;
}
.hm-icon {
  position: relative; width: 56px; height: 64px; border-radius: 12px;
  border: 2px solid rgba(125,211,252,0.18); background: rgba(125,211,252,0.04);
  box-shadow: 0 10px 40px rgba(56,189,248,0.06), inset 0 0 12px rgba(255,255,255,0.04);
  overflow: hidden;
}
.hm-core { position: absolute; inset: 12px 12px 22px; border-radius: 6px; background: rgba(125,211,252,0.08); border: 1px solid rgba(125,211,252,0.20); }
.hm-bar  { position: absolute; left: 12px; right: 12px; bottom: 8px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, rgba(34,211,238,0.5), rgba(167,139,250,0.5)); }
.hm-text { display: flex; flex-direction: column; line-height: 1; font-weight: 800; letter-spacing: -0.02em; }
.hm-line { font-size: 30px; }
.hm-line.sub { font-size: 14px; opacity: 0.7; margin-top: 2px; letter-spacing: 0.2em; font-weight: 600; }

.vignette {
  position: absolute; inset: 0; z-index: 7; pointer-events: none;
  background: radial-gradient(120% 80% at 50% 50%, rgba(255,255,255,0) 55%, rgba(226,232,240,0.35) 100%);
}

@media (prefers-reduced-motion: reduce) {
  .orbit, .shape { animation: none !important; }
}
</style>
