<svelte:options tag="sk-select" />

<script>
  import { onMount, beforeUpdate, createEventDispatcher } from 'svelte'
  import { backInOut } from 'svelte/easing'
  import Modal from "../Modal.svelte";
  import Chip from "../Chip.svelte";
  import IconButton from './IconButton.svelte'
  import { createLabelString } from "../../utilities/general.js";

  export let label = "";
  export let placeholder = "any";
  export let valueDisplayHandler = createLabelString('or')
  let ContainerComponent = Modal
  export { ContainerComponent as containerComponent }
  export let containerClass = 'select-container options-modal'

  /**
   * `Select` component
   * 
   * Currently this does not actually have internal state.
   * I was getting infinite loops with 2-way binding, so I 
   * switched to just sending an event up.
   * 
   * The only way to change the values are to have the parent
   * handle the event and update the `options` prop.
   * 
   * In the future, we can:
   * 
   * 1. Add a `localOptions` aka `selectedValues` or something and 
   *    update it to reflect options whenever options changes. We
   *    can use a reactive statement for this, I think.
   * 
   * 2. (Preferred) Get 2-way binding to work with a hidden <select> element.
   */

  // options = [
  //   {
  //     id: string,
  //     label: string,
  //     selected: boolean
  //   }
  // ]
  export let options = [];
  let showOptions = false

  /**
   * Selection handling
   */
  const dispatch = createEventDispatcher()
  const handleSelect = (id) => () => {
    const newOptions = options.map( (option) => option.id === id ? { ...option, selected: !option.selected } : option )
    dispatch('selected', {
      value: newOptions
    })
  }

  $: selectedValues = options.filter( ({ selected }) => selected )
  $: labels = selectedValues.map(val => val.label);
  $: valueDisplay = selectedValues.length ? valueDisplayHandler(...labels)
                                          : placeholder

  /**
   * Option Set rendering
   */
  let x = 0
  let control

  // selectRect is undefined until control is rendered.
  $: selectRect = control && control.getBoundingClientRect()
  $: y = selectRect && selectRect.y + selectRect.height

  // scale is used in inline CSS to set the transform to scale(1)
  $: scale = +showOptions

  const toggleOptions = () => showOptions = !showOptions

  const setXOnClick = (e) => {
    x = e.screenX
  }

  /**
   * Sets the x value from the click then toggles the options
   * 
   * This ensures the X is set before the container mounts.
   * @param {Event} e - event with shape of { detail: { node: Node } }
   */
  const setXThenToggle = (e) => {
    setXOnClick(e)
    toggleOptions()
  }

  /**
   * Sets CSS custom properties on the given node for x and y positions
   * @param {HTMLElement} node - HTMLElement to style
   * @param {Number} xPos - X value
   * @param {Number} yPos - Y value
   */
  const setOptionPlacement = (xPos, yPos) => (node) => {
    const { style } = node
    style.setProperty('--x', `${xPos}px`)
    style.setProperty('--y', `${yPos}px`)
  }

  const open = (node, { duration = 400 }) => {
    const css = (t) => {
      const eased = backInOut(t)
      return `transform: scale(${eased}) translateX(-50%);`
    }

    return {
      duration,
      css
    }
  }
</script>

<style>
  .select {
    background: var(--secondary-color-very-light-background);
    border-radius: var(--border-radius);
    margin: 0.25rem auto;
    padding: calc(2 * var(--padding-increment)) calc(3 * var(--padding-increment));
    display: inline-flex;
    flex-flow: column nowrap;
  }

  .select-value {
    font-family: var(--typo-body-font-family);
    font-weight: bold;
    color: var(--secondary-color);
    text-align: center;
    /* font-size: inherit; */
    box-sizing: border-box;
    padding: var(--padding-increment) 0;
    border-left: none;
    border-top: none;
    border-right: none;
    border-bottom: var(--stroke-increment) dotted var(--secondary-color);
  }

  .select-label {
    font-family: var(--typo-display-font-family);
    font-size: var(--typo-caption-size);
    font-weight: normal;
    color: var(--text-color-dark);
  }

  :global(.options-modal) {
    --x: 0px;
    --y: 0px;
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    padding: var(--y) 5vw 5vh var(--x);
  }

  .options {
    padding: 0;
    list-style-type: none;
    max-width: 88%;
    position: relative;
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .options, :global(.options-button) {
    transform: scale(1) translateX(-50%);
  }

  .options {
    transform-origin: top left;
  }

  :global(.options-button) {
    transform-origin: center left;
  }

  .options .option {
    pointer-events: initial;
    margin: calc(var(--padding-increment) / 2);
  }

  :global(.options-button) {
    margin-top: var(--padding-increment);
  }

</style>


<!-- 
  #TODO switch to using a hidden <select> element and binding the value.

  - Better for accessibility
  - More "right"
  - Can use Svelte's 2-way binding, if I can get it to work
-->
<!-- <select></select> -->

<span bind:this={control} class="select" on:click={setXThenToggle} data-cy-select >
  <div class="select-value">{valueDisplay}</div>
  <div class="select-label" data-cy-select-label>{label}</div>
</span>

{#if showOptions}
  <svelte:component
    this={ContainerComponent}
    class={containerClass}
    mountedNodeHandler={setOptionPlacement(x, y)}
    on:click={toggleOptions}
  >
    <ul class="options" data-cy-options transition:open>
      {#each options as option (option.id)}
        <li class="option" on:click={handleSelect(option.id)}>
          <slot {option}>
            <Chip selected={option.selected}>{option.label}</Chip>
          </slot>
        </li>
      {/each}
    </ul>
    <slot name="done-button">
      <!-- IconButton is a button, so click events don't bubble. -->
      <IconButton class="options-button" color="secondary" on:click={toggleOptions} transition={open}>✔</IconButton>
    </slot>
  </svelte:component>
{/if}
