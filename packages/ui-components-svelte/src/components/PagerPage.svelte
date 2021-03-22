<svelte:options tag="conversational-page" />

<script>
  import { onMount } from "svelte";
  let classes
  export { classes as class }
  export let active = false
</script>

<section class:active class={classes}>
  <slot />
</section>
