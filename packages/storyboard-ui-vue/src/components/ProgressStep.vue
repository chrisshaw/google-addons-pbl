<template>
    <li class="slds-progress__item" :class="classes" :style="listStyle">
        <button class="slds-button slds-progress__marker" :style="buttonStyle">
            <span class="slds-assistive-text"><slot /></span>
        </button>
    </li>    
</template>

<script>
export default {
    props: {
        active: Boolean,
        completed: Boolean,
        size: Number,
        hide: Boolean,
        display: Boolean,
        percentPosition: Number,
        color: String
    },
    computed: {
        classes() {
            return `slds-is-${ (this.completed && 'completed') || (this.active && 'active')}`
        },
        buttonSize() {
            return 1 + 0.5 * this.size
        },
        listStyle() {
            return `left:${new Intl.NumberFormat('en-US', { style: 'percent' }).format(this.percentPosition)};`
        },
        buttonStyle() {
            return `width:${this.buttonSize}rem;height:${this.buttonSize}rem;${this.completed && `background:${this.color};border-color:${this.color};box-shadow:0 0 0.25rem rgba(0,0,0,0.5)`}`
        }
    }
}
</script>

<style>
</style>