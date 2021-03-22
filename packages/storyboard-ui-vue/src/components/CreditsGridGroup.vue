<template>
    <div :style="`--grid-area: ${cssClass};`" class="grid-group-container">
        <mdc-caption class="subject-header">{{ name }}</mdc-caption>
        <credits-grid-credit
            v-for="(chunk, i) of creditArray"
            :key="i"
            :filled="chunk.filled"
            :total="chunk.total"
            class="grid-credit"
        ></credits-grid-credit>
    </div>
</template>

<script>
import CreditsGridCredit from './CreditsGridCredit.vue'
import { chunkNumberInArray, zip } from '../scripts/utilities';
export default {
    components: {
        CreditsGridCredit
    },
    props: {
        name: String,
        count: Number,
        outOf: Number,
        cssClass: String,
        groupSize: {
            type: Number,
            default: 4
        }
    },
    computed: {
        creditArray() {
            const multiplier = this.groupSize
            const totals = chunkNumberInArray(this.outOf * multiplier, multiplier)
            const filleds = chunkNumberInArray(this.count * multiplier, multiplier)
            const creditArray = totals.map( (total, index) => ({ filled: filleds[index], total }) )
            return creditArray
        }
    }
}
</script>

<style scoped>

.subject-header {
    flex: 0 0 100%;
    text-transform: capitalize;
    display: block;
}

.grid-group-container {
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    grid-area: var(--grid-area);    
}

.grid-credit {
    padding-bottom: 1rem;    
}

.grid-credit:not(:last-of-type) {
    padding-right: 1rem;
}
</style>
