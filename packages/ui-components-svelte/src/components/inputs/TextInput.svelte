<svelte:options tag="conversational-text-input" />
<script>
  export let label = "";
  export let text = "";
  export let placeholder = "";
  export let textInputType = "";
</script>

<style>

  label {
    font-size: var(--typo-caption-size);
    font-family: var(--typo-display-font-family);
    display: flex;
    flex-flow: column-reverse nowrap;
    background: linear-gradient(
        rgba(255, 255, 255, 0.92),
        rgba(255, 255, 255, 0.92)
      )
      var(--secondary-color);
    border-radius: var(--border-radius);
    padding: calc(4 * var(--padding-increment))
      calc(3 * var(--padding-increment));
  }

  input,
  textarea {
    font-family: var(--typo-body-font-family);
    font-weight: bold;
    color: var(--secondary-color);
    /* font-size: inherit; */
    box-sizing: border-box;
    padding: var(--padding-increment) 0;
    background-color: transparent;
    border-left: none;
    border-top: none;
    border-right: none;
    border-bottom: var(--stroke-increment) dotted var(--secondary-color);
    max-width: 100%;
  }

  input:disabled {
    color: var(--gray-color-dark);
  }
</style>

<label>
   {label}
  {#if textInputType === 'email'}
    <input {placeholder} type="email" bind:value={text} />
  {:else if textInputType === 'textarea'}
    <textarea cols="0" bind:value={text} />
  {:else}
    <input {placeholder} type="text" bind:value={text} />
  {/if}
</label>
