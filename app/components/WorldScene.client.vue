<script setup lang="ts">
import * as THREE from 'three'
import { profile } from '../data/profile'
import {
  ref,
  reactive,
  toRef,
  onMounted,
  onBeforeUnmount
} from 'vue'
import { useSelectedProject } from '../composables/useSelectedProject'

// Dunia 3D interaktif: kendarai mobil ke tiap pos untuk membuka proyek.
// Hanya memakai Three.js (tanpa library fisika), jadi ringan dan mudah diubah.

const props = defineProps<{ active: boolean }>()
const emit = defineEmits<{ ready: []; exit: [] }>()

const host = ref<HTMLDivElement | null>(null)
const failed = ref(false)
const nearLabel = ref('')
const isTouch = ref(false)
const knob = reactive({ x: 0, y: 0 })
const selected = useSelectedProject()
const activeRef = toRef(props, 'active')

// Input joystick (layar sentuh) dan jembatan ke fungsi di dalam scene
const joy = { x: 0, y: 0 }
const api = { open: () => {} }
let cleanup: (() => void) | null = null

const joySet = (e: PointerEvent) => {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
  let dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
  const m = Math.hypot(dx, dy)
  if (m > 1) {
    dx /= m
    dy /= m
  }
  joy.x = dx
  joy.y = dy
  knob.x = dx
  knob.y = dy
}
const joyDown = (e: PointerEvent) => {
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  joySet(e)
}
const joyMove = (e: PointerEvent) => {
  if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) joySet(e)
}
const joyUp = () => {
  joy.x = joy.y = knob.x = knob.y = 0
}

