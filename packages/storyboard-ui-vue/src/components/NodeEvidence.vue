<template>
    <node-evidence-spiral
        v-if="useSpiral"
        :evidence-array="evidenceArray"
        :max-slots="maxSlots"
        :expanded="showEvidence"
    ></node-evidence-spiral>
    <node-pie-chart
        v-else
        :percent="percentFilled"
        :empty-color="'var(--sk-very-light-gray)'"
        :bar="showEvidence"
    ></node-pie-chart>
</template>

<script>
import NodePieChart from './NodePieChart.vue'
import NodeEvidenceSpiral from './NodeEvidenceSpiral.vue'
import { makeEvidenceItem, makeEvidenceArray } from "../scripts/sk-ui.js";

export default {
    components: {
        NodePieChart,
        NodeEvidenceSpiral,
    },
    props: {
        numberFilledSlots: Number,
        numberExpiredSlots: Number,
        numberTotalSlots: Number,        
        evidence: {
            type: Array,
        },
        showEvidence: {
            type: Boolean,
            default: false
        },
        maxSlots: {
            type: Number,
            default: 9
        }
    },
    computed: {
        percentFilled() {
            return this.numberFilledSlots / this.numberTotalSlots
        },
        useSpiral() {
            const useSpiral =   this.evidence !== undefined // it has evidence
                                && this.evidence.length >= 0 // is positive
                                && this.numberTotalSlots <= this.maxSlots // doesn't go overboard
            return useSpiral
        },
        evidenceArray() {
            if (this.useSpiral) {
                return makeEvidenceArray(this.numberFilledSlots, this.numberTotalSlots, this.evidence.slice())
            }
        },
    }
}
</script>

<style scoped>

</style>
