<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    :aria-labelledby="icon"
    role="presentation"
    >
    <title :id="icon" lang="en">{{ icon }} icon</title>
    <g :fill="color">
        <component :is="iconTemplate" />
    </g>
    <slot />
  </svg>
</template>

<script>
import SvgIconTemplateMenu from './templates/SvgIconTemplateMenu.vue'
import SvgIconTemplateSearch from './templates/SvgIconTemplateSearch.vue'
import SvgIconTemplateMissingImage from './templates/SvgIconTemplateMissingImage.vue'
/**
 * @module SvgIconBase
 * Base Vue component for rendering different svg icons by slotting in their respective components.
 * 
 * Icon components must all share the same viewbox if they hope to work correctly. The current
 * viewbox is 24 x 24.
 * 
 * @see https://vuejs.org/v2/cookbook/editable-svg-icons.html
 * 
 * @todo There's got to be some way to asynchronously load only the chosen component, and then keep it alive.
 */
export default {
    data: () => ({
        supportedComponents: {
            menu: SvgIconTemplateMenu,
            search: SvgIconTemplateSearch,
            'image-search': SvgIconTemplateMissingImage
        }
    }),
    props: {
        icon: {
            type: String,
            default: 'unknown-svg',
        },
        width: {
            type: [String, Number],
            default: 24
        },
        height: {
            type: [String, Number],
            default: 24
        },
        color: {
            type: String,
            default: 'currentColor',
        }
    },
    computed: {
        iconTemplate() {
            const icon = this.supportedComponents[this.icon]
            if (icon) {
                return icon
            } else {
                return SvgIconTemplateMissingImage
            }
        }
    }
}
</script>