onMounted(() => {
  const el = host.value
  if (!el) return
  console.log('WORLD SCENE MOUNTED', el.clientWidth, el.clientHeight)
  isTouch.value = window.matchMedia('(pointer: coarse)').matches
  const coarse = isTouch.value
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  } catch {
    failed.value = true
    emit('ready')
    return
  }

  let disposed = false
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(o: T): T => {
    disposables.push(o)
    return o
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 1.75))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.style.display = 'block'
  el.appendChild(renderer.domElement)
  console.log('Canvas 3D berhasil dibuat:', el.clientWidth, el.clientHeight)

  // ---------- Helper ----------
  let seed = 20261023
  const rand = () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const std = (color: number, opts: THREE.MeshStandardMaterialParameters = {}) =>
    track(new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...opts }))
  const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, shadow = true) => {
    const o = new THREE.Mesh(track(geo), m)
    o.castShadow = shadow
    o.receiveShadow = true
    return o
  }
  const angDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b))

  const redraws: (() => void)[] = []
  const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d')!
    const tex = track(new THREE.CanvasTexture(c))
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    const redraw = () => {
      g.clearRect(0, 0, w, h)
      draw(g, w, h)
      tex.needsUpdate = true
    }
    redraw()
    redraws.push(redraw)
    return tex
  }
  const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    g.beginPath()
    g.moveTo(x + r, y)
    g.arcTo(x + w, y, x + w, y + h, r)
    g.arcTo(x + w, y + h, x, y + h, r)
    g.arcTo(x, y + h, x, y, r)
    g.arcTo(x, y, x + w, y, r)
    g.closePath()
  }
  const fit = (g: CanvasRenderingContext2D, text: string, max: number) => {
    if (g.measureText(text).width <= max) return text
    let s = text
    while (s.length > 1 && g.measureText(s + '…').width > max) s = s.slice(0, -1)
    return s + '…'
  }
  document.fonts?.ready.then(() => {
    if (!disposed) redraws.forEach((f) => f())
  })

  // ---------- Scene, kamera, cahaya ----------
  const ARENA = 46
  const scene = new THREE.Scene()
  scene.background = canvasTex(4, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, '#ffb8cf')
    gr.addColorStop(0.55, '#ffe0ea')
    gr.addColorStop(0.9, '#fff6c9')
    gr.addColorStop(1, '#fff6c9')
    g.fillStyle = gr
    g.fillRect(0, 0, w, h)
  })
  scene.fog = new THREE.Fog(0xffeef3, 45, 190)

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500)
  const camPos = new THREE.Vector3(14, 17, 46)
  const camLook = new THREE.Vector3(0, 2.5, 8)
  camera.position.copy(camPos)

  scene.add(new THREE.HemisphereLight(0xfff4f8, 0xffc2d6, 1.2))
  const sun = new THREE.DirectionalLight(0xfff1cf, 1.9)
  sun.castShadow = true
  const sm = coarse ? 1024 : 2048
  sun.shadow.mapSize.set(sm, sm)
  Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 100 })
  sun.shadow.camera.updateProjectionMatrix()
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.03
  scene.add(sun, sun.target)

  // Langit: matahari & awan
  {
    const sunDisc = new THREE.Mesh(
      track(new THREE.SphereGeometry(11, 24, 24)),
      track(new THREE.MeshBasicMaterial({ color: 0xffe375, fog: false })),
    )
    sunDisc.position.set(-120, 90, -200)
    scene.add(sunDisc)
    const cloudGeo = track(new THREE.SphereGeometry(1, 16, 12))
    const cloudMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0.92 }))
    for (let i = 0; i < 12; i++) {
      const g = new THREE.Group()
      const parts = 3 + Math.floor(rand() * 3)
      for (let j = 0; j < parts; j++) {
        const b = new THREE.Mesh(cloudGeo, cloudMat)
        b.position.set(j * 9 - parts * 4, rand() * 3, rand() * 4)
        b.scale.set(8 + rand() * 5, 4 + rand() * 2, 5 + rand() * 2)
        g.add(b)
      }
      const a = rand() * Math.PI * 2
      const r = 140 + rand() * 90
      g.position.set(Math.sin(a) * r, 55 + rand() * 40, Math.cos(a) * r)
      g.rotation.y = a
      scene.add(g)
    }
  }

  // ---------- Lantai ----------
  {
    const far = mesh(new THREE.CircleGeometry(220, 64), std(0xffc2d6, { roughness: 1 }), false)
    far.rotation.x = -Math.PI / 2
    far.position.y = -0.02
    scene.add(far)

    const arena = mesh(new THREE.CircleGeometry(ARENA, 96), std(0xffeef3, { roughness: 0.95 }), false)
    arena.rotation.x = -Math.PI / 2
    scene.add(arena)

    const path = mesh(new THREE.RingGeometry(15.6, 20.4, 96), std(0xffee9e, { roughness: 0.9 }), false)
    path.rotation.x = -Math.PI / 2
    path.position.y = 0.02
    scene.add(path)

    const plaza = mesh(new THREE.CircleGeometry(8, 64), std(0xfff6c9, { roughness: 0.9 }), false)
    plaza.rotation.x = -Math.PI / 2
    plaza.position.y = 0.025
    scene.add(plaza)

    const edge = mesh(
      new THREE.RingGeometry(ARENA - 0.5, ARENA, 128),
      std(0xffd54f, { emissive: 0xffd54f, emissiveIntensity: 0.5 }),
      false,
    )
    edge.rotation.x = -Math.PI / 2
    edge.position.y = 0.03
    scene.add(edge)
  }

  // ---------- Pagar tepi arena ----------
  {
    const n = 72
    const posts = new THREE.InstancedMesh(track(new THREE.CylinderGeometry(0.18, 0.24, 1.2, 8)), std(0x8a6573), n)
    const caps = new THREE.InstancedMesh(
      track(new THREE.SphereGeometry(0.3, 12, 12)),
      std(0xff95b8, { emissive: 0xff95b8, emissiveIntensity: 0.9 }),
      n,
    )
    const m = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const x = Math.sin(a) * (ARENA + 0.2)
      const z = Math.cos(a) * (ARENA + 0.2)
      m.makeTranslation(x, 0.6, z)
      posts.setMatrixAt(i, m)
      m.makeTranslation(x, 1.3, z)
      caps.setMatrixAt(i, m)
    }
    posts.castShadow = true
    scene.add(posts, caps)
  }

  // ---------- Pohon & bukit di luar arena ----------
  {
    const n = 140
    const trunkGeo = track(new THREE.CylinderGeometry(0.25, 0.35, 1.6, 6))
    trunkGeo.translate(0, 0.8, 0)
    const leafGeo = track(new THREE.ConeGeometry(1.7, 4.4, 7))
    leafGeo.translate(0, 3.4, 0)
    const trunks = new THREE.InstancedMesh(trunkGeo, std(0x8a6573), n)
    const leaves = new THREE.InstancedMesh(leafGeo, std(0xffffff, { roughness: 0.9 }), n)
    const m = new THREE.Matrix4()
    const col = new THREE.Color()
    const tones = [0xff95b8, 0xffb8cf, 0xffd54f, 0xffe375, 0xff7fb0]
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const r = ARENA + 8 + rand() * 62
      const s = 0.8 + rand() * 1.1
      m.compose(
        new THREE.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6),
        new THREE.Vector3(s, s * (0.9 + rand() * 0.5), s),
      )
      trunks.setMatrixAt(i, m)
      leaves.setMatrixAt(i, m)
      leaves.setColorAt(i, col.set(tones[i % tones.length]))
    }
    trunks.castShadow = leaves.castShadow = true
    scene.add(trunks, leaves)

    const hillGeo = track(new THREE.ConeGeometry(34, 44, 5))
    const hillMat = std(0xffc2d6, { roughness: 1 })
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rand() * 0.2
      const r = 150 + rand() * 25
      const h = new THREE.Mesh(hillGeo, hillMat)
      h.position.set(Math.sin(a) * r, 14, Math.cos(a) * r)
      h.scale.set(0.9 + rand() * 0.8, 0.8 + rand() * 0.9, 0.9 + rand() * 0.8)
      scene.add(h)
    }
  }

  // ---------- Collider (lingkaran) ----------
  const colliders: { x: number; z: number; r: number }[] = []

  // ---------- Papan nama di tengah ----------
  {
    const board = new THREE.Group()
    const body = mesh(new THREE.BoxGeometry(8.2, 3.4, 0.3), std(0xffffff, { roughness: 0.5, metalness: 0.05 }))
    body.position.y = 3.6
    board.add(body)
    const labelTex = canvasTex(1600, 660, (g, w, h) => {
      rr(g, 14, 14, w - 28, h - 28, 56)
      g.fillStyle = '#ffffff'
      g.fill()
      g.lineWidth = 8
      g.strokeStyle = '#ff95b8'
      g.stroke()
      g.textAlign = 'center'
      g.textBaseline = 'alphabetic'
      g.fillStyle = '#e5588b'
      g.font = '600 46px Sora, Inter, sans-serif'
      g.fillText('PORTOFOLIO INTERAKTIF', w / 2, 140)
      g.fillStyle = '#5b3a46'
      g.font = '700 124px Sora, Inter, sans-serif'
      g.fillText(fit(g, profile.name, w - 160), w / 2, 300)
      g.fillStyle = '#8a6573'
      g.font = '500 54px Inter, sans-serif'
      g.fillText(fit(g, profile.roles[0] + '  ·  ' + profile.roles[2], w - 160), w / 2, 400)
      rr(g, w / 2 - 600, 468, 1200, 84, 42)
      g.fillStyle = '#ffee9e'
      g.fill()
      g.fillStyle = '#5b3a46'
      g.font = '600 44px Inter, sans-serif'
      g.fillText('Kendarai mobil ke pos bernomor untuk melihat proyek', w / 2, 524)
    })
    const labelMat = track(new THREE.MeshBasicMaterial({ map: labelTex, toneMapped: false }))
    const front = new THREE.Mesh(track(new THREE.PlaneGeometry(8, 3.25)), labelMat)
    front.position.set(0, 3.6, 0.16)
    const back = front.clone()
    back.position.z = -0.16
    back.rotation.y = Math.PI
    board.add(front, back)
    for (const x of [-3.7, 3.7]) {
      const post = mesh(new THREE.BoxGeometry(0.3, 2.2, 0.3), std(0xff95b8))
      post.position.set(x, 1.1, 0)
      board.add(post)
    }
    scene.add(board)
    for (const x of [-3.7, -1.85, 0, 1.85, 3.7]) colliders.push({ x, z: 0, r: 0.7 })
  }

  // ---------- Bingkai foto (muncul jika foto ditemukan) ----------
  if (profile.photo) {
    new THREE.TextureLoader().load(
      profile.photo,
      (tex) => {
        if (disposed) {
          tex.dispose()
          return
        }
        track(tex)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
        const img = tex.image as { width: number; height: number }
        const ia = img.width / img.height
        const fa = 3 / 3.6
        if (ia > fa) {
          tex.repeat.x = fa / ia
          tex.offset.x = (1 - tex.repeat.x) / 2
        } else {
          tex.repeat.y = ia / fa
          tex.offset.y = (1 - tex.repeat.y) / 2
        }
        const g = new THREE.Group()
        const frame = mesh(
          new THREE.BoxGeometry(3.5, 4.1, 0.3),
          std(0xffd54f, { roughness: 0.4 }),
        )
        frame.position.y = 3.2
        g.add(frame)
        const pic = new THREE.Mesh(
          track(new THREE.PlaneGeometry(3, 3.6)),
          track(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })),
        )
        pic.position.set(0, 3.2, 0.17)
        g.add(pic)
        for (const x of [-1.2, 1.2]) {
          const leg = mesh(new THREE.BoxGeometry(0.25, 1.3, 0.25), std(0xff95b8))
          leg.position.set(x, 0.65, 0)
          g.add(leg)
        }
        g.position.set(-9.5, 0, 4)
        g.rotation.y = 0.35
        scene.add(g)
        colliders.push({ x: -9.5, z: 4, r: 1.9 })
      },
      undefined,
      () => {},
    )
  }

  // ---------- Pos proyek ----------
  const projects = profile.projects
  type Station = {
    id: string
    x: number
    z: number
    k: number
    ringMat: THREE.MeshStandardMaterial
    ring: THREE.Mesh
    sprite: THREE.Sprite
    base: THREE.Vector3
  }
  const stations: Station[] = []
  const pickables: THREE.Object3D[] = []
  const orbs: THREE.Mesh[] = []
  const R = 18

  projects.forEach((p, i) => {
    const a = ((i + 0.5) / projects.length) * Math.PI * 2
    const x = Math.sin(a) * R
    const z = Math.cos(a) * R

    const disc = mesh(new THREE.CircleGeometry(3, 48), std(0xffee9e, { roughness: 0.6 }), false)
    disc.rotation.x = -Math.PI / 2
    disc.position.set(x, 0.06, z)
    disc.userData.id = p.id
    scene.add(disc)
    pickables.push(disc)

    const ringMat = std(0xf06a9b, { emissive: 0xf06a9b, emissiveIntensity: 0.35 })
    const ring = mesh(new THREE.TorusGeometry(3, 0.12, 12, 64), ringMat, false)
    ring.rotation.x = Math.PI / 2
    ring.position.set(x, 0.16, z)
    scene.add(ring)

    const pylon = mesh(new THREE.BoxGeometry(0.8, 2.6, 0.8), std(0xffb8cf, { roughness: 0.4 }))
    pylon.position.set(x, 1.3, z)
    scene.add(pylon)
    const orb = mesh(new THREE.OctahedronGeometry(0.45, 0), std(0xffd54f, { emissive: 0xffd54f, emissiveIntensity: 0.6 }), false)
    orb.position.set(x, 3.0, z)
    orbs.push(orb)
    scene.add(orb)
    colliders.push({ x, z, r: 0.95 })

    const tex = canvasTex(640, 300, (g, w, h) => {
      rr(g, 8, 8, w - 16, h - 16, 36)
      g.fillStyle = 'rgba(255,255,255,0.96)'
      g.fill()
      g.lineWidth = 3
      g.strokeStyle = '#ff95b8'
      g.stroke()
      g.textAlign = 'left'
      g.textBaseline = 'alphabetic'
      g.fillStyle = '#e5588b'
      g.font = '600 36px Sora, Inter, sans-serif'
      g.fillText(String(i + 1).padStart(2, '0'), 44, 84)
      g.fillStyle = '#5b3a46'
      g.font = '700 52px Sora, Inter, sans-serif'
      g.fillText(fit(g, p.title, w - 88), 44, 168)
      g.fillStyle = '#8a6573'
      g.font = '500 30px Inter, sans-serif'
      g.fillText(fit(g, p.stack.join(' · '), w - 88), 44, 230)
    })
    const sprite = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })))
    sprite.scale.set(5.6, 2.62, 1)
    sprite.position.set(x, 5.4, z)
    sprite.userData.id = p.id
    scene.add(sprite)
    pickables.push(sprite)

    stations.push({ id: p.id, x, z, k: 0, ringMat, ring, sprite, base: sprite.position.clone() })
  })

  // ---------- Mobil ----------
  const car = new THREE.Group()
  const bodyGroup = new THREE.Group()
  car.add(bodyGroup)
  const wheels: { pivot: THREE.Group; m: THREE.Mesh; front: boolean }[] = []
  {
    const paint = std(0xff7fb0, { roughness: 0.35, metalness: 0.25 })
    const dark = std(0x5b3a46, { roughness: 0.5, metalness: 0.1 })
    const glass = std(0x7a5566, { roughness: 0.15, metalness: 0.4 })
    const body = mesh(new THREE.BoxGeometry(1.8, 0.6, 3.4), paint)
    body.position.y = 0.72
    const cabin = mesh(new THREE.BoxGeometry(1.5, 0.55, 1.6), glass)
    cabin.position.set(0, 1.28, -0.25)
    const roof = mesh(new THREE.BoxGeometry(1.56, 0.1, 1.4), std(0xffd54f, { roughness: 0.4 }))
    roof.position.set(0, 1.58, -0.25)
    const spoiler = mesh(new THREE.BoxGeometry(1.7, 0.08, 0.4), dark)
    spoiler.position.set(0, 1.25, -1.6)
    const lightMat = std(0xffe2a8, { emissive: 0xffe2a8, emissiveIntensity: 2.2 })
    const tailMat = std(0xf06a9b, { emissive: 0xf06a9b, emissiveIntensity: 1 })
    const lights: THREE.Mesh[] = []
    for (const x of [-0.6, 0.6]) {
      const hl = mesh(new THREE.BoxGeometry(0.4, 0.2, 0.08), lightMat, false)
      hl.position.set(x, 0.78, 1.72)
      const tl = mesh(new THREE.BoxGeometry(0.4, 0.16, 0.08), tailMat, false)
      tl.position.set(x, 0.78, -1.72)
      lights.push(hl, tl)
    }
    bodyGroup.add(body, cabin, roof, spoiler, ...lights)

    const wGeo = track(new THREE.CylinderGeometry(0.4, 0.4, 0.34, 20))
    wGeo.rotateZ(Math.PI / 2)
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const pivot = new THREE.Group()
        pivot.position.set(sx * 1.02, 0.4, sz * 1.1)
        const w = new THREE.Mesh(wGeo, dark)
        w.castShadow = true
        pivot.add(w)
        car.add(pivot)
        wheels.push({ pivot, m: w, front: sz > 0 })
      }
    }
  }
  scene.add(car)

  // ---------- Kotak yang bisa didorong ----------
  type Crate = { m: THREE.Mesh; x: number; z: number; vx: number; vz: number }
  const crates: Crate[] = []
  {
    const geo = track(new THREE.BoxGeometry(1.1, 1.1, 1.1))
    const cols = [0xf06a9b, 0xffd54f, 0xffffff, 0xffb8cf]
    for (let i = 0; i < 16; i++) {
      let x = 0
      let z = 0
      let tries = 0
      let ok = false
      while (!ok && tries++ < 60) {
        const a = rand() * Math.PI * 2
        const r = 6 + rand() * (ARENA - 12)
        x = Math.sin(a) * r
        z = Math.cos(a) * r
        ok =
          stations.every((s) => Math.hypot(x - s.x, z - s.z) > 5) &&
          colliders.every((c) => Math.hypot(x - c.x, z - c.z) > 4) &&
          Math.hypot(x, z - 30) > 6
      }
      const m = mesh(geo, std(cols[i % cols.length], { roughness: 0.55 }))
      m.position.set(x, 0.55, z)
      m.rotation.y = rand() * 3
      scene.add(m)
      crates.push({ m, x, z, vx: 0, vz: 0 })
    }
  }

  // ---------- Kunang-kunang ----------
  const FF = 90
  const ffBase = new Float32Array(FF * 3)
  const ffPos = new Float32Array(FF * 3)
  const ffGeo = track(new THREE.BufferGeometry())
  {
    for (let i = 0; i < FF; i++) {
      const a = rand() * Math.PI * 2
      const r = rand() * (ARENA - 2)
      ffBase[i * 3] = Math.sin(a) * r
      ffBase[i * 3 + 1] = 0.8 + rand() * 4
      ffBase[i * 3 + 2] = Math.cos(a) * r
    }
    ffPos.set(ffBase)
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3))
    scene.add(
      new THREE.Points(
        ffGeo,
        track(new THREE.PointsMaterial({ color: 0xffd54f, size: 0.28, transparent: true, opacity: 0.85, depthWrite: false })),
      ),
    )
  }

  // ---------- Input ----------
  const keys = new Set<string>()
  const ignore = (t: EventTarget | null) => {
    const n = t as HTMLElement | null
    return !!n && (['INPUT', 'TEXTAREA', 'SELECT'].includes(n.tagName) || n.isContentEditable)
  }
  let visible = true
  let nearIdx = -1
  let lastNear = -2
  let dwell = 0
  let triggered = false

  const openNear = () => {
    if (nearIdx < 0) return
    triggered = true
    selected.value = stations[nearIdx].id
  }
  api.open = openNear

  const onKeyDown = (e: KeyboardEvent) => {
    if (!activeRef.value || !visible || selected.value || ignore(e.target)) return
    const k = e.key.toLowerCase()
    if (k === 'escape') {
      emit('exit')
      return
    }
    if (k === 'enter') {
      openNear()
      return
    }
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'shift'].includes(k)) {
      if (k.startsWith('arrow') || k === ' ') e.preventDefault()
      keys.add(k)
    }
  }
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
  const onBlur = () => keys.clear()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)

  // Klik / hover label proyek
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const pick = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    const hit = ray.intersectObjects(pickables, false)[0]
    return hit?.object.userData.id as string | undefined
  }
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    el.style.cursor = pick(e) ? 'pointer' : ''
  }
  const onPointerDown = (e: PointerEvent) => {
    const id = pick(e)
    if (id) selected.value = id
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerdown', onPointerDown)

  // ---------- Ukuran ----------
  const resize = () => {
    const w = el.clientWidth || 1
    const h = el.clientHeight || 1
    renderer.setSize(w, h)
    console.log('UKURAN AREA 3D:', w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  resize()

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.intersectionRatio > 0.05
      console.log('VISIBILITY 3D:', visible, entry.intersectionRatio)
      if (entry.intersectionRatio < 0.3 && activeRef.value) emit('exit')
    },
    { threshold: [0, 0.05, 0.3] },
  )
  io.observe(el)

  // ---------- Simulasi ----------
  let carX = 0
  let carZ = 30
  let heading = Math.PI
  let speed = 0
  let steerCur = 0
  let pitch = 0
  let camAngle = heading
  let orbitA = 0.35
  const want = new THREE.Vector3()
  const look = new THREE.Vector3()
  const CAR_R = 1.3

  const step = (dt: number, t: number) => {
    // Kontrol
    let throttle = 0
    let steerIn = 0
    let boost = false
    let brake = false
    if (activeRef.value && !selected.value) {
      throttle = (keys.has('arrowup') || keys.has('w') ? 1 : 0) - (keys.has('arrowdown') || keys.has('s') ? 1 : 0)
      steerIn = (keys.has('arrowleft') || keys.has('a') ? 1 : 0) - (keys.has('arrowright') || keys.has('d') ? 1 : 0)
      boost = keys.has('shift')
      brake = keys.has(' ')
      const jm = Math.hypot(joy.x, joy.y)
      if (jm > 0.15) {
        throttle = -joy.y
        steerIn = -joy.x
        boost = jm > 0.95
      }
    }

    // Gerak mobil (arcade)
    const maxFwd = boost ? 15 : 9.5
    const acc = 17
    if (throttle !== 0) {
      const against = Math.sign(throttle) !== Math.sign(speed) && Math.abs(speed) > 0.3
      speed += throttle * acc * (against ? 2 : 1) * dt
    } else {
      speed *= Math.exp(-1.6 * dt)
    }
    if (brake) speed *= Math.exp(-5 * dt)
    speed = THREE.MathUtils.clamp(speed, -5, maxFwd)
    if (Math.abs(speed) < 0.02 && throttle === 0) speed = 0

    steerCur += (steerIn - steerCur) * Math.min(1, dt * 9)
    heading += steerCur * 1.9 * dt * THREE.MathUtils.clamp(speed / 4, -1, 1)
    carX += Math.sin(heading) * speed * dt
    carZ += Math.cos(heading) * speed * dt

    // Tabrakan dengan objek diam
    for (const c of colliders) {
      const dx = carX - c.x
      const dz = carZ - c.z
      const d = Math.hypot(dx, dz) || 0.001
      const min = c.r + CAR_R
      if (d < min) {
        carX = c.x + (dx / d) * min
        carZ = c.z + (dz / d) * min
        speed *= 1 - Math.min(1, 6 * dt)
      }
    }
    // Batas arena
    const dist = Math.hypot(carX, carZ)
    const lim = ARENA - 1.8
    if (dist > lim) {
      carX = (carX / dist) * lim
      carZ = (carZ / dist) * lim
      speed *= 1 - Math.min(1, 5 * dt)
    }

    // Visual mobil
    car.position.set(carX, 0, carZ)
    car.rotation.y = heading
    pitch += (-throttle * 0.035 - pitch) * Math.min(1, dt * 6)
    bodyGroup.rotation.x = pitch
    bodyGroup.rotation.z = -steerCur * speed * 0.007
    for (const w of wheels) {
      w.m.rotation.x += (speed * dt) / 0.4
      if (w.front) w.pivot.rotation.y = steerCur * 0.45
    }

    // Kotak
    for (let i = 0; i < crates.length; i++) {
      const c = crates[i]
      const dx = c.x - carX
      const dz = c.z - carZ
      const d = Math.hypot(dx, dz) || 0.001
      const min = 0.8 + CAR_R * 0.9
      if (d < min) {
        const nx = dx / d
        const nz = dz / d
        c.x = carX + nx * min
        c.z = carZ + nz * min
        const push = Math.abs(speed) * 0.9 + 1.5
        c.vx = nx * push + Math.sin(heading) * speed * 0.35
        c.vz = nz * push + Math.cos(heading) * speed * 0.35
        speed *= 1 - Math.min(1, 1.2 * dt)
      }
      for (let j = i + 1; j < crates.length; j++) {
        const o = crates[j]
        const ox = o.x - c.x
        const oz = o.z - c.z
        const od = Math.hypot(ox, oz) || 0.001
        if (od < 1.15) {
          const nx = ox / od
          const nz = oz / od
          const s = (1.15 - od) / 2
          c.x -= nx * s
          c.z -= nz * s
          o.x += nx * s
          o.z += nz * s
          const tvx = c.vx
          const tvz = c.vz
          c.vx = o.vx * 0.8
          c.vz = o.vz * 0.8
          o.vx = tvx * 0.8
          o.vz = tvz * 0.8
        }
      }
      for (const k of colliders) {
        const kx = c.x - k.x
        const kz = c.z - k.z
        const kd = Math.hypot(kx, kz) || 0.001
        if (kd < k.r + 0.6) {
          c.x = k.x + (kx / kd) * (k.r + 0.6)
          c.z = k.z + (kz / kd) * (k.r + 0.6)
          c.vx *= -0.4
          c.vz *= -0.4
        }
      }
      c.x += c.vx * dt
      c.z += c.vz * dt
      const damp = Math.exp(-2.4 * dt)
      c.vx *= damp
      c.vz *= damp
      const cr = Math.hypot(c.x, c.z)
      if (cr > ARENA - 1) {
        c.x = (c.x / cr) * (ARENA - 1)
        c.z = (c.z / cr) * (ARENA - 1)
        c.vx *= -0.4
        c.vz *= -0.4
      }
      c.m.position.set(c.x, 0.55, c.z)
      c.m.rotation.y += (c.vx - c.vz) * dt * 0.25
    }

    // Pos proyek
    nearIdx = -1
    for (let i = 0; i < stations.length; i++) {
      const s = stations[i]
      const d = Math.hypot(carX - s.x, carZ - s.z)
      const near = d < 3.4
      if (near) nearIdx = i
      s.k += ((near ? 1 : 0) - s.k) * Math.min(1, dt * 8)
      s.ringMat.emissiveIntensity = 0.35 + s.k * 1.2
      const rs = 1 + s.k * 0.06 + Math.sin(t * 5) * 0.015 * s.k
      s.ring.scale.set(rs, rs, rs)
      const ss = 1 + s.k * 0.14
      s.sprite.scale.set(5.6 * ss, 2.62 * ss, 1)
      s.sprite.position.y = s.base.y + Math.sin(t * 1.5 + i) * 0.12 + s.k * 0.3
    }
    for (const o of orbs) {
      o.rotation.y = t * 1.4
      o.position.y = 3 + Math.sin(t * 2) * 0.12
    }
    if (nearIdx !== lastNear) {
      lastNear = nearIdx
      dwell = 0
      triggered = false
      nearLabel.value = nearIdx >= 0 ? `${String(nearIdx + 1).padStart(2, '0')} · ${projects[nearIdx].title}` : ''
    }
    if (nearIdx >= 0 && activeRef.value && !triggered && !selected.value) {
      dwell = Math.abs(speed) < 6 ? dwell + dt : 0
      if (dwell > 1.1) openNear()
    }

    // Kunang-kunang
    for (let i = 0; i < FF; i++) {
      ffPos[i * 3] = ffBase[i * 3] + Math.sin(t * 0.5 + i) * 0.8
      ffPos[i * 3 + 1] = ffBase[i * 3 + 1] + Math.sin(t * 0.9 + i * 1.7) * 0.5
      ffPos[i * 3 + 2] = ffBase[i * 3 + 2] + Math.cos(t * 0.4 + i * 0.6) * 0.8
    }
    ffGeo.attributes.position.needsUpdate = true

    // Kamera
    let fovT = 55
    if (activeRef.value) {
      camAngle += angDiff(heading, camAngle) * (1 - Math.exp(-2.4 * dt))
      const back = 9.5 + Math.min(Math.abs(speed), 14) * 0.18
      want.set(carX - Math.sin(camAngle) * back, 5 + Math.abs(speed) * 0.06, carZ - Math.cos(camAngle) * back)
      look.set(carX + Math.sin(camAngle) * 3.5, 1.1, carZ + Math.cos(camAngle) * 3.5)
      fovT = 55 + Math.abs(speed) * 0.9
    } else {
      if (!reduce) orbitA += dt * 0.07
      want.set(Math.sin(orbitA) * 40, 17, 8 + Math.cos(orbitA) * 40)
      look.set(0, 2.5, 6)
      camAngle = heading
    }
    camPos.lerp(want, 1 - Math.exp(-(activeRef.value ? 5 : 1.6) * dt))
    camLook.lerp(look, 1 - Math.exp(-6 * dt))
    camera.position.copy(camPos)
    camera.lookAt(camLook)
    if (Math.abs(camera.fov - fovT) > 0.05) {
      camera.fov += (fovT - camera.fov) * Math.min(1, dt * 4)
      camera.updateProjectionMatrix()
    }

    // Cahaya mengikuti mobil
    sun.position.set(carX + 18, 30, carZ + 12)
    sun.target.position.set(carX, 0, carZ)
    sun.target.updateMatrixWorld()
  }

  const clock = new THREE.Clock()
  let t = 0
  let sentReady = false
  renderer.setAnimationLoop(() => {
     console.log('ANIMATION LOOP DIPANGGIL')

  const dt = Math.min(clock.getDelta(), 0.05)
  console.log('STATUS VISIBLE:', visible)
  if (!visible) return
  t += dt
  step(dt, t)
  renderer.render(scene, camera)
  console.log('RENDER BERJALAN')
  if (!sentReady) {
  console.log('JUMLAH OBJEK:', scene.children.length)
  console.log('POSISI KAMERA:', camera.position)
  console.log('UKURAN CANVAS:', renderer.domElement.width, renderer.domElement.height)
}
  console.log('RENDER BERJALAN', scene.children.length)
    if (!sentReady) {
  sentReady = true
  console.log('DUNIA 3D: EVENT READY TERPANGGIL')
  emit('ready')
}
  })

  cleanup = () => {
    disposed = true
    renderer.setAnimationLoop(null)
    ro.disconnect()
    io.disconnect()
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerdown', onPointerDown)
    disposables.forEach((d) => d.dispose())
    renderer.dispose()
    renderer.domElement.remove()
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div class="absolute inset-0">
    <div
      ref="host"
      class="absolute inset-0"
      role="img"
      aria-label="Dunia 3D interaktif berisi enam pos proyek yang bisa dijelajahi dengan mobil"
    />

    <div v-if="failed" class="absolute inset-0 grid place-items-center bg-ink-900 px-6 text-center text-mist">
      Dunia 3D tidak dapat ditampilkan di perangkat ini. Silakan lihat proyek di bagian bawah.
    </div>

    <!-- Petunjuk saat dekat pos proyek -->
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-3 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-3 opacity-0"
    >
      <button
        v-if="active && nearLabel"
        type="button"
        class="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full border border-fog/15 bg-white/90 px-5 py-2.5 text-sm font-medium text-fog shadow-2xl backdrop-blur-md sm:bottom-10"
        @click="api.open()"
      >
        <span class="text-rose">{{ nearLabel }}</span>
        <span class="ml-2 text-mist">{{ isTouch ? 'Ketuk untuk membuka' : 'Tahan sebentar atau tekan Enter' }}</span>
      </button>
    </Transition>

    <!-- Joystick layar sentuh -->
    <div
      v-if="active && isTouch"
      class="absolute bottom-6 left-5 z-10 h-36 w-36 touch-none select-none rounded-full border border-fog/20 bg-white/70 backdrop-blur-sm"
      @pointerdown.prevent="joyDown"
      @pointermove.prevent="joyMove"
      @pointerup="joyUp"
      @pointercancel="joyUp"
      @lostpointercapture="joyUp"
    >
      <div
        class="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-rose/80 shadow-lg"
        :style="{ transform: `translate(calc(-50% + ${knob.x * 40}px), calc(-50% + ${knob.y * 40}px))` }"
      />
    </div>
  </div>
</template>
