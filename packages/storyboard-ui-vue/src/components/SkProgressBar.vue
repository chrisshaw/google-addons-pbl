<template>
    <div class="progress bar" :style="`--percent-complete: ${ totalDone / totalPossible * 100 }%;`">
        <div class="total-possible bar" />
        <div class="total-done bar" />
    </div>
</template>

<script>
import NodeEvidenceDot from './NodeEvidenceDot.vue'

export default {
    components: {
        NodeEvidenceDot
    },
    props: {
        totalDone: {
            type: Number,
            default: 0
        },
        totalPossible: {
            type: Number,
            default: 100
        },
    }
}
</script>

<style scoped>

.bar {
    height: 2rem;
    /* The reason this works is that, per the spec,
     * if two radii overlap, the user agents (the browsers)
     * need to proportionately reduce the radii until they don't */
    border-radius: 100vmax;
}

.progress {
    position: relative;
    margin: 0.5rem 0;
}

.total-possible {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--sk-very-light-gray)
}

.total-done {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--percent-complete);
    background: var(--sk-purple);
}
</style>
