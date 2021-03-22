<template>
  <nav>
    <ol class="drawer-list">
      <li
        v-for="(student, i) of studentList"
        :class="`drawer-list-item ${student.current && 'current'}`"
        :key="i"
        @click="$emit('change-student', student)"
      >
        <mdc-subheading typo="subtitle1">{{ student.name }}</mdc-subheading>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.drawer-list {
  display: flex;
  flex-flow: column nowrap;
  /*
  List style resets
  */
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.drawer-list-item {
    display: flex;
    align-items: center;
    flex: 1 0 auto;
    --min-block-size: 9vh;
    min-block-size: var(--min-block-size);
    min-height: var(--min-block-size);
    --padding-inline-start: 2rem;
    padding-inline-start: var(--padding-inline-start);
    padding-left: var(--padding-inline-start);
    /* need to relatively position for the ::after pseudo-element */
    position: relative;
    overflow: hidden;
}

.drawer-list-item::after {
    content: "";
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-image: radial-gradient(circle, #222222 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10,10);
    opacity: 0;
    transition: transform 267ms, opacity 600ms;
}

.drawer-list-item:active::after {
    transform: scale(0, 0);
    opacity: 0.2;
    transition: 0s;
}

.drawer-list-item:hover {
    background: rgba(34, 34, 34, calc(1 - var(--opacity)));
}
</style>

<script>
import {
  getStudentId,
  getStudentEmail,
  makeEmailObject,
  makeIdObject,
  getStudentDisplayName
} from "../scripts/sk.js";
import { mdcDrawerList, mdcDrawerItem } from "vue-mdc-adapter/dist/drawer";

export default {
  components: {
    mdcDrawerList,
    mdcDrawerItem
  },
  props: {
    students: Array,
    required: true
  },
  computed: {
    studentList() {
      const list = this.students.map(student => {
        const studentEmail = getStudentEmail(student);
        const studentId = getStudentId(student);
        const name = getStudentDisplayName(student);
        const listedStudent = {
          ...makeEmailObject(studentEmail),
          ...makeIdObject(studentId),
          name
        };
        return listedStudent;
      });
      return list;
    }
  }
};
</script>
