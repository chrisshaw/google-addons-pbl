<template>
  <dl class="data-box">
    <dt>{{ categoryName }}</dt>
    <template v-if="categories.length > 0">
      <dd v-for="(cat, i) of categories" :key="`category-${i}`">
        <sk-chip
          :chipHeader="categoryName"
          :avatarCharacters="cat.abbreviation"
          :avatarText="cat.name"
          :avatarColor="cat.color"
          :leadingGraphic="cat.iconUrl"
        >{{ cat.name }}</sk-chip>
      </dd>
    </template>
    <dt>{{ subcategoryName }}</dt>
    <template v-if="subcategories.length > 0">
      <dd v-for="(subCat, i) of subcategories" :key="`subcategory-${i}`">
        <sk-chip
          :chipHeader="subcategoryName"
          :avatarCharacters="subCat.abbreviation"
          :avatarText="subCat.name"
          :avatarColor="subCat.color"
          :leadingGraphic="subCat.iconUrl"
        >{{ subCat.name }}</sk-chip>
      </dd>
    </template>
    <dt>Type</dt>
    <dd>
      <sk-chip chipHeader="Type" :leadingGraphic="typeUrl">{{ typeLabel }}</sk-chip>
    </dd>
    <dt>Tags</dt>
    <template v-if="tags.length > 0">
      <dd v-for="(tag, i) of tags" :key="`tag-${i}`">
        <sk-chip gray>{{ tag }}</sk-chip>
      </dd>
    </template>
  </dl>
</template>

<script>
import { typeLabelPropMap } from "../scripts/sk-prop-maps.js";
import SkChip from "./SkChip.vue";

export default {
  components: {
    SkChip
  },
  props: {
    type: String,
    iconLink: String,
    categoryName: String,
    categories: [Object, Array],
    subcategoryName: String,
    subcategories: [Object, Array],
    tags: Array
  },
  computed: {
    typeLabel() {
      const label = typeLabelPropMap[this.type];
      return label;
    },
    typeUrl() {
      if (this.iconLink) {
        return this.iconLink;
      } else {
        const baseUrl =
          "https://drive-thirdparty.googleusercontent.com/64/type/";
        return baseUrl + this.type;
      }
    }
  }
};
</script>

<style scoped>
.data-box {
  display: flex;
  flex-wrap: wrap;
}

dl {
  margin: 0;
}

dt,
dd {
  flex: 0 0 auto;
  display: inline-flex;
  margin: 0 var(--padding-increment) var(--padding-increment) 0; /* We don't want them to be inset on the top and left. In the future we can use `gap` for this. */
}

dt {
  display: none;
}
</style>
