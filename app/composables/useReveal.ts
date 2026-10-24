
import { onMounted, onBeforeUnmount } from 'vue'

// Memunculkan elemen berkelas .reveal saat masuk layar
export const useReveal = () => {
  let io: IntersectionObserver | null = null

  onMounted(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }

    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io?.unobserve(entry.target)
          }
        }
      },
      {
        threshold: 0.01,
        rootMargin: '50px 0px 50px 0px',
      },
    )

    els.forEach((el) => io!.observe(el))
  })

  onBeforeUnmount(() => io?.disconnect())
}