<script setup lang="ts">
import { profile } from '~/data/profile'

const name = ref('')
const message = ref('')
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout>

const showToast = (t: string) => {
  toast.value = t
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2400)
}

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(profile.contact.email)
    showToast('Email disalin ke clipboard')
  } catch {
    showToast('Gagal menyalin, silakan salin manual')
  }
}

// Form membuka aplikasi email (tanpa server)
const send = () => {
  const subject = encodeURIComponent(`Halo ${profile.nickname}, salam dari ${name.value || 'pengunjung portofolio'}`)
  const body = encodeURIComponent(`${message.value}\n\n— ${name.value}`)
  window.location.href = `mailto:${profile.contact.email}?subject=${subject}&body=${body}`
  showToast('Membuka aplikasi email Anda')
}

onBeforeUnmount(() => clearTimeout(toastTimer))
</script>

<template>
  <section id="contact" class="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
    <div class="reveal max-w-2xl">
      <p class="eyebrow">Kontak</p>
      <h2 class="section-title">Mari berkolaborasi.</h2>
      <p class="mt-3 text-lg text-mist">
        {{ profile.availability }}. Kirim pesan lewat form atau hubungi saya langsung lewat email dan profil di bawah.
      </p>
    </div>

    <div class="mt-12 grid gap-6 lg:grid-cols-2">
      <div class="reveal panel p-7 sm:p-8">
        <p class="text-sm text-mist">Email</p>
        <button
          type="button"
          class="group mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border border-fog/10 bg-white/70 px-5 py-4 text-left font-medium transition-all hover:border-rose/40 hover:bg-butter-100 active:scale-[0.99]"
          @click="copyEmail"
        >
          <span class="break-all">{{ profile.contact.email }}</span>
          <span class="shrink-0 rounded-full bg-rose/15 px-3 py-1 text-xs font-semibold text-rose">Salin</span>
        </button>

        <p class="mt-7 text-sm text-mist">Profil</p>
        <ul class="mt-2 flex flex-wrap gap-3">
          <li v-for="l in profile.contact.links" :key="l.label">
            <a :href="l.href" target="_blank" rel="noopener noreferrer" class="btn btn-ghost !px-5 !py-2.5 text-sm">
              {{ l.label }}
              <span class="text-mist" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>

        <a v-if="profile.cv" :href="profile.cv" download class="btn btn-primary mt-8">Unduh CV</a>
      </div>

      <form class="reveal panel space-y-4 p-7 sm:p-8" style="--d: 120ms" @submit.prevent="send">
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium">Nama</span>
          <input
            v-model="name"
            required
            type="text"
            autocomplete="name"
            placeholder="Nama Anda"
            class="w-full rounded-2xl border border-fog/10 bg-ink-900 px-4 py-3 text-fog outline-none transition-all placeholder:text-mist/60 focus:border-rose focus:ring-4 focus:ring-rose/15"
          />
        </label>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium">Pesan</span>
          <textarea
            v-model="message"
            required
            rows="5"
            :placeholder="`Halo ${profile.nickname}, saya ingin berdiskusi tentang...`"
            class="w-full resize-none rounded-2xl border border-fog/10 bg-ink-900 px-4 py-3 text-fog outline-none transition-all placeholder:text-mist/60 focus:border-rose focus:ring-4 focus:ring-rose/15"
          />
        </label>
        <button type="submit" class="btn btn-primary w-full">Kirim pesan</button>
      </form>
    </div>

    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="toast"
        class="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-fog/10 bg-ink-800 px-6 py-3 text-sm font-medium text-fog shadow-2xl"
        role="status"
      >
        {{ toast }}
      </div>
    </Transition>
  </section>
</template>
