<template>
    <div class="slds-progress">
        <ol v-if="hasMarkers" class="slds-progress__list">
            <progress-step
                v-for="(marker, i) of sizedMarkersWithStarter"
                :key="i"
                :completed="marker.complete"
                :percent-position="marker.percentPosition"
                :size="marker.size"  
                :color="progressColor"              
            >
                Step {{i}}
            </progress-step>
        </ol>        
        <div class="slds-progress-bar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" role="progressbar">
            <span class="slds-progress-bar__value" :style="progressStyle" >
                <span class="slds-assistive-text">Progress: 0%</span>
            </span>
        </div>
    </div>
</template>

<script>
import ProgressStep from "./ProgressStep.vue";
export default {
  props: {
    finalSize: {
      type: Number,
      default: 6
    },
    progress: {
      type: Number,
      default: 0.5
    },
    markers: {
      /*
      [
        { 
          description: String,
          complete: Boolean,
          percentPosition: Number,
          color: String
        }
      ]
      */
      type: Array
    }
  },
  components: {
    ProgressStep
  },
  methods: {
    makeColor(progress) {
      if (progress < 0.25) {
        return '#d5ebd5'
      } else if (progress < 0.5) {
        return '#80e27e'
      } else if (progress < 0.75) {
        return '#4caf50'
      } else if (progress < 1) {
        return '#087f23'
      } else {
        return '#ffc107'
      }
    }
  },
  computed: {
    hasMarkers() {
      return this.markers && this.markers.length
    },
    markersWithSizes() {
      return this.hasMarkers && this.markers.slice()
                                            .reverse()
                                            .map( (marker, i) => ( {...marker, size: this.finalSize - i }) )
                                            .map( (marker) => ( { ...marker, color: marker.color || this.makeColor(this.progress) }) )
                                            .reverse()
    },
    numberOfMarkers() {
      return this.markersWithSizes.length
    },
    sizedMarkersWithStarter() {
      return this.hasMarkers && [ { description: "Start!", complete: true, percentPosition: 0, size: 0 }, ...this.markersWithSizes ]
    },
    progressColor() {
      return this.hasMarkers && this.markersWithSizes.slice()
                                                      .filter( (marker, i) => marker.complete || i === 0 )
                                                      .pop()
                                                      .color
    },
    progressStyle() {
      return `width:${this.progress * 100}%;background:${this.progressColor}`;
    },
  }
};
</script>

<style lang="scss" scoped>
  .slds-progress {
    max-width: 85%;
    height: 3.5rem;
  }
  
  .slds-progress .slds-progress-bar {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    // margin-top: -0.25rem;
    left: 0;
    right: 0;
    width: 98%;
    margin-left: auto;
    margin-right: auto;
  }

  .slds-progress .slds-progress__list {
    height: 100%;
    position: relative;
  }

  .slds-progress__item {
    position: absolute;
    transform: translateX(-50%);
  }
</style>



