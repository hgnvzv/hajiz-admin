<template>
  <LegalSection
    v-for="(section, index) in sections"
    :key="section.title"
    :number="index + 1"
    :title="section.title"
    :delay="index * 60"
  >
    <p v-for="(p, i) in section.paragraphs ?? []" :key="`p-${i}`" v-html="formatParagraph(p)" />
    <ul v-if="section.list?.length">
      <li v-for="(item, i) in section.list" :key="`li-${i}`">{{ item }}</li>
    </ul>
  </LegalSection>
</template>

<script setup lang="ts">
import LegalSection from '@/components/public/LegalSection.vue'
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_WHATSAPP_URL, WEBSITE_URL } from '@/content/public/constants'
import type { LegalSectionContent } from '@/content/public/legalPages'

defineProps<{
  sections: LegalSectionContent[]
}>()

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatParagraph(text: string): string {
  const escaped = escapeHtml(text)
  const emailLink = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`
  const whatsappLink = `<a href="${SUPPORT_WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">${SUPPORT_PHONE}</a>`
  const siteLink = `<a href="${WEBSITE_URL}" target="_blank" rel="noopener noreferrer">${WEBSITE_URL}</a>`
  return escaped
    .replaceAll(SUPPORT_EMAIL, emailLink)
    .replaceAll(SUPPORT_PHONE, whatsappLink)
    .replaceAll(WEBSITE_URL, siteLink)
}
</script>
