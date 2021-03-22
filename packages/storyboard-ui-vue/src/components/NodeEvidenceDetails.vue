<template>
    <div>
        <mdc-body v-if="notes" class="notes" typo="body2">{{ notes }}</mdc-body>
        <mdc-button
            v-if="sourceUrl"
            :href="sourceUrl"
            target="_blank"
            rel="noopener"
            class="source"
        >View the evidence{{ hasCaption && caption }}</mdc-button>
    </div>
</template>

<script>
export default {
    props: {
        reporter: String,
        notes: String,
        timestamp: String,
        sourceUrl: String,
    },
    computed: {
        hasCaption() {
            return this.reporter || this.timestamp
        },
        caption() {
            const reporter = this.reporter
            const timestamp = this.timestamp
            return ` reported ${reporter ? `by ${reporter}` : ''}${timestamp ? ` on ${timestamp}` : ''}`
        }
    }
}
</script>

<style scoped>

.from {
    margin: 0;
}

.notes {
    margin-top: 0;
}

.metadata {
    display: block;
}

</style>
