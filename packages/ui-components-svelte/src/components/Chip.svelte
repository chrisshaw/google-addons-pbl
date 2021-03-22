<svelte:options tag="sk-edu" />

<script>
let classes = ''
export { classes as class }
export let selected = false
</script>

<style>
  .chip {
    display: inline-block;
    font-size: var(--typo-body-size);
    font-weight: normal;
    font-family: var(--typo-body-font-family);
    border-radius: 999rem;
    border: var(--stroke-increment) solid var(--gray-color-light);
    padding: var(--padding-increment) calc(2 * var(--padding-increment));
  }

  .chip.selected {
    /* border-width: calc(2 * var(--stroke-increment)); */
    border-color: var(--secondary-color);
    background: var(--secondary-color-very-light-background);
    color: var(--secondary-color);
    font-weight: bold;
  }
</style>

<span on:click class='chip {classes}' class:selected><slot></slot></span>