<template>
  <mdc-layout-app class="app">
    <sk-top-app-bar
      :title="currentStudentName || $root.$data.title"
      :start-icon="isSmall && 'search'"
      toggle-event="nav"
      slot="toolbar"
    ></sk-top-app-bar>
    <sk-drawer slot="drawer" :permanent="!isSmall" toggle-on="nav">
      <drawer-filter
        v-if="$root.$data.filter"
        :domainOptions="activeFilterOptions.domains"
        :topicOptions="activeFilterOptions.topics"
        @updated-options="updateOptions"
      ></drawer-filter>
      <drawer-student-list
        v-if="$root.$data.roster"
        :students="students"
        @change-student="selectStudent"
      ></drawer-student-list>
    </sk-drawer>
    <main id="main-container">
        <school-items
          id="school-items"
          class="card-container"
          v-if="hasSchoolItems"
          :credits="credits"
          :attendance="attendance"
        />
      <!-- The core app is a list of items. Everyone has this, and it starts with empty state data. -->
      <competency-list
        class="card-container"
        :list-items="filteredListItems"
        :dense="$root.$data.denseList"
      />
    </main>
    <mdc-tab-bar id="view-tab-bar" v-if="hasSchoolItems" @change="selectView">
      <mdc-tab icon="face">Skills</mdc-tab>
      <mdc-tab icon="check">Project</mdc-tab>
    </mdc-tab-bar>
    <!-- <portal-target name="modal" id="modal-portal"></portal-target> -->
  </mdc-layout-app>
</template>

<script>
import {
  prepareCompetency,
  getStudentName,
  getStudentNames,
  getStudentEmail,
  getStudents,
  getStudentByEmail,
  getCredits,
  getPoints,
  getAttendance,
  getListItems,
  hasData,
  getSpreadsheetId,
  getFirstStudentEmail,
  getStudentAttendance,
  getStudentId,
  getCreditsByStudentId,
  getStudentCredits,
  getCreditsSpreadsheetUrl,
  getAllowedStudentsFromUser,
  getStudentDisplayName,
  getStudentsByUser,
  getStudentCreditGroups,
  getStudentById,
  getSelectedLabels,
  keyIsInFilter,
  getFilters,
  sortListItems,
  includedInLabels,
  setFaded
} from "./scripts/sk.js";
import { getListData, getUserData } from "./scripts/sk-gas-apis.js";

import {
  addTimestampsToRows,
  parseCsvFile,
  groupBy,
  makePlaceholderArrayOfItems
} from "./scripts/utilities";

import SkTopAppBar from "./components/SkTopAppBar.vue";
import SkDrawer from "./components/SkDrawer.vue";
import CompetencyList from "./components/CompetencyList.vue";

/**
 * When I can get GAS code-splitting to work, we should aynchronously import these
 *
 * E.g., DrawerStudentList: () => import('./copmonents/DrawerStudentList.vue')
 */
import DrawerStudentList from "./components/DrawerStudentList.vue";
import DrawerFilter from "./components/DrawerFilter.vue";
import SchoolItems from "./components/SchoolItems.vue";

