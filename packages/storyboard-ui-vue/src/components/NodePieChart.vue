<template>
    <div
        :class="`pie-container ${ bar && 'bar' }`"
        :style="`--percent: ${percent * 100}%; --empty-color: ${ emptyColor };`"
    >
        <div
            class="pie"
            :style="`--polygon-coordinates: ${ polygonCoordinates }; --square-coordinates: ${ squareCoordinates };`"
        ></div>
    </div>
</template>

<script>
import {
    makePieChartPolygonClipPaths,
    getPolygonCoordinates,
    getSquareCoordinates
} from "../scripts/sk-ui.js";

export default {
    props: {
        percent: Number,
        emptyColor: {
            type: String,
            default: 'var(--mdc-theme-background-color)'
        },
        bar: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        coordinates() {
            return makePieChartPolygonClipPaths(this.percent)
        },
        polygonCoordinates() {
            return this.coordinates && getPolygonCoordinates(this.coordinates)
        },
        squareCoordinates() {
            return this.coordinates && getSquareCoordinates(this.coordinates)
        }
    }
}
</script>

<style scoped>

.pie-container, .pie {
    transition: var(--sk-transition);
}

.pie-container {
    display: flex;
    background-color: var(--empty-color);
    border-radius: 50%;
}

.pie-container.bar {
    border-radius: 0;
}

.pie {
    width: 100%;
    flex: 0 0 auto;
    background: var(--complete-color);
    border-radius: 50%;
    clip-path: polygon(var(--polygon-coordinates));
}

.pie-container.bar .pie {
    border-radius: 0;
    clip-path: polygon(var(--square-coordinates));
    width: var(--percent);
}

</style>
