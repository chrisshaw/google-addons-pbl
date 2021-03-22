<svelte:options tag="conversational-select" />

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
  
  let control
  let optionSet
  let showModal = false

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
                                        : emptyValueLabel

  /**
   * Option Set rendering
   */
  let x = 0

  // rect is undefined until control is rendered.
  $: rect = control && control.getBoundingClientRect()
  $: y = rect && rect.y + rect.height

  // scale is used in inline CSS to set the transform to scale(1)
  $: scale = +showModal

  const toggleModal = () => showModal = !showModal

  const setXOnClick = (e) => {
    x = e.screenX
  }

  const setOptionPlacement = (optionSet, xPos, yPos) => {
    const style = optionSet.style
    style.setProperty('--x', `${xPos}px`)
    style.setProperty('--y', `${yPos}px`)
  }

  const handleUpdate = () => {
    /**
     * beforeUpdate() runs once before the component ever mounts.
     * 
     * Additionally, optionSet will conditionally not exist.
     */
    if (optionSet) {
      setOptionPlacement(optionSet, x, y)
    }    
  }

  beforeUpdate(handleUpdate)

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
    padding: calc(2 * var(--padding-increment))
      calc(3 * var(--padding-increment));
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
    font-size: 1rem;
    font-weight: normal;
    color: var(--text-color-dark);
  }

  .options-set {
    --x: 0px;
    --y: 0px;
    position: relative;
    top: var(--y);
    left: var(--x);
    transform-origin: top left;
    transform: scale(1) translateX(-50%);
    display: inline-flex;
    flex-flow: column nowrap;
    align-items: center;
    pointer-events: none;
  }

  .options-set :global(.options-button) {
    margin-top: var(--padding-increment);
  }

  .options-chips {
    display: flex;
    flex-wrap: wrap;
    pointer-events: initial;
  }

  .options-set, .options-chips {
    justify-content: center;
  }

  .options-chips > :global(*)  {
    margin: calc(var(--padding-increment) / 2);
  }
</style>


<!-- 
  #TODO switch to using a hidden <select> element and binding the value.

  - Better for accessibility
  - More "right"
  - Can use Svelte's 2-way binding, if I can get it to work
-->
<!-- <select></select> -->

<span bind:this={control} class="select" on:click={setXOnClick} on:click={toggleModal} data-cy-select >
  <div class="select-value">{valueDisplay}</div>
  <div class="select-label" data-cy-select-label>{label}</div>
</span>

{#if showModal}
<Modal on:click={toggleModal}>
  <div class="options-set" bind:this={optionSet} transition:open>
    <div class="options-chips" data-cy-options-chips>
      {#each options as option, index (option.id)}
        <Chip on:click={handleSelect(option.id)} selected={option.selected}>{option.label}</Chip>
      {/each}
    </div>
    <IconButton class="options-button" color="secondary" on:click={toggleModal}>✔</IconButton>
  </div>
</Modal>
{/if}
