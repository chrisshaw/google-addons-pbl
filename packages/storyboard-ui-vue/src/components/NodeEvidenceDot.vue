<template>
    <div
        :style="`--starting-size: ${size}; --scale: ${scale}; --scale-increment: ${scaleIncrement};`"
        :class="`dot ${ complete && 'complete' } ${ active && 'active' }`"
    />
</template>

<script>
export default {
    props: {
        active: {
            type: Boolean,
            default: false,
        },
        complete: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: '1.6rem'
        },
        scale: {
            type: Number,
            default: 0
        },
        scaleIncrement: {
            type: String,
            default: '0.33rem'
        }
    },
}
</script>

<style scoped>

.dot {
    --dot-size: calc(var(--starting-size) + (var(--scale-increment) * var(--scale)));
    --overlay-strength: 0.25;
    flex: 0 0 auto;
    height: var(--dot-size);
    width: var(--dot-size);
    border-radius: 50%;
    background-color: var(--sk-very-light-gray);
    transition: background-color var(--sk-transition-duration) var(--sk-transition-curve);
}

.complete {
    background: var(--complete-color);
}

@keyframes active {
    from {
        transform: scale(1)
    }

    to {
        transform: scale(1.07)
    }
}

</style>
