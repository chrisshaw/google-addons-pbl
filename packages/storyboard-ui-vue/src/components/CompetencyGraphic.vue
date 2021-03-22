<template>
<!-- Makes use of the global 'placeholder' css class -->
  <div
    :class="`${contained ? 'cropped' : 'uncropped'} ${ usePlaceholder && 'placeholder' }`"
  >
    <img v-if="graphicUrl" class="img" :src="graphicUrl" />
    <slot v-else-if="hasFallback" name="fallback"></slot>
  </div>
</template>

<script>

export default {
  props: {
    graphicUrl: String,
    contained: {
      type: Boolean,
      default: true
    },
  },
  computed: {
    hasFallback() {
      const hasFallback = !!this.$slots.fallback;
      return hasFallback;
    },
    usePlaceholder() {
      const noPlaceholderNeeded = this.graphicUrl || this.hasFallback;
      return !noPlaceholderNeeded;
    }
  }
};
</script>

<style scoped>

.uncropped {
  overflow: visible;
}

.cropped {
  overflow: hidden;
}

.img {
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
