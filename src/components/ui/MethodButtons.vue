<template>
  <div class="btn-row">
    <button type="button" class="btn btn-random" @click="$emit('random')">{{ randomLabel }}</button>
    <button type="button" class="btn btn-calculate" @click="$emit('calculate')">{{ calculateLabel }}</button>
    <button type="button" class="btn btn-reset" @click="$emit('reset')">{{ resetLabel }}</button>
  </div>
</template>

<script>
export default {
  name: 'MethodButtons',
  props: {
    randomLabel: { type: String, default: 'Random' },
    calculateLabel: { type: String, default: 'Calculate' },
    resetLabel: { type: String, default: 'Reset' },
  },
  emits: ['random', 'calculate', 'reset'],
};
</script>
