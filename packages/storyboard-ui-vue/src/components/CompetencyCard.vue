<template>
    <section class="competency-card"
        :class="selected && 'selected'"
        :style="`--background-graphic-url: ${backgroundGraphicUrl};`"
    >
        <slot></slot>
    </section>
</template>

<script>
export default {
    props: {
        backgroundGraphicUrl: String,
        selected: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style scoped>
    .competency-card {
        background-repeat: no-repeat;
        background-size: cover;
        background-image: var(--background-graphic-url);
        border-radius: var(--border-radius);
        display: flex;
        flex-flow: column nowrap;
        transition: var(--sk-transition);
        /*
        There is a default padding, but this
        can be overwritten if need be.
        */
        padding: calc(5 * var(--padding-increment));
    }

    .competency-card.selected {
        box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.1), 0px 24px 38px 3px rgba(0, 0, 0, 0.06), 0px 9px 46px 8px rgba(0, 0, 0, 0.06)
    }    
</style>
