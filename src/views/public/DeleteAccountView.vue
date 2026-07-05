<template>
  <PublicPageShell :title="content.pageTitle" :subtitle="content.pageSubtitle">
    <LegalPageSections :sections="content.sections" />
  </PublicPageShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PublicPageShell from '@/components/public/PublicPageShell.vue'
import LegalPageSections from '@/components/public/LegalPageSections.vue'
import { usePublicLocale } from '@/composables/usePublicLocale'
import { useReactivePageMeta } from '@/composables/useReactivePageMeta'
import { deleteAccountContent } from '@/content/public/legalPages'

const { t } = usePublicLocale()
const content = computed(() => t(deleteAccountContent))
const metaTitle = computed(() => content.value.metaTitle)
const metaDescription = computed(() => content.value.metaDescription)

useReactivePageMeta(metaTitle, metaDescription)
</script>
