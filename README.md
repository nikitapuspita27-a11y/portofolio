# Portofolio Nikita Puspita Dewi

Nuxt 4 + Vue 3 + Tailwind CSS 4 + Three.js. Bagian atas halaman adalah dunia 3D yang bisa dikendarai,
di bawahnya ada bagian portofolio biasa (Tentang, Proyek, Skill, Kontak) untuk pengunjung yang tidak ingin bermain.

## Menjalankan

```bash
npm install
npm run dev        # buka http://localhost:3000
npm run generate   # hasil statis ada di .output/public (siap di-deploy)
```

## Yang perlu kamu isi

Semua teks ada di `app/data/profile.ts`. Cari kata **GANTI**.

1. **Foto**: simpan fotomu sebagai `public/foto.jpg`. Otomatis muncul di bagian Tentang dan sebagai bingkai di dunia 3D.
   Kalau namanya berbeda (mis. `foto.png`), ubah `photo` di `profile.ts`. Pakai foto rasio potret (4:5), minimal 800 px lebar.
2. **6 proyek**: di `profile.ts` ada 6 baris `proyek(...)`. Isi nama, link website, teknologi, dan kategori.
   Kalimat ringkasan dan deskripsi dibuat otomatis. Klik kartu langsung membuka website-nya.
   Proyek yang linknya masih kosong berlabel "Segera hadir".
3. **Screenshot proyek**: simpan di `public/projects/` dengan nama sesuai field `image` (mis. `proyek-1.jpg`, rasio 16:10).
4. **Kontak**: ganti email dan link GitHub / LinkedIn / Instagram.
5. **CV (opsional)**: taruh PDF di `public/` lalu isi `cv` (mis. `'/cv-nikita.pdf'`). Tombol "Unduh CV" muncul otomatis.

## Kontrol dunia 3D

`W A S D` / panah untuk mengemudi, `Shift` boost, `Spasi` rem, `Enter` buka proyek, `Esc` keluar.
Di HP: joystick di kiri bawah.

## Struktur

- `app/components/WorldScene.client.vue`: seluruh dunia 3D (mobil, pos proyek, kotak, bingkai foto)
- `app/components/HeroSection.vue`: teks pembuka dan HUD
- `app/data/profile.ts`: semua konten
- `app/assets/css/main.css`: warna dan animasi global
