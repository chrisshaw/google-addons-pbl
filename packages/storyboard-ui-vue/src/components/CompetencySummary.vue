<template>
  <div class="competency-summary">
    <sk-card-header class="competency-header" :title="title" :subtitle="subtitle" />
    <data-box class="competency-metadata" v-if="$root.$data.dataBox && hasMetadata" v-bind="namedMetadata"></data-box>
    <sk-card-actions v-if="hasActions" class="competency-actions" :actions-object="actions"></sk-card-actions>
  </div>
</template>

<script>
import DataBox from "./DataBox.vue";
import SkCardHeader from './SkCardHeader.vue'
import SkCardActions from "./SkCardActions.vue";
export default {
  components: {
    DataBox,
    SkCardHeader,
    SkCardActions
  },
  props: {
    metadata: Object,
    actions: Object,
    title: {
      type: String,
    },
    subtitle: String,
    description: String
  },
  computed: {
    hasMetadata() {
      return !!this.metadata;
    },
    namedMetadata() {
      return {
        ...this.metadata,
        categoryName: this.$root.$data.categoryName,
        subcategoryName: this.$root.$data.subcategoryName
      };
    },
    hasActions() {
      const isObject = typeof this.actions === 'object'
      const isDefined = this.actions !== undefined
      const hasValue = this.actions !== null
      return isObject && isDefined && hasValue
    }
  }
};
</script>

<style scoped>
.competency-summary {
  display: flex;
  flex-flow: column nowrap;
  transition: var(--sk-transition);
}

.competency-header {
  padding: 0 calc(3 * var(--padding-increment)) 0 0;
  text-overflow: ellipsis;
}

.competency-metadata {
  margin-top: var(--padding-increment);
}

.competency-actions {
  margin-top: auto;
}
</style>
