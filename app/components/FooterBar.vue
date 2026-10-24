<script setup lang="ts">
import { profile } from '~/data/profile'

const year = new Date().getFullYear()
const showTop = ref(false)

const onScroll = () => {
  showTop.value = window.scrollY > 700
}
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <footer class="relative border-t border-fog/10 py-10">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-sm text-mist sm:flex-row">
      <p>© {{ year }} {{ profile.name }}</p>
      <p>Dibuat dengan Nuxt · Vue · Tailwind CSS · Three.js</p>
    </div>

    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-6 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-6 opacity-0"
    >
      <button
        v-if="showTop"
        type="button"
        class="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-fog/10 bg-ink-800/90 text-lg text-fog shadow-2xl backdrop-blur transition-all hover:-translate-y-1 hover:border-rose/50 active:scale-90"
        aria-label="Kembali ke atas"
        @click="toTop"
      >
        ↑
      </button>
    </Transition>
  </footer>
</template>
