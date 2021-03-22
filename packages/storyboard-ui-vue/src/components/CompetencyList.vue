<template>
  <virtual-list
    class="virtual-scroller"
    ref="virtualScroller"
    pagemode
    :size="graphicHeightInPx"
    :remain="renderedItems"
    :bench="benchedItems"
    :item="itemComponent"
    :itemcount="itemCount"
    :itemprops="getItemProps"
    :variable="getVariableHeight"
    :onscroll="addHeights"
  />
</template>

<script>
import Competency from "./Competency.vue";
import VirtualList from "vue-virtual-scroll-list";

const VIEWABLE_GRAPHICS = 6;
const VIEWABLE_GRAPHICS_DENSE = 9;

const itemPropSelector = (graphicHeightInPx, isDense) => {
  const graphicSize = `--graphic-size: ${graphicHeightInPx}px;`;
  const styles = isDense
    ? graphicSize + " --padding-increments: 1.5;"
    : graphicSize;

  return (items, index) => {
    const {
      name,
      description,
      details,
      metadata,
      completed,
      attempted,
      outOf,
      evidence,
      actions,
      backgroundGraphicUrl,
      nodeGraphicUrl
    } = items[index];

    return {
      name,
      description,
      details,
      metadata,
      completed,
      attempted,
      outOf,
      evidence,
      actions,
      backgroundGraphicUrl,
      nodeGraphicUrl,
      styles
    };
  };
};

/**
 * Factory function for creating a scroll event handler for the virtual scroller
 *
 * @param {Object} vm - Vue component instance to pull state from
 * @param {Boolean} overwrite - Whether to overwrite existing cached values
 */
const updateHeights = (vm, overwrite = true) => {
  /**
   * Scroll event handler that uses the vm and overwrite closure
   * to cache element heights in the virtual scroller
   * @param {Event} e - Native scroll event
   * @param {Number} startIndex - Index of first item from listItems that's rendered
   */
  return (e, { start: startIndex }) => {
    const scroller = vm.$el;
    const childArray = Array.from(scroller.children);
    childArray.forEach((child, childIndex) => {
      const itemIndex = startIndex + childIndex;
      if (!vm.heights[itemIndex] || overwrite) {
        vm.heights[itemIndex] = getHeight(child);
        vm.virtualScroller.updateVariable(itemIndex);
      }
    });
  };
};

/**
 * Takes a HTMLElement and gets the height.
 * @param {HTMLElement} node - The node you want the height of
 */
const getHeight = node => node.offsetHeight;

export default {
  components: {
    VirtualList
  },
  data: () => ({
    itemComponent: Competency,
    virtualScroller: null,
    windowHeight: 812, // iPhone X as default
    heights: {}
  }),
  props: {
    listItems: Array,
    dense: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getItemProps(itemIndex) {
      const props = this.itemPropGetter(this.listItems, itemIndex);
      return {
        key: `li-${itemIndex}`,
        props
      };
    },
    getVariableHeight(itemIndex) {
      return this.heights[itemIndex] || this.graphicHeightInPx;
    },
    addHeights(e, { start }) {
      const that = this;
      const doUpdate = updateHeights(that);
      doUpdate(e, { start });
    }
  },
  computed: {
    itemCount() {
      return this.listItems.length;
    },
    viewableGraphics() {
      return this.dense ? VIEWABLE_GRAPHICS_DENSE : VIEWABLE_GRAPHICS;
    },
    renderedItems() {
      return Math.ceil(this.viewableGraphics);
    },
    benchedItems() {
      return this.renderedItems;
    },
    graphicHeightInPx() {
      return this.windowHeight / this.viewableGraphics;
    },
    itemPropGetter() {
      return itemPropSelector(this.graphicHeightInPx, this.dense);
    }
  },
  watch: {
    listItems() {
      this.virtualScroller.forceRender();
    }
  },
  mounted() {
    this.windowHeight = window.innerHeight;
    this.virtualScroller = this.$refs.virtualScroller;
    /**
     * It's going to render the first few wrong. So let's
     * abuse the scroll event handler to update the heights.
     *
     * That way we don't have to overwrite them in the future.
     *
     * (At least if we don't care about resizing...)
     */
    // this.writeHeights()
  }
};
</script>
