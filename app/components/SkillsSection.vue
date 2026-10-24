<script setup lang="ts">
import { profile } from '~/data/profile'

// Digandakan agar marquee berputar mulus tanpa jeda
const marquee = [...profile.techStack, ...profile.techStack]
</script>

<template>
  <section id="skills" class="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
    <div class="reveal max-w-2xl">
      <p class="eyebrow">Kemampuan</p>
      <h2 class="section-title">Teknologi yang saya gunakan.</h2>
    </div>

    <div class="mt-12 grid gap-5 md:grid-cols-3">
      <div
        v-for="(g, i) in profile.skills"
        :key="g.group"
        class="reveal panel p-6 transition-colors duration-300 hover:border-rose/40"
        :style="{ '--d': `${i * 100}ms` }"
      >
        <h3 class="font-display text-lg font-semibold">{{ g.group }}</h3>
        <ul class="mt-5 space-y-3">
          <li v-for="s in g.items" :key="s.name" class="flex items-center justify-between gap-3 border-b border-fog/10 pb-3 last:border-0 last:pb-0">
            <span class="text-fog">{{ s.name }}</span>
            <span v-if="s.note" class="rounded-full bg-butter-200 px-2.5 py-0.5 text-xs font-medium text-fog">
              {{ s.note }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Marquee tech stack -->
    <div
      class="reveal relative mt-14 overflow-hidden"
      style="mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)"
      aria-hidden="true"
    >
      <div class="flex w-max animate-marquee gap-3">
        <span
          v-for="(t, i) in marquee"
          :key="i"
          class="rounded-full border border-fog/10 bg-white/70 px-5 py-2 font-display text-sm font-medium text-mist"
        >
          {{ t }}
        </span>
      </div>
    </div>
  </section>
</template>
