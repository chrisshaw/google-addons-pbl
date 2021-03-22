<template>
  <transition name="open">
    <aside v-if="permanent || open" :class="`sk-drawer`">
      <slot />
    </aside>
  </transition>
</template>

<script>
import { mdcDrawer } from "vue-mdc-adapter/dist/drawer";

export default {
  components: {
    mdcDrawer
  },
  data: () => ({
    open: false // defaults to being open so people can find it
  }),
  props: {
    permanent: Boolean,
    toggleOn: {
      type: String,
      default: "nav"
    },
    toggleOnSource: Object
  },
  mounted() {
    const bus = this.toggleOnSource || this.$root;
    bus.$on(this.toggleOn, this.toggleOpen);
  },
  methods: {
    toggleOpen() {
      if (!this.permanent) {
        this.open = !this.open;
      }
    }
  }
};
</script>

<style scoped>
.sk-drawer {
  --min-inline-size: 280px;
  min-inline-size: var(--min-inline-size);
  min-width: var(--min-inline-size);
  --max-inline-size: 100vw;
  max-inline-size: var(--max-inline-size);
  max-width: var(--max-inline-size);
  transform: translateX(0);
}

.open-enter-active,
.open-leave-active {
  transition: all 267ms ease-in-out;
}

.open-enter,
.open-leave-to {
  transform: translateX(-107%);
}
</style>
