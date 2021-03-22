<template>
  <div class="select-root">
    <span class="select" @click="setXYThenToggle" data-cy-select>
      <mdc-body class="select-value">{{valueDisplay}}</mdc-body>
      <mdc-caption data-cy-select-label>{{label}}</mdc-caption>
    </span>

    <!-- <portal to="modal" v-if="showOptions"> -->
    <sk-portal v-if="showOptions">
      <transition appear name="fade">
        <div
          class="modal-background"
          :style="`
            --x: ${x}px;
            --y: ${y}px;
            --max-width: ${maxWidth}vw;
          `"
          @click="toggleOptions"
        >
          <div class="spacer-left"></div>
          <transition appear name="open">
            <div class="option-menu">
              <ul ref="options" key="options" class="options" data-cy-options>
                <li
                  v-for="({id, label, selected, faded}, index) of options"
                  :key="index"
                  class="option"
                  @click.stop="handleSelect(id)"
                >
                  <sk-chip :color="selected ? 'secondary' : undefined" :faded="faded">{{ label }}</sk-chip>
                </li>
              </ul>
              <mdc-fab class="options-button" icon="check" @click.stop="toggleOptions"></mdc-fab>
            </div>
          </transition>
          <div class="spacer-right"></div>
        </div>
      </transition>
    </sk-portal>
    <!-- </portal> -->
  </div>
</template>

<style scoped>
.select-root {
  display: inline-block;
}
.select {
  background: linear-gradient(
      rgba(255, 255, 255, var(--overlay-strength)),
      rgba(255, 255, 255, var(--overlay-strength))
    ),
    var(--mdc-theme-secondary);
  border-radius: var(--border-radius);
  margin: 0.25rem auto;
  padding: calc(2 * var(--padding-increment)) calc(3 * var(--padding-increment));
  display: inline-flex;
  flex-flow: column nowrap;
}

.select-value {
  color: var(--mdc-theme-secondary);
  font-weight: bold;
  text-align: center;
  /* font-size: inherit; */
  box-sizing: border-box;
  margin: 0;
  /* padding: var(--padding-increment) 0; */
  border-left: none;
  border-top: none;
  border-right: none;
  border-bottom: var(--stroke-increment) dotted var(--mdc-theme-secondary);
}

.modal-background {
  --x: 0px;
  --y: 0px;
  --max-width: 88%;
  --half-max-width: calc(var(--max-width) / 2);

  pointer-events: initial;
  /* max-width: 100vw; */
  min-height: 100vh;
  background: #ffffff; /* Currently white, maybe should be theme background-color? */
  opacity: var(--opacity);
  display: flex;
  align-items: flex-start;
  padding-top: var(--y);
}

.spacer-left {
  flex: 1 10000 calc(var(--x) - var(--half-max-width));
}

.option-menu {
  max-width: var(--max-width);
  flex: 0 1 auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.spacer-right {
  flex: 1 1000 calc(100vw - var(--x) - var(--half-max-width));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 400ms;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.options {
  padding: 0;
  list-style-type: none;
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transform: scale(1);
}

.option {
  pointer-events: initial;
  margin: calc(var(--padding-increment) / 2);
}

.options-button {
  transform: scale(1);
}

.open-enter-active,
.open-leave-active {
  transition: transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform-origin: top center;
}

.open-enter,
.open-leave-to {
  transform: scale(0);
}
</style>

<script>
import {
  createLabelString,
  getBottomY,
  getMaxWidth
} from "../../../components-svelte/src/utilities/general";

/**
 * When I get GAS code-splitting to work I should asynchronously load all these
 *
 * MdcFab is a bit odd, you need to pull the named export out.
 * E.g.:
 * ```
 * MdcFab: async () => {
 *  const MdcFAB = await import('vue-mdc-adapter/dist/fab')
 *  return MdcFAB.mdcFAB
 * }
 * ```
 */
import SkChip from "./SkChip.vue";
import { mdcFAB as MdcFab } from "vue-mdc-adapter/dist/fab";
import SkPortal from "./SkPortal.vue";
import { setSelected } from '../scripts/sk';

export default {
  components: {
    SkChip,
    MdcFab,
    SkPortal
  },
  props: {
    label: {
      type: String,
      default: "Select something"
    },
    placeholder: {
      type: String,
      default: "any"
    },
    options: {
      type: Array,
      required: true
    },
    displayFn: {
      type: Function,
      default: createLabelString("or")
    },
    onSelect: {
      type: Function,
      default: () => {}
    }
  },
  data: () => ({
    x: 0,
    y: 0,
    maxWidth: 88,
    showOptions: false
  }),
  computed: {
    valueDisplay() {
      const selections = this.options.filter(({ selected }) => selected);
      if (selections.length) {
        const labels = selections.map(({ label }) => label);
        return this.displayFn(...labels);
      } else {
        return this.placeholder;
      }
    }
  },
  methods: {
    toggleOptions() {
      this.showOptions = !this.showOptions;
    },
    setXYThenToggle(e) {
      this.x = e.clientX;
      this.y = getBottomY(e.target);
      this.toggleOptions();
    },
    handleSelect(selection) {
      const setSelectedOption = setSelected(selection)
      const newOptions = this.options.map(setSelectedOption)
      this.$emit("selected", { value: newOptions });
    }
  },
  mounted() {
    const deviceWidth = window.innerWidth;
    this.maxWidth = getMaxWidth(deviceWidth);
  }
};
</script>