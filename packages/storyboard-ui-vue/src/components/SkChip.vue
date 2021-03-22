<template>
  <mdc-chip-set :style="`--avatar-custom-color: ${ avatarColor };`">
    <mdc-chip :class="classes" :trailing-icon="trailingIcon">
      <div class="chip-container">
        <img v-if="leadingGraphic" class="graphic avatar-image" :src="leadingGraphic" />
        <sk-letter
          v-else-if="avatarText"
          :class="`graphic avatar-letter ${ avatarColorClass }`"
          :characters="avatarCharacters"
          :source-text="avatarText"
        />
        <div class="chip-text">
          <mdc-caption class="chip-header">{{ chipHeader }}</mdc-caption>
          <slot />
        </div>
      </div>
    </mdc-chip>
  </mdc-chip-set>
</template>

<script>
import SkLetter from "./SkLetter.vue";

export default {
  components: {
    SkLetter
  },
  props: {
    gray: Boolean,
    faded: Boolean,
    color: {
      type: String,
      default: 'main',
      validator: value => ["main", "secondary", "accent"].includes(value)
    },
    leadingGraphic: String,
    avatarCharacters: String,
    avatarText: String,
    avatarColor: {
      type: String,
      default: "main"
    },
    chipHeader: String,
    trailingIcon: String
  },
  computed: {
    classes() {
      return {
        'sk-chip': true,
        [this.color]: true,
        gray: this.gray,
        faded: this.faded,
      }
    },
    avatarColorClass() {
      const avatarColor = this.avatarColor
      return ['main', 'secondary', 'accent'].includes(avatarColor) ? avatarColor : 'custom'
    }
  }
};
</script>

<style scoped>
.sk-chip {
  --chip-size: 2.5625rem;
  background-color: transparent;
  border-radius: 999rem;
  border: 2px solid var(--sk-very-light-gray);
  padding: 0;
  min-height: var(--chip-size);
}

.sk-chip.gray {
  background-color: var(--sk-very-light-gray);
  border: none;
}

.sk-chip.faded {
  opacity: var(--less-opacity);
}

.sk-chip.secondary {
  color: var(--mdc-theme-secondary);
  font-weight: bold;
  border: 2px solid var(--mdc-theme-secondary);
  background: linear-gradient(
      rgba(255, 255, 255, var(--opacity)),
      rgba(255, 255, 255, var(--opacity))
    )
    var(--mdc-theme-secondary);
}

.chip-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding-right: 0.85rem;
}

.graphic {
  width: var(--chip-size);
  border-radius: 50%;
}

.chip-text {
  margin: auto;
  padding-left: 0.85rem;
}

.chip-header {
  display: block;
}

.avatar-letter.main {
  background: var(--mdc-theme-primary);
}

.avatar-letter.secondary {
  background: var(--mdc-theme-secondary);
}

.avatar-letter.accent {
  background: var(--accent-color);
}

.avatar-letter.custom {
  background: var(--avatar-custom-color);
}
</style>
