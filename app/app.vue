<script setup lang="ts">
import { useReveal } from './composables/useReveal'
useReveal()
</script>

<template>
  <div>
    <NavBar />
    <main>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </main>
    <FooterBar />
    <ProjectModal />
  </div>
</template>
