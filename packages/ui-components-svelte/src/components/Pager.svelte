<svelte:options tag="conversational-pager"/>

<script>
  let rail;
  let pageIndex = 0

  $: hasRail = !!rail;
  $: pageLength = hasRail && rail.childElementCount - 1;
  $: isFirst = pageIndex <= 0;
  $: isLast = pageIndex >= pageLength;

  /**
   * We use a pagerFunction and stick it in the context because one day we may use custom CSS Properties
   */
  const changePage = (incDec = 1) => {
    pageIndex = pageIndex + incDec;
  };
  const goBack = () => changePage(-1);
  const goOn = () => changePage(1);
</script>

<style>
  /* :host {
    --current-page: 0;  
  } */

  .pager-container {
    padding: 10vh 10vw;
    display: flex;
    flex-flow: column nowrap;
    overflow: auto;
  }

  .frame {
    flex: 1 0 auto;
    overflow-x: hidden;
  }

  .rail {
    display: grid;
    grid-auto-flow: column;
    grid-auto-rows: 100%;
    grid-auto-columns: 100%;
  }

  nav {
    flex: 0 0 auto;
    display: flex;
    justify-content: space-between;
  }

  .hidden {
    opacity: 0;
  }

  .submit {
    background-color: var(--primary-color-dark);
    color: var(--text-color-light);
    font-weight: bold;
  }
</style>

<div class="pager-container">
  <div class="frame">
    <div
      class="rail"
      style="transform: translateX(calc(-100% * {pageIndex}));"
      bind:this={rail}>
      <slot {pageIndex} />
    </div>
  </div>
  <!-- PageController -->
  <nav>
    <button
      type="button"
      on:click={goBack}
      class:hidden={isFirst}
      disabled={isFirst}>
      Go back
    </button>
    {#if isLast}
      <button class="submit">Finish</button>
    {:else}
      <button on:click={goOn} type="button">Next</button>
    {/if}
  </nav>
</div>
