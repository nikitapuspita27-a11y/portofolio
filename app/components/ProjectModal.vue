<script setup lang="ts">
import { profile } from '~/data/profile'

const selectedId = useSelectedProject()
const closeBtn = ref<HTMLButtonElement | null>(null)
const imgFailed = ref(false)

const project = computed(() => profile.projects.find((p) => p.id === selectedId.value) ?? null)
const index = computed(() => profile.projects.findIndex((p) => p.id === selectedId.value) + 1)
const close = () => (selectedId.value = null)

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && selectedId.value) close()
}

watch(selectedId, (v) => {
  imgFailed.value = false
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) nextTick(() => closeBtn.value?.focus())
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="project"
        class="fixed inset-0 z-[60] grid place-items-center bg-fog/45 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-label="project.title"
        @click.self="close"
      >
        <div
          class="modal-card relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-fog/10 bg-ink-800 shadow-2xl"
        >
          <button
            ref="closeBtn"
            type="button"
            class="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-fog backdrop-blur transition-transform hover:rotate-90 active:scale-90"
            aria-label="Tutup"
            @click="close"
          >
            ✕
          </button>

          <div class="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-butter-100 to-ink-700">
            <img
              v-if="project.image && !imgFailed"
              :src="project.image"
              :alt="`Tampilan ${project.title}`"
              class="h-full w-full object-cover"
              @error="imgFailed = true"
            />
            <div v-else class="grid h-full w-full place-items-center">
              <span class="font-display text-8xl font-bold text-rose/25">{{ String(index).padStart(2, '0') }}</span>
            </div>
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-800 to-transparent" />
          </div>

          <div class="p-6 pt-2 sm:p-8 sm:pt-2">
            <p class="eyebrow">Proyek {{ String(index).padStart(2, '0') }}</p>
            <h3 class="mt-2 text-3xl font-bold">{{ project.title }}</h3>

            <dl class="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <dt class="text-mist">Peran</dt>
                <dd class="font-medium text-fog">{{ project.role }}</dd>
              </div>
              <div v-if="project.year">
                <dt class="text-mist">Tahun</dt>
                <dd class="font-medium text-fog">{{ project.year }}</dd>
              </div>
            </dl>

            <p class="mt-5 leading-relaxed text-mist">{{ project.detail }}</p>

            <ul class="mt-5 flex flex-wrap gap-2">
              <li v-for="s in project.stack" :key="s" class="rounded-full border border-fog/10 bg-white/70 px-3 py-1 text-xs text-fog">
                {{ s }}
              </li>
            </ul>

            <div class="mt-7 flex flex-wrap items-center gap-3">
              <a
                v-if="project.demo"
                :href="project.demo"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary"
              >
                Buka website
                <span aria-hidden="true">↗</span>
              </a>
              <a
                v-if="project.repo"
                :href="project.repo"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost"
              >
                Kode di GitHub
              </a>
              <p v-if="!project.demo && !project.repo" class="text-sm text-fog">Tautan proyek akan segera ditambahkan.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active .modal-card {
  animation: modal-in 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.1);
}
@keyframes modal-in {
  from {
    transform: scale(0.94) translateY(18px);
  }
}
</style>
