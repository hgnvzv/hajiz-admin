<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div
      class="rounded-full border-4 border-primary-light border-t-primary animate-spin"
      :class="sizeClass"
      role="status"
      aria-label="جاري التحميل"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    inline?: boolean
  }>(),
  { size: 'md', inline: false },
)

const sizeClass = computed(() => {
  const m = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' }
  return m[props.size]
})

const containerClass = computed(() =>
  props.inline ? 'py-4' : 'min-h-[200px] py-16',
)
</script>
