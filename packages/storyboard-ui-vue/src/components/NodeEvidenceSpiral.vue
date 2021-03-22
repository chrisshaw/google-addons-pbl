<template>
    <ol :class="`spiral ${ expanded && 'expand' }`">
        <li v-for="(item, i) of evidenceArray"
            :key="i"
            v-bind="item"
            :style="`--rotation: ${ item.rotation };`"                
            :class="`item ${ !item.show && 'do-not-show' }`"
        >
            <div class="record">
                <node-evidence-details
                    class="details"
                    v-bind="item"
                ></node-evidence-details>
                <node-evidence-dot
                    class="dot"
                    v-bind="item"
                ></node-evidence-dot>
            </div>
        </li>
    </ol>    
</template>

<script>
import NodeEvidenceDetails from './NodeEvidenceDetails.vue'
import NodeEvidenceDot from './NodeEvidenceDot.vue'

export default {
    components: {
        NodeEvidenceDetails,
        NodeEvidenceDot
    },
    props: {
        evidenceArray: Array,
        maxSlots: Number,
        expanded: Boolean
    }
}
</script>

<style scoped>

.spiral, .item, .record, .dot {
    transition: var(--sk-transition);
}

.spiral {
    padding-inline-start: unset;
    list-style-type: none;
    margin-block-end: unset;
    margin-block-start: unset;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
}

.item {
    margin-top: 0;
    max-height: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    transform:  rotate(calc(-120deg + var(--rotation)));
}

.spiral.expand .item {
    transform: rotate(0);
}

.spiral.expand .item:not(.do-not-show) {
    margin-top: 2rem;
    max-height: 10rem;
}

.spiral.expand .item.do-not-show {
    opacity: 0;
}

.record {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
}

.details {
    padding-right: 1rem;
    clip-path: ellipse(0% 0% at 100% 0%);
    max-height: 0;
    overflow: hidden;
    transition: clip-path 500ms,
                opacity 500ms,
                max-height 500ms,
                ;    
}

.spiral.expand .item:not(.do-not-show) .details {
    clip-path: ellipse(200% 200% at 100% 0%);
    opacity: 1;
    max-height: 100rem;
    transition: max-height 500ms,
                clip-path 500ms 500ms,
                opacity 500ms 500ms
                ;
}

.dot {
    box-shadow: 0rem 0rem 1rem rgba(0, 0, 0, 0.15);    
}

.spiral.expand .dot {
    box-shadow: unset;
}

</style>
