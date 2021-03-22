<template>
    <div class="square">
        <node-evidence-dot
            v-for="(dot, i) of total"
            :key="i"
            :complete="i + 1 <= filled"
        ></node-evidence-dot>
    </div>
</template>

<script>
import NodeEvidenceDot from './NodeEvidenceDot.vue'
export default {
    components: {
        NodeEvidenceDot
    },
    props: {
        filled: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 4
        }
    },
}
</script>

<style scoped>

.square {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-gap: 0.1rem;
}

</style>
