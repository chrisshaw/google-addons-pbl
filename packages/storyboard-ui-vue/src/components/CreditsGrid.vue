<template>
    <competency-card id="graduation-grid">
        <competency-summary class="title" title="Graduation Progress" ></competency-summary>
        <credits-grid-group
            v-for="({name, count, outOf, cssClass}, i) of creditGroups"
            :key="`cgg-${i}`"
            class="grid-group"
            :name="name"
            :count="count"
            :outOf="outOf"
            :cssClass="cssClass"
        ></credits-grid-group>
    </competency-card>    
</template>

<script>
import CompetencyCard from './CompetencyCard.vue'
import CompetencySummary from './CompetencySummary.vue'
import CreditsGridGroup from './CreditsGridGroup.vue'

export default {
    components: {
        CompetencyCard,
        CompetencySummary,
        CreditsGridGroup
    },
    props: {
        creditGroups: {
            required: true,
            type: Array
        },
    },
}
</script>

<style scoped>
#graduation-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 1rem;
    grid-template-areas:
        "title title title title title title"
        "science science science math math math"
        "social-studies social-studies social-studies physical-education physical-education physical-education"
        "english english english health health health"
        "electives electives electives electives electives electives"
    ;
    justify-content: center;
}

.title {
    grid-area: title;
}

</style>
