<template>
  <mdc-card-header v-if="title" class="card-header" :title="title" :subtitle="subtitle" />
  <section v-else>
    <!-- Makes use of global 'placeholder' css class -->
    <h1 class="title-placeholder placeholder">The title is empty</h1>
    <p class="subtitle-placeholder placeholder">Data may still be loading.</p>
  </section>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      validator: value => {
        const type = typeof value;
        if (type === "undefined") {
          console.warn(
            "The name of the competency is undefined. This will render as a loading state indefinitely. Is that what you want?"
          );
        }
        return true;
      }
    },
    subtitle: String
  }
};
</script>

<style scoped>
.card-header {
  /*
  From what I can tell from the specs, overflow-wrap: break-word is what I need.
  Nevertheless, I can't get it to work without work-break: break-word.
  */
  overflow-wrap: break-word;
  word-break: break-word;
}

.title-placeholder,
.subtitle-placeholder {
  color: transparent;
  border-radius: 999rem;
  overflow: hidden;
}

.title-placeholder {
  max-width: 90%;
}

.subtitle-placeholder {
  max-width: 70%;
}
</style>