export default {
  components: {
    SkTopAppBar,
    SkDrawer,
    CompetencyList,
    DrawerStudentList,
    DrawerFilter,
    SchoolItems
  },
  data() {
    return {
      /**
       * The following fields get pulled from getUserData.
       *
       * {
       *    spreadsheetId: String,
       *    userEmail: String,
       *    scriptUserEmail: String,
       * }
       */
      drawerOpen: true,
      userData: {},
      /**
       * sheetData is pulled from the spreadsheetId
       */
      sheetData: {},
      /**
       * These update in other ways
       */
      selectedStudentId: "",
      selectedView: "students",
      gapi: null,
      filterOptions: {
        domains: [],
        topics: []
      }
    };
  },
  created() {
    this.getUserData();
    this.getSheetData();
  },
  methods: {
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
    },
    async getUserData() {
      try {
        const userData = await getUserData();
        this.userData = userData;
      } catch (err) {
        console.log(err);
      }
    },
    async getSheetData() {
      try {
        const sheetData = await getListData(this.$root.$data.dataRanges);
        this.sheetData = sheetData;
      } catch (err) {
        console.log(err);
      }
    },
    selectStudent(studentEvent) {
      const studentId = getStudentId(studentEvent);
      this.selectedStudentId = studentId;
    },
    selectView(index) {
      const views = ["students", "project"];
      const view = views[index];
      if (view === "students") {
        this.$root.view = "students";
        this.$root.$data.schoolItems = true;
        this.$root.$data.itemKey = "competencies";
      } else if (view === "project") {
        this.$root.view = "project";
        this.$root.$data.schoolItems = false;
        this.$root.$data.itemKey = "checkpoints";
      }
    },
    updateOptions({ filterKey, value: newOptions }) {
      this.filterOptions[filterKey] = newOptions;
    }
  },
  computed: {
    isSmall() {
      return !this.$screen.small
    },
    loadedUser() {
      return hasData("User", this.userData);
    },
    loadedSheet() {
      return hasData("Sheet", this.sheetData);
    },
    isLoaded() {
      return this.loadedUser && this.loadedSheet;
    },
    isAllowed() {
      /**
       * If this has a roster, it uses it as an access list. If not (note the ! in front of the roster accessor), everyone's allowed.
       */
      return !this.$root.$data.roster || this.students.length > 0;
    },
    isReady() {
      return this.isLoaded && this.isAllowed;
    },
    spreadsheetId() {
      return getSpreadsheetId(this.userData);
    },
    students() {
      /**
       * We want to check that the roster is true because otherwise there are no students to worry about.
       */
      if (this.isLoaded && this.$root.$data.roster) {
        return getStudentsByUser(this.userData, this.sheetData);
      } else {
        return [];
      }
    },
    hasStudents() {
      return hasData("Students", this.students);
    },
    defaultStudent() {
      if (this.hasStudents && this.isAllowed) {
        const student = this.students[0];
        return student;
      } else {
        return {};
      }
    },
    currentStudent() {
      if (this.selectedStudentId.length > 0) {
        const currentStudent = getStudentById(
          this.selectedStudentId,
          this.students
        );
        return currentStudent;
      } else {
        return this.defaultStudent;
      }
    },
    currentStudentId() {
      return getStudentId(this.currentStudent);
    },
    currentStudentName() {
      return getStudentDisplayName(this.currentStudent);
    },
    credits() {
      if (this.isReady) {
        const studentCredits = getStudentCreditGroups(
          this.currentStudentId,
          this.sheetData
        );
        return studentCredits;
      } else {
        return [];
      }
    },
    attendance() {
      if (this.isReady) {
        const attendance = getStudentAttendance(
          this.currentStudentId,
          this.sheetData
        );
        return attendance;
      } else {
        return [];
      }
    },
    hasSchoolItems() {
      return this.$root.$data.schoolItems && (hasData("Credits", this.credits) || hasData("Attendance", this.attendance));
    },
    listItems() {
      if (this.isReady) {
        const { itemKey, evidence, listItemPropMapHooks } = this.$root.$data
        const listItems = getListItems(
          this.currentStudentId,
          itemKey,
          this.sheetData,
          {
            hasEvidence: evidence,
            hasScore: evidence,
            propMapHooks: listItemPropMapHooks
          }
        );
        return listItems;
      } else {
        // If the data isn't ready, fill in placeholder data.
        // This creates references to the same object over and over again,
        // (**not** separate instances) which is fine for our purposes.
        const make2Items = makePlaceholderArrayOfItems(2);
        return make2Items({});
      }
    },
    hasListItems() {
      return hasData("ListItems", this.listItems);
    },
    sortedListItems() {
      const listItems = this.listItems;
      const sortFunction = this.isReady
        ? this.$root.$data.listItemSortByFunction
        : undefined;
      return sortListItems(listItems, sortFunction);
    },
    filteredListItems() {
      const listItems = this.sortedListItems;
      const { domains, topics } = this.filterOptions;

      const filterDomainLabels = getSelectedLabels(domains);
      const filterTopicLabels = getSelectedLabels(topics);
      const filterDomainLabelLength = filterDomainLabels.length;
      const filterTopicLabelLength = filterTopicLabels.length;
      if (filterDomainLabelLength || filterTopicLabelLength) {
        const filteredItems = listItems.filter(
          ({
            metadata: { categories: itemDomains, subcategories: itemTopics }
          }) => {
            // hasDomain = true if there are no domain filters or, if there are, the item has one of those filters
            const hasDomain = includedInLabels(filterDomainLabels, itemDomains); // filterDomainLabelLength === 0 || (itemDomains && itemDomains.some( ({ name }) => filterDomainLabels.includes(name) ))
            // hasTopic = true if there are no topic filters or, if there are, the item has one of those filters
            const hasTopic = includedInLabels(filterTopicLabels, itemTopics); // filterTopicLabelLength === 0 || (itemTopics && itemTopics.some( ({ name }) => filterTopicLabels.includes(name) ))
            return hasDomain && hasTopic;
          }
        );
        return filteredItems;
      } else {
        return listItems;
      }
    },
    activeFilterOptions() {
      const filterOptions = this.filterOptions;
      if (this.$root.$data.filter && this.isReady) {
        const { domains, topics } = filterOptions;
        const items = this.filteredListItems;
        const setFadedOptions = setFaded(items);
        const fadedDomains = setFadedOptions(domains);
        const fadedTopics = setFadedOptions(topics);
        return {
          domains: fadedDomains,
          topics: fadedTopics
        };
      } else {
        return filterOptions;
      }
    },
    points() {
      if (this.isReady) {
        // return getPoints(this.sheetData);
      } else {
        return [];
      }
    },
    hasPoints() {
      return hasData("Points", this.points);
    }
  },
  watch: {
    sortedListItems() {
      if (this.$root.$data.filter && this.isReady) {
        /**
         * This is currently only specific to WRCCS's 1st and 2nd categories.
         *
         * A more general and maintainable solution is required.
         *
         * That solution would likely involve creating an array of filter settings in
         * order of precedence. It would include the filterKey, the selector, and perhaps
         * any UI text to go with each filter.
         *
         * Since this only runs right now with WRCCS thanks to the feature flag,
         * I haven't gone about doing this.
         */
        const domainSelector = item =>
          item.metadata ? item.metadata.categories : [];
        const topicSelector = item =>
          item.metadata ? item.metadata.subcategories : [];
        const items = this.sortedListItems;

        const getDomainFilters = getFilters(item =>
          domainSelector(item).map(({ name }) => name)
        );
        this.updateOptions({
          filterKey: "domains",
          value: getDomainFilters(items)
        });
        const getTopicFilters = getFilters(item =>
          topicSelector(item).map(({ name }) => name)
        );
        this.updateOptions({
          filterKey: "topics",
          value: getTopicFilters(items)
        });
      }
    }
  }
};
</script>

<style>
#main-container {
  padding-top: var(--padding-increment);
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

#view-tab-bar {
  position: fixed;
  bottom: 0;
  background: var(--mdc-theme-background-color);
  width: calc(100% - 280px);
}

.card-container {
  /* This is the virtual scoller, so we need to leave padding alone. */
  width: 100%;
  max-width: 99vw;
}

@media screen and (min-width: 840px) {
  .card-container {
    max-width: 60vw;
  }
}

.school-enter, .school-leave-to {
  clip-path: ellipse(0% 0% at 50% 0%);
}

.school-enter-active, .school-leave-active {
  transition: clip-path var(--sk-transition);
}
</style>