<template>
  <div :class="`filter-container ${ expanded && 'expanded' }`">
    <mdc-body>
      Show me resources in 
      <conversational-select
        label="Select your domains"
        placeholder="any domain"
        :options="domainOptions"
        :display-fn="domainDisplayFn"
        @selected="notifyOfSelection('domains', $event)"
      ></conversational-select> about the topics 
      <conversational-select
        label="Select your topics"
        placeholder="all topics"
        :options="topicOptions"
        @selected="notifyOfSelection('topics', $event)"
      ></conversational-select>.
    </mdc-body>
  </div>
</template>

<style scoped>
/*
    NOTE

    This styling is declaring what the current markup *should*
    be. It works in tandem with some overrides in theme.scss
    because for whatever reason I can't ever seem to get styling
    on the nested vue-mdc-adapter components to work.

    @see themes/theme.scss
*/
.filter-container {
  --sk-drawer-filter-padding: calc(2 * var(--padding-increment));
  display: flex;
  flex-flow: column nowrap;
  padding: var(--sk-drawer-filter-padding);
  /* justify-content: space-between; */
  height: 100%;
  max-width: 25vw;
  min-width: 240px; /* Consistent with the MDC drawer theme */
}

.bottom-button {
  height: 4.5rem;
}


.expanded {
  min-width: 90vw;
}
</style>


<script>
import ConversationalSelect from "./ConversationalSelect.vue";
const domainDisplayFn = (...values) => {
  const len = values.length;
  const display =
    len > 1
      ? `the ${values.slice(0, -1).join(", ")} or ${values[len - 1]} domains`
      : `the ${values} domain`;
  return display;
};

export default {
  components: {
    ConversationalSelect
  },
  props: {
    expanded: {
      type: Boolean,
      default: false,
    },
    hideExpandButton: {
      type: Boolean,
      default: false
    },
    domainOptions: Array,
    topicOptions: Array
  },
  data: () => ({
    domainDisplayFn
  }),
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },
    notifyOfSelection(filterKey, { value }) {
      this.$emit("updated-options", { filterKey, value });
    }
  }
};
</script>

