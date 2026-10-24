<script setup lang="ts">
import { profile } from '~/data/profile'

const links = [
  { id: 'home', label: 'Beranda' },
  { id: 'about', label: 'Tentang' },
  { id: 'projects', label: 'Proyek' },
  { id: 'skills', label: 'Skill' },
  { id: 'contact', label: 'Kontak' },
]

const open = ref(false)
const active = ref('home')
const progress = ref(0)
const scrolled = ref(false)
let io: IntersectionObserver | null = null

const scrollTo = (id: string) => {
  open.value = false
  active.value = id
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    if (history.pushState) {
      history.pushState(null, '', `#${id}`)
    }
  }
}

const onScroll = () => {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? (h.scrollTop / max) * 100 : 0
  scrolled.value = h.scrollTop > 24
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) active.value = e.target.id
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  links.forEach((l) => {
    const el = document.getElementById(l.id)
    if (el) io!.observe(el)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  io?.disconnect()
})
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 px-3 pt-3">
    <nav
      class="relative mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-full border px-4 py-2.5 backdrop-blur-xl transition-all duration-300 sm:px-5"
      :class="scrolled ? 'border-fog/10 bg-ink-900/80 shadow-2xl' : 'border-fog/10 bg-ink-900/30'"
      aria-label="Navigasi utama"
    >
      <a href="#home" class="flex items-center gap-2.5 font-display text-sm font-semibold" @click.prevent="scrollTo('home')">
        <span class="grid h-8 w-8 place-items-center rounded-full bg-rose text-xs font-bold text-white">NP</span>
        <span class="hidden sm:inline">{{ profile.name }}</span>
      </a>

      <ul class="hidden items-center gap-1 md:flex">
        <li v-for="l in links" :key="l.id">
          <a
            :href="`#${l.id}`"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200"
            :class="active === l.id ? 'bg-butter-100 text-fog' : 'text-mist hover:text-fog'"
            @click.prevent="scrollTo(l.id)"
          >
            {{ l.label }}
          </a>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <a href="#contact" class="btn btn-primary hidden !px-4 !py-2 text-sm md:inline-flex" @click.prevent="scrollTo('contact')">Hubungi saya</a>
        <button
          class="grid h-10 w-10 place-items-center rounded-full bg-butter-100 text-fog transition-transform active:scale-90 md:hidden"
          :aria-expanded="open"
          aria-label="Buka menu"
          @click="open = !open"
        >
          <span class="relative block h-3.5 w-5">
            <span
              class="absolute left-0 h-0.5 w-5 rounded bg-fog transition-all duration-300"
              :class="open ? 'top-1.5 rotate-45' : 'top-0'"
            />
            <span
              class="absolute left-0 top-1.5 h-0.5 w-5 rounded bg-fog transition-opacity duration-200"
              :class="open ? 'opacity-0' : 'opacity-100'"
            />
            <span
              class="absolute left-0 h-0.5 w-5 rounded bg-fog transition-all duration-300"
              :class="open ? 'top-1.5 -rotate-45' : 'top-3'"
            />
          </span>
        </button>
      </div>

      <!-- Progres scroll -->
      <div class="absolute inset-x-0 bottom-0 h-px bg-white/70">
        <div class="h-full bg-rose transition-[width] duration-100" :style="{ width: `${progress}%` }" />
      </div>
    </nav>

    <!-- Menu mobile -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-y-3 opacity-0 scale-95"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="-translate-y-3 opacity-0 scale-95"
    >
      <ul
        v-if="open"
        class="mx-auto mt-2 max-w-6xl origin-top space-y-1 rounded-3xl border border-fog/10 bg-ink-900/95 p-3 shadow-2xl backdrop-blur-xl md:hidden"
      >
        <li v-for="l in links" :key="l.id">
          <a
            :href="`#${l.id}`"
            class="block rounded-2xl px-4 py-3 font-medium transition-colors"
            :class="active === l.id ? 'bg-butter-100 text-fog' : 'text-mist hover:bg-white/70'"
            @click.prevent="scrollTo(l.id)"
          >
            {{ l.label }}
          </a>
        </li>
      </ul>
    </Transition>
  </header>
</template>
