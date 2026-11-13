<template>
  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold" :class="domainBadgeClass(domain)">
    {{ domainLabel(domain, locale === 'en' ? 'en' : 'ar') }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { domainBadgeClass, domainLabel, parseDomainType } from '@/utils/domain'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  domainType?: unknown
}>()

const { locale } = useI18n()
const domain = computed(() => parseDomainType(props.domainType))
</script>
