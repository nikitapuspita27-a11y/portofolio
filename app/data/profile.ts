
export type Project = {
  id: string
  title: string
  summary: string
  detail: string
  role: string
  year: string
  tags: string[]
  stack: string[]
  /** Link website proyek yang sudah online */
  demo: string
  /** Link repository GitHub */
  repo: string
  /** Screenshot proyek di folder public/projects/ */
  image: string
}

export const profile = {
  name: 'Nikita Puspita Dewi',
  nickname: 'Nikita',

  photo: '/images/self.png',
  cv: '',

  availability: 'Terbuka untuk peluang magang & PKL',
  roles: [
    'Frontend Developer',
    'Creative Web & 3D Enthusiast',
    'Siswa SMK Rekayasa Perangkat Lunak',
  ],

  headline: 'Membangun pengalaman web yang rapi, cepat, dan interaktif.',
  intro:
    'Siswa SMK kelas 11 jurusan Rekayasa Perangkat Lunak yang berfokus pada frontend modern dengan Nuxt, Vue, dan Tailwind CSS, serta eksplorasi 3D di browser dengan Three.js.',

  bio: [
    'Saya Nikita, siswa kelas 11 jurusan Rekayasa Perangkat Lunak di SMKN 71 Jakarta. Saya berfokus pada pengembangan frontend modern menggunakan Nuxt, Vue 3, dan Tailwind CSS, dengan perhatian pada antarmuka yang rapi, responsif, dan mudah digunakan.',
    'Saya juga mengeksplorasi 3D di browser dengan Three.js untuk menciptakan pengalaman web yang lebih interaktif. Portofolio ini sendiri adalah salah satu hasil eksperimen tersebut.',
  ],

  focus: [
    { title: 'Pendidikan', text: 'SMKN 71 Jakarta, jurusan Rekayasa Perangkat Lunak, kelas XI.' },
    { title: 'Sedang dipelajari', text: 'Nuxt 4, Vue 3, Tailwind CSS, dan Three.js.' },
    { title: 'Pendekatan', text: 'Desain bersih dengan interaksi kecil yang bermakna.' },
    { title: 'Tujuan', text: 'Menjadi web developer yang membangun produk digital yang rapi dan bermanfaat.' },
  ],

  skills: [
    {
      group: 'Frontend',
      items: [
        { name: 'HTML & CSS' },
        { name: 'JavaScript' },
        { name: 'Vue 3' },
        { name: 'Nuxt 4' },
        { name: 'Tailwind CSS' },
      ],
    },
    {
      group: '3D & Animasi',
      items: [
        { name: 'Three.js', note: 'Sedang dipelajari' },
        { name: 'Animasi CSS' },
        { name: 'Interaksi UI' },
      ],
    },
    {
      group: 'Tools & Workflow',
      items: [
        { name: 'Git & GitHub' },
        { name: 'VS Code' },
        { name: 'Figma' },
      ],
    },
  ] as { group: string; items: { name: string; note?: string }[] }[],

  techStack: [
    'Nuxt 4',
    'Vue 3',
    'Tailwind CSS',
    'Three.js',
    'JavaScript',
    'HTML',
    'CSS',
    'Git',
    'Figma',
  ],

  projects: [
    {
      id: 'proyek-1',
      title: 'Website Universitas Indonesia',
      summary:
        'Website informatif yang memperkenalkan Universitas Indonesia melalui tampilan visual kampus dan penyajian informasi yang terstruktur.',
      detail:
        'Proyek ini dibuat untuk mempelajari pengembangan website profil institusi pendidikan. Saya berfokus pada penyusunan tata letak, pemilihan elemen visual, dan penyajian informasi agar mudah dipahami pengunjung.',
      role: 'Frontend Developer',
      year: '2026',
      tags: ['Web'],
      stack: ['HTML', 'CSS'],
      demo: 'https://project-website-university-mgg4j4fqr-nikk20.vercel.app/',
      repo: '',
      image: '/projects/proyek-1.png',
    },
    {
      id: 'proyek-2',
      title: 'Website Profil Sekolah',
      summary:
        'Website profil sekolah yang menyajikan informasi sekolah melalui tampilan yang terstruktur, informatif, dan mudah diakses.',
      detail:
        'Proyek ini bertujuan untuk memperkenalkan identitas SMKN 71 Jakarta dan menyajikan informasi pendidikan dalam sebuah website. Saya berfokus pada pembuatan antarmuka, pengaturan komponen, dan penataan konten agar pengunjung dapat menemukan informasi dengan mudah.',
      role: 'Frontend Developer',
      year: '2026',
      tags: ['Web', 'UI'],
      stack: ['PHP', 'CSS'],
      demo: 'https://nikitapuspita.xo.je/',
      repo: '',
      image: '/projects/proyek-2.png',
    },
    {
      id: 'proyek-3',
      title: 'CRUD Sederhana',
      summary:
        'Aplikasi pengelolaan data dengan fungsi tambah, lihat, ubah, dan hapus untuk memahami proses dasar CRUD.',
      detail:
        'Proyek ini dibuat untuk mempelajari konsep Create, Read, Update, dan Delete dalam pengembangan aplikasi. Proyek ini membantu saya memahami dasar pengelolaan data serta hubungan antara tindakan pengguna dan perubahan data.',
      role: 'Frontend Developer',
      year: '2026',
      tags: ['Web'],
      stack: ['Nuxt', 'Vue', 'CSS'],
      demo: 'https://project-crud-easoblxp2-nikk20.vercel.app/',
      repo: '',
      image: '/projects/proyek-3.png',
    },
    {
      id: 'proyek-4',
      title: 'Website Wisata Jawa Barat',
      summary:
        'Website pengenalan destinasi wisata Jawa Barat yang menampilkan informasi wisata dengan desain visual yang menarik.',
      detail:
        'Proyek ini dibuat untuk menyajikan informasi mengenai destinasi wisata di Jawa Barat melalui media website. Saya berfokus pada penyusunan tata letak, penggunaan HTML dan CSS, serta penerapan JavaScript untuk mendukung interaksi antarmuka.',
      role: 'Frontend Developer',
      year: '2025',
      tags: ['Web', 'UI'],
      stack: ['HTML', 'CSS'],
      demo: 'https://website-profile-pahlawan-website-wi.vercel.app/',
      repo: '',
      image: '/projects/proyek-4.png',
    },
    {
      id: 'proyek-5',
      title: 'Website Institut Teknologi Bandung',
      summary:
        'Website pengenalan Institut Teknologi Bandung yang menyajikan informasi institusi pendidikan melalui antarmuka web.',
      detail:
        'Proyek ini merupakan latihan membuat website bertema institusi pendidikan tinggi. Saya berfokus pada pengembangan antarmuka, penataan konten, dan penyusunan komponen agar tampilan lebih konsisten.',
      role: 'Frontend Developer',
      year: '2025',
      tags: ['Web'],
      stack: ['HTML', 'CSS'],
      demo: 'https://universitasitb-qjxmnzm99-nikk20.vercel.app/',
      repo: '',
      image: '/projects/proyek-5.jpg',
    },
  ] as Project[],

  contact: {
    email: 'nikitapuspita27@gmail.com',
    links: [
      { label: 'GitHub', href: 'https://github.com/' },
      { label: 'LinkedIn', href: 'https://linkedin.com/' },
      { label: 'Instagram', href: 'https://instagram.com/' },
    ],
  },
}