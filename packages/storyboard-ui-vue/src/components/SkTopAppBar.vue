<template>
  <header class="sk-top-app-bar">
    <a
      class="icon"
      @click.prevent.stop="dispatchToggleEvent"
      v-if="startIcon"
    >
      <sk-svg-icon :icon="startIcon"/>
    </a>
    <mdc-title :class="`title ${startIcon || 'no-icon'}`">{{ title }}</mdc-title>
  </header>
</template>

<script>
import SkSvgIcon from './svg-icons/SvgIconBase.vue'

export default {
  components: {
    SkSvgIcon
  },
  props: {
    title: String,
    startIcon: {
      type: [String, Boolean],
    },
    toggleEvent: {
      type: String,
      default: 'nav'
    },
    toggleEventTarget: {
      type: Object,
    }
  },
  data: () => ({
    open
  }),
  computed: {
    eventTarget() {
      if (this.toggleEventTarget) {
        return this.toggleEventTarget
      } else {
        return this.$root
      }
    }
  },
  methods: {
    dispatchToggleEvent() {
      this.eventTarget.$emit(this.toggleEvent)
    }
  }
};
</script>

<style scoped>
.sk-top-app-bar {
  --sk-top-app-bar-padding: calc(2 * var(--padding-increment));
  --mdc-theme-on-primary: var(--mdc-theme-text-primary-on-background);
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: white;
  color: var(--mdc-theme-text-primary-on-background);
  display: flex;
  flex-flow: row nowrap;
	width: 100%;
}

.icon {
  display: block;
  cursor: pointer;
  display: flex;
  align-items: center;
  /* margin: auto initial; */
  padding-left: var(--sk-top-app-bar-padding);
  padding-right: var(--sk-top-app-bar-padding);
}

.title.no-icon {
  padding-left: var(--sk-top-app-bar-padding);
}
</style>
