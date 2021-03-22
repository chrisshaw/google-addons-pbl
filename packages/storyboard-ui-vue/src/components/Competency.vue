<template>
    <competency-card
        :class="`card ${ isOpen && 'open' }`"
        @click.native="toggleOpen"
        :selected="isSelected"        
        :background-graphic-url="backgroundGraphicUrl"
        :style="styles"
    >
        <competency-summary
            class="summary"
            :title="name"
            :subtitle="description"
            :description="details"
            :metadata="metadata"
            :actions="actions"
        ></competency-summary>
        <node-evidence
            v-if="$root.$data.evidence && outOf > 0"
            :class="`node`"
            :number-filled-slots="completed"
            :number-expired-slots="attempted"
            :number-total-slots="outOf"
            :evidence="evidence"
            :show-evidence="isSelected"
        ></node-evidence>
        <competency-graphic
            class="graphic"
            :graphic-url="nodeGraphicUrl"
        >
            <sk-letter v-if="backupText" slot="fallback" class="fallback-letter" :source-text="backupText"></sk-letter>
        </competency-graphic>
    </competency-card>
</template>

<script>
import CompetencySummary from './CompetencySummary.vue'
import CompetencyCard from './CompetencyCard.vue'
import NodeEvidence from './NodeEvidence.vue'
import CompetencyGraphic from './CompetencyGraphic.vue'
import SkLetter from './SkLetter.vue'

export default {
    components: {
        CompetencySummary,
        CompetencyCard,
        NodeEvidence,
        CompetencyGraphic,
        SkLetter
    },
    data: () => ({
        open: false,
    }),
    props: {
        id: {
            type: [ String, Number ]
        },
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        details: {
            type: String,
        },
        metadata: Object,
        actions: Object,
        backgroundGraphicUrl: String,
        nodeGraphicUrl: String,
        /**
         * Taking a page from early Svelte 3, we use a special 
         * `style` prop to set additional styles from the outside.
         * 
         * We do this so that we can update custom CSS properties
         * when using as a component in a virtual list.
         */
        styles: String,
        evidence: {
            type: Array,
        },
        completed: {
            type: Number,
        },
        attempted: {
            type: Number,
        },
        outOf: {
            type: Number,
        },
    },
    methods: {
        toggleOpen() {
            this.open = !this.open
        }
    },
    computed:{
        isFilled() {
            const isFilled = !!this.name
            return isFilled
        },
        isOpen() {
            /**
             * If there's evidence to expand, use the open state. If there's not, **always** use open styles (for now).
             */
            const isOpen = this.$root.$data.evidence ? this.open : true
            return isOpen
        },
        isSelected() {
            /**
             * If there's evidence to expand, use the open state. If there's not, **never** use the selected styles (for now).
             */
            const isSelected = this.$root.$data.evidence ? this.open : false
            return isSelected
        },
        backupText() {
            /**
             * The backup text feeds the SkLetter letter in the graphic.
             * 
             * For checkpoints, we want this to be a number. Which is what the little customer flag is for.
             * 
             * I should handle this better in the future.
             */

            const text = this.$root.customer === 'project' && this.name && this.name.match(/Checkpoint (\d)/)[1] || this.name
            return text
        },
    }
}
</script>

<style scoped>

.card {
    --graphic-size: 19vh; /* Room for roughly ~5.2 graphics given the current padding */
    --padding-increments: 5;
    --open-padding: calc(var(--graphic-size) + var(--padding-increment));
    padding: calc(var(--padding-increment) * var(--padding-increments));
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(2, auto);
    grid-template-areas:
        "graphic"
        "summary"
        ;
    justify-items: center;
    transition: var(--sk-transition);
}

@media screen and (min-width: 580px) {
    .card {
        grid-template-columns: 1fr var(--graphic-size);
        grid-template-areas: "summary graphic";
        justify-items: unset;
    }
}

.summary {
    grid-area: summary;
}

.node {
    grid-row-start: 1;
    grid-column-start: 1;
    grid-column-end: -1;
    place-self: flex-end;
    min-height: var(--graphic-size);
    width: var(--graphic-size);
    margin-top: 0rem;
    transition: var(--sk-transition);
}

.card.open .node {
    width: 100%;
    margin-top: var(--open-padding);
    min-height: 2rem;
}

.graphic {
    grid-area: graphic;
    background: #ffffff;
    height: var(--graphic-size);
    width: var(--graphic-size);
    transform:  scale(0.6)
                rotate(0)
                ;
    border-radius: 50%;
    box-shadow: 0 0 6rem rgba(0, 0, 0, 0.15);
    transition: var(--sk-transition);
}

.card.open .graphic {
    transform:  scale(1)
                rotate(0)
                ;
    box-shadow: unset;
    background: transparent;
    border: var(--stroke-increment) solid var(--mdc-theme-primary);    
}

.card:not(.open):hover .node {
    transform: rotate(-4deg);
}

.card:not(.open):hover .graphic {
    transform:  rotate(4deg)
                scale(0.6);
}

.fallback-letter {
    background-color: var(--mdc-theme-primary);
}

</style>
