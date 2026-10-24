<script setup lang="ts">
import { profile } from '~/data/profile'

// Jika foto belum ada / gagal dimuat, tampilkan inisial
const photoFailed = ref(false)

const highlights = [
  { value: String(profile.projects.length), label: 'Proyek web' },
  { value: 'Kelas 11', label: 'SMK · Rekayasa Perangkat Lunak' },
  { value: 'Frontend', label: 'dengan sentuhan 3D' },
]
</script>

<template>
  <section id="about" class="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
    <div class="reveal max-w-2xl">
      <p class="eyebrow">Tentang</p>
      <h2 class="section-title">Developer muda yang peduli pada detail.</h2>
    </div>

    <div class="mt-14 grid items-start gap-12 lg:grid-cols-[380px_1fr] lg:gap-16">
      <!-- Foto -->
      <div class="reveal mx-auto w-full max-w-[340px] lg:mx-0 lg:max-w-none">
        <div class="relative">
          <div class="absolute -inset-3 rotate-2 rounded-[2rem] border border-rose/30" />
          <div
            class="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-fog/10 bg-gradient-to-br from-ink-700 to-ink-800 shadow-2xl"
          >
            <img
              v-if="profile.photo && !photoFailed"
              :src="profile.photo"
              :alt="`Foto ${profile.name}`"
              class="h-full w-full object-cover"
              loading="lazy"
              @error="photoFailed = true"
            />
            <div v-else class="grid h-full w-full place-items-center">
              <span class="font-display text-8xl font-bold text-rose/80">NP</span>
            </div>
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      <div>
        <div class="reveal space-y-4 text-lg leading-relaxed text-mist" style="--d: 100ms">
          <p v-for="(p, i) in profile.bio" :key="i">{{ p }}</p>
        </div>

        <dl class="reveal mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3" style="--d: 150ms">
          <div v-for="h in highlights" :key="h.label" class="panel panel-butter p-5">
            <dt class="font-display text-2xl font-bold text-fog">{{ h.value }}</dt>
            <dd class="mt-1 text-sm text-mist">{{ h.label }}</dd>
          </div>
        </dl>

        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <div
            v-for="(f, i) in profile.focus"
            :key="f.title"
            class="reveal panel p-5 transition-colors duration-300 hover:border-rose/40"
            :style="{ '--d': `${200 + i * 80}ms` }"
          >
            <h3 class="font-display text-sm font-semibold text-rose">{{ f.title }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-mist">{{ f.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
