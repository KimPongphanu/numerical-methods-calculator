<template>
  <div class="method-layout">
    <div class="method-inputs">
      <h3>{{ title }}</h3>
      <slot name="inputs" />
      <slot name="buttons" />
    </div>
    <div class="method-output">
      <slot name="output" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MethodLayout',
  props: {
    title: { type: String, required: true },
  },
};
</script>
