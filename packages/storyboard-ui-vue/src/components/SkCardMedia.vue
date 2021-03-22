<template>
    <figure class="bg" :style="{ backgroundImage: backgroundImage || fallbackGradient }">
        <figure :class="`${smallImage && 'small-image'} art`" :style="{ backgroundImage: `url(${require(`../assets/images/shabazz/${ artUrl || fallbackArtUrl }`)})` }"/>
    </figure>    
</template>

<script>
export default {
    props: {
        backgroundImage: {
            type: String,
        },
        artUrl: {
            type: String,
        },
        smallImage: {
            type: Boolean,
            default: false
        },
    },
    data: () => ({
        artUrls: [
            'm-shabazz-crawford.svg',
            'm-shabazz-flower-1.svg',
            'm-shabazz-flower-2.svg',
            'm-shabazz-flower-3.svg',
            'm-shabazz-flower-4.svg',
            'm-shabazz-flower-5.svg',
            'm-shabazz-wildflower.svg',
            // 'm-shabazz-x-face.svg'
        ]
    }),
    computed: {
        fallbackArtUrl() {
            return this.artUrls[Math.floor(Math.random() * this.artUrls.length)]
        },
        fallbackGradient() {
            return `linear-gradient(to right, rgba(254,239,57,0.55), rgba(254,239,57,0.0))`
        }
    }
}
</script>

<style scoped>

figure {
  background-repeat: no-repeat;
  display: flex;
}

figure.bg {
  background-size: cover;
}

.small-image {
  padding-top: 3rem;
}

figure.art {
  padding-top: 10rem;    
  background-size: contain;
  background-position: right;
  position: relative;
  bottom: -1rem;
  right: 1rem;
  flex: 1;
}

</style>
