<template>
    <vue-simple-portal selector="#portal-target">
        <slot></slot>
    </vue-simple-portal>
</template>

<script>
import { Portal as VueSimplePortal } from '@linusborg/vue-simple-portal'

export default {
    components: {
        VueSimplePortal
    }
}
</script>

<style>
/**
 * This is intentionally not scoped so we can style the global portal target
 * 
 * @see index.html
 */
#portal-target {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  pointer-events: none;
  overflow-x: hidden;
  overflow-y: scroll;
}
</style>

