<script>
  import Page from "./Page.svelte";
  import { getContext } from "svelte";
  import { key, currentPageIndex } from "../scripts/pager.js";
</script>

<Page>
  <p>Which unit do you want to run?</p>
</Page>