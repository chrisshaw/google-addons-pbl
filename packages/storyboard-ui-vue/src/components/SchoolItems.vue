<template>
  <section id="school-items-layout-grid" key="academic-container">
    <credits-grid v-if="hasCredits" :credit-groups="credits" />
    <competency-list
      v-if="hasAttendance"
      :list-items="attendanceListItems"
      :dense="$root.$data.denseList"
    />
  </section>
</template>

<script>
import { hasData } from "../scripts/sk";
import CreditsGrid from "./CreditsGrid.vue";
import CompetencyList from "./CompetencyList.vue";

export default {
  components: {
    CreditsGrid,
    CompetencyList,
  },
  props: {
    attendance: Array,
    credits: Array
  },
  computed: {
    hasCredits() {
      return hasData("Credits", this.credits);
    },
    hasAttendance() {
      return hasData("Attendance", this.attendance);
    },
    attendanceListItems() {
      if (this.hasAttendance) {
        const attendance = this.attendance
        return attendance.map(({quarter, percent, nodeGraphicUrl}) => ({
          name: `Attendance for ${quarter}`,
          description: `${percent} percent`,
          completed: percent,
          outOf: 100,
          nodeGraphicUrl
        }))
      }
    }
  }
};
</script>

<style scoped>
#school-items-layout-grid {
  margin: unset;
  padding: 0;
}
</style>