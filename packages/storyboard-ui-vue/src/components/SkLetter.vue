<template>
    <svg viewBox="0 0 100 100">
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="letter">
            {{ letter }}
        </text>
    </svg>
</template>

<script>
export default {
    props: {
        characters: String,
        sourceText: String,
    },
    computed: {
        letter() {
            const characters = this.characters
            if (characters) {
                return characters
            } else {
                return this.sourceText.charAt(0).toUpperCase()
            }
        },
    }
}
</script>

<style scoped>
svg {
    height: auto;
}

.letter {
    fill: rgba(255, 255, 255, 0.9);
    font-size: 48px;
    font-family: 'Roboto', sans-serif;
}
</style>

