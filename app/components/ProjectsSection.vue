<script setup lang="ts">
import { profile } from '~/data/profile'

const selectedProject = useSelectedProject()
const filters = ['Semua', ...new Set(profile.projects.flatMap((p) => p.tags))]
const filter = ref('Semua')
const failedImg = ref<Record<string, boolean>>({})

const shown = computed(() =>
  filter.value === 'Semua' ? profile.projects : profile.projects.filter((p) => p.tags.includes(filter.value)),
)
const indexOf = (id: string) => profile.projects.findIndex((p) => p.id === id) + 1
const comingSoon = (p: { demo: string; repo: string }) => !p.demo && !p.repo

// Miring 3D + sorotan cahaya mengikuti kursor
const onMove = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
  el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
  el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 9).toFixed(2)}deg) translateY(-4px)`
}
const onLeave = (e: MouseEvent) => {
  ;(e.currentTarget as HTMLElement).style.transform = ''
}
</script>

<template>
  <section id="projects" class="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
    <div class="reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div class="max-w-2xl">
        <p class="eyebrow">Karya</p>
        <h2 class="section-title">Proyek pilihan</h2>
        <p class="mt-3 text-lg text-mist">
          {{ profile.projects.length }} proyek yang saya bangun. Klik kartu untuk langsung membuka website proyeknya.
        </p>
      </div>

      <div class="flex flex-wrap gap-2" role="group" aria-label="Filter proyek">
        <button
          v-for="f in filters"
          :key="f"
          type="button"
          class="rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95"
          :class="
            filter === f
              ? 'border-rose bg-rose text-white'
              : 'border-fog/10 bg-white/70 text-mist hover:border-cocoa/30 hover:text-fog'
          "
          :aria-pressed="filter === f"
          @click="filter = f"
        >
          {{ f }}
        </button>
      </div>
    </div>

    <TransitionGroup name="pop" tag="div" class="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="p in shown" :key="p.id">
        <div
          class="card group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-fog/10 bg-ink-800 text-left transition-[transform,border-color] duration-200 ease-out hover:border-rose/40"
          @mousemove="onMove"
          @mouseleave="onLeave"
          @click="selectedProject = p.id"
        >
          <!-- Sorotan cahaya -->
          <span
            class="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style="background: radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgb(255 107 157 / 0.14), transparent 60%)"
          />

          <!-- Gambar -->
          <div class="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-butter-100 to-ink-700">
            <img
              v-if="p.image && !failedImg[p.id]"
              :src="p.image"
              :alt="`Tampilan ${p.title}`"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              @error="failedImg[p.id] = true"
            />
            <div v-else class="grid h-full w-full place-items-center">
              <span class="font-display text-6xl font-bold text-rose/25">
                {{ String(indexOf(p.id)).padStart(2, '0') }}
              </span>
            </div>
            <span
              class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-display text-xs font-semibold text-rose backdrop-blur"
            >
              {{ String(indexOf(p.id)).padStart(2, '0') }}
            </span>
            <span
              v-if="comingSoon(p)"
              class="absolute right-4 top-4 rounded-full bg-butter-200 px-3 py-1 text-xs font-semibold text-fog backdrop-blur"
            >
              Segera hadir
            </span>
          </div>

          <div class="flex flex-1 flex-col p-6">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="t in p.tags"
                :key="t"
                class="rounded-full bg-rose/10 px-2.5 py-0.5 text-xs font-medium text-rose"
              >
                {{ t }}
              </span>
            </div>
            <h3 class="mt-3 text-xl font-semibold">{{ p.title }}</h3>
            <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-mist">{{ p.summary }}</p>
            <ul class="mt-4 flex flex-wrap gap-1.5">
              <li
                v-for="s in p.stack"
                :key="s"
                class="rounded-md border border-fog/10 px-2 py-0.5 text-xs text-mist"
              >
                {{ s }}
              </li>
            </ul>
            <div class="mt-auto flex items-center justify-between pt-5">
              <span class="text-sm font-semibold text-fog transition-colors group-hover:text-rose">
                Lihat detail →
              </span>
              <div class="flex items-center gap-2">
                <a
                  v-if="p.demo"
                  :href="p.demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-full bg-rose px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  @click.stop
                >
                  Buka website ↗
                </a>
                <a
                  v-else-if="p.repo"
                  :href="p.repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-full border border-fog/20 bg-white/70 px-3 py-1 text-xs font-semibold text-fog transition-colors hover:bg-white"
                  @click.stop
                >
                  GitHub ↗
                </a>
                <span v-else class="text-xs text-mist">
                  Segera hadir
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(16px);
}
.pop-leave-active {
  position: absolute;
}
.pop-move {
  transition: transform 0.4s ease;
}
</style>
