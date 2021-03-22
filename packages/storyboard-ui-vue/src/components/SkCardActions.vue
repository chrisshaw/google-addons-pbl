<template>
    <mdc-card-actions full-bleed>
        <mdc-card-action-buttons>
            <mdc-card-action-button
                v-for="(action, i) of sortedActions"
                :key="`action-${i}`"
                class="action-button"
                accent
                :href="action.href"
                :target="action.target"
                rel="noreferrer"
                @click="logAnalyticsClick(analyticsId, action.analyticsHeader)"
            >
                {{ action.label }}
            </mdc-card-action-button>
        </mdc-card-action-buttons>
    </mdc-card-actions>
</template>

<script>
import { logAnalyticsClick } from "../scripts/sk-gas-apis";
export default {
    props: {
        actionsObject: Object,
    },
    methods: {
        async logAnalyticsClick(itemId, analyticsHeader) {
            console.log('Click event fired. Log analytics click.')
            console.log('itemId', itemId, 'analyticsHeader', analyticsHeader)
            const result = await logAnalyticsClick(itemId, analyticsHeader)
            // return
        }
    },
    computed: {
        sortedActions() {
            const actions = this.actionsObject.actions
            return Object.values(actions).filter( action => action.show ).sort( (actionA, actionB) => actionA.order - actionB.order )
        },
        analyticsId() {
            return this.actionsObject.analyticsId
        }
    }
}
</script>

<style scoped>

.action-button {
    text-transform: capitalize;
}

</style>
