<svelte:options tag="sk-modal" />

<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { fade } from 'svelte/transition'

  export let mountedNodeHandler = () => {}
  let classes = ''
  export { classes as class }
  export let transition = fade

  const dispatch = createEventDispatcher()


  let modal

  onMount(() => {
    /**
     * #TODO
     * 
     * This is going to show up in an iframe in Google Apps
     * Script (not to mention for testing).
     * 
     * I need to first check if it's in an iframe, and if it
     * is I need to grab its parent iframe's body.
     */
    mountedNodeHandler(modal)

    const bod = document.body
    bod.appendChild(modal)
  })

  /**
   * In Svelte, you can "forward" events up through components with
   * a simple "on:click". But we need to swallow click events if the
   * content is clicked because the click event can close the modal
   * in parent components.
   * 
   * This is a way of saying, "You clicked on the background," without
   * having to use another div as the background. 
   */
  const handleClick = (event) => {
    const target = event.target
    if (target === modal) {
      dispatch('click')
      dispatch('modal-background-click') // mainly for debugging or modal specific handling. Probably remove later.
    }
  }

</script>

<style>
  div.modal {
    position: fixed;
    z-index: 999;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    opacity: var(--opacity);
  }
</style>

<div
  class="{`modal ${classes}`}"
  transition:fade
  bind:this={modal}
  on:click={handleClick}
  data-cy-modal
>
  <slot />
</div>
