<script setup lang="ts">
import { profile } from '../data/profile'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const started = ref(true)
const ready = ref(false)
const isTouch = ref(false)

console.log('HERO SECTION DIMUAT')

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth' })
}

// Efek mengetik bergantian untuk peran
const roles = profile.roles
const text = ref('')
let ri = 0
let ci = 0
let deleting = false
let timer: ReturnType<typeof setTimeout>
let safety: ReturnType<typeof setTimeout>

const tick = () => {
  const full = roles[ri]
  text.value = full.slice(0, ci)
  if (!deleting && ci < full.length) {
    ci++
    timer = setTimeout(tick, 70)
  } else if (!deleting) {
    deleting = true
    timer = setTimeout(tick, 1500)
  } else if (ci > 0) {
    ci--
    timer = setTimeout(tick, 35)
  } else {
    deleting = false
    ri = (ri + 1) % roles.length
    timer = setTimeout(tick, 300)
  }
}

onMounted(() => {
  isTouch.value = window.matchMedia('(pointer: coarse)').matches
  tick()
  // Jaga-jaga: jangan biarkan layar pemuatan menutupi halaman terlalu lama
  safety = setTimeout(() => (ready.value = true), 7000)
})
onBeforeUnmount(() => {
  clearTimeout(timer)
  clearTimeout(safety)
})
</script>

<template>
  <section id="home" class="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink-950">
    <WorldScene :active="started" @ready="ready = true" @exit="started = false" />

    <!-- Pemuatan -->
    <Transition leave-active-class="transition-opacity duration-700" leave-to-class="opacity-0">
      <div v-if="!ready" class="absolute inset-0 z-30 grid place-items-center bg-ink-950">
        <div class="text-center">
          <div class="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-fog/10 border-t-rose" />
          <p class="mt-4 font-display text-sm tracking-widest text-mist">MEMUAT DUNIA 3D</p>
        </div>
      </div>
    </Transition>

    <!-- Gradasi agar teks mudah dibaca -->
    <div
      class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink-950 via-ink-950/30 to-ink-950/40 transition-opacity duration-700"
      :class="started ? 'opacity-0' : 'opacity-100'"
    />
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-ink-950 to-transparent"
    />

    <!-- Konten hero -->
    <Transition name="hero-ui">
      <div v-if="!started" class="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-20 sm:pb-24">
        <div class="mx-auto max-w-6xl px-5">
          <p
            class="animate-rise pointer-events-auto inline-flex items-center gap-2 rounded-full border border-fog/10 bg-white/70 px-4 py-1.5 text-xs font-medium text-fog backdrop-blur"
          >
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-70" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-rose" />
            </span>
            {{ profile.availability }}
          </p>

          <h1
            class="animate-rise mt-5 max-w-3xl text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl"
            style="animation-delay: 100ms"
          >
            {{ profile.name }}
          </h1>

          <p
            class="animate-rise mt-4 min-h-8 font-display text-lg font-medium text-rose sm:text-2xl"
            style="animation-delay: 200ms"
          >
            <span>{{ text }}</span><span class="animate-blink text-mist">|</span>
          </p>

          <p class="animate-rise mt-3 max-w-xl text-base leading-relaxed text-mist sm:text-lg" style="animation-delay: 300ms">
            {{ profile.headline }}
          </p>

          <div class="animate-rise mt-8 flex flex-wrap gap-3" style="animation-delay: 400ms">
            <button type="button" class="btn btn-primary pointer-events-auto" @click="started = true">
              Jelajahi dunia 3D
              <span aria-hidden="true">→</span>
            </button>
            <a href="#projects" class="btn btn-ghost pointer-events-auto" @click.prevent="scrollTo('projects')">Lihat proyek</a>
            <a v-if="profile.cv" :href="profile.cv" download class="btn btn-ghost pointer-events-auto">Unduh CV</a>
          </div>
        </div>

        <div class="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block" aria-hidden="true">
          <div class="flex h-9 w-5 justify-center rounded-full border border-fog/25 pt-2">
            <span class="h-1.5 w-1 animate-scroll-cue rounded-full bg-fog" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- HUD saat mengemudi -->
    <Transition name="hero-ui">
      <div v-if="started" class="pointer-events-none absolute inset-x-0 top-24 z-10">
        <div class="mx-auto flex max-w-6xl items-start justify-between gap-4 px-5">
          <div class="rounded-2xl border border-fog/10 bg-ink-900/70 px-4 py-3 text-xs text-mist backdrop-blur-md">
            <template v-if="isTouch">
              <p class="font-medium text-fog">Gunakan joystick di kiri bawah</p>
              <p class="mt-1">Dorong penuh untuk boost. Dekati pos untuk membuka proyek.</p>
            </template>
            <template v-else>
              <p class="font-medium text-fog">Kendalikan mobil</p>
              <p class="mt-1.5 flex flex-wrap items-center gap-1.5">
                <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> atau <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd>
                <span class="mx-1">·</span> <kbd>Shift</kbd> boost <span class="mx-1">·</span> <kbd>Spasi</kbd> rem
              </p>
              <p class="mt-1.5">Dekati pos bernomor lalu tunggu sebentar, atau tekan <kbd>Enter</kbd>.</p>
            </template>
          </div>
          <button type="button" class="btn btn-ghost pointer-events-auto shrink-0 !px-4 !py-2 text-sm" @click="started = false">
            Keluar <span class="text-mist">Esc</span>
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.hero-ui-enter-active,
.hero-ui-leave-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.hero-ui-enter-from,
.hero-ui-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
