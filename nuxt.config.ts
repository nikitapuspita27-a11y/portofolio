import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Nikita Puspita Dewi — Frontend Developer',
      htmlAttrs: { lang: 'id' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Portofolio Nikita Puspita Dewi, siswa SMK Rekayasa Perangkat Lunak. Frontend developer dengan Nuxt, Vue, Tailwind CSS, dan Three.js.',
        },
        { name: 'theme-color', content: '#fff7fa' },
        { property: 'og:title', content: 'Nikita Puspita Dewi — Frontend Developer' },
        {
          property: 'og:description',
          content: 'Jelajahi portofolio interaktif 3D: proyek web modern dengan Nuxt, Vue, dan Three.js.',
        }, 
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@500;600;700&display=swap',
        },
      ],
    },
  },
})