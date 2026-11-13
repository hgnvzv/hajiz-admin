<template>
  <label class="block" v-bind="$attrs">
    <span class="label-field">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
      <span v-else-if="optional" class="font-medium text-slate-400"> ({{ optionalLabel }})</span>
    </span>
    <slot />
    <span v-if="error" class="mt-1 block text-xs font-bold text-danger">{{ error }}</span>
    <span v-else-if="hint" class="mt-1 block text-xs text-app-muted">{{ hint }}</span>
  </label>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{
  label: string
  required?: boolean
  optional?: boolean
  optionalLabel?: string
  error?: string
  hint?: string
}>()
</script>
