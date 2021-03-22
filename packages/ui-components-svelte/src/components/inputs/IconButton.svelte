<svelte:options tag="icon-button" />

<script>
  let classes = ''
  export { classes as class }
  export let color = "primary";
  export let cta = "done";
  export let transition
</script>

<style>
  button {
    font-size: var(--typo-body-size);
    color: rgba(255, 255, 255, 0.92);
    min-width: calc(var(--typo-body-size) * 2.5);
    min-height: calc(var(--typo-body-size) * 2.5);
    border-radius: 50%;
    background-color: var(--primary-color);
    border: calc(var(--stroke-increment) * 2) solid var(--primary-color-light);
  }

  button.secondary {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color-light);
  }
</style>

<button transition:transition on:click class={`${color} ${classes}`}>
  <slot />
</button>
