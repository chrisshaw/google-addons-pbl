import Vue from 'vue'
import VueScreen from 'vue-screen'
// These are used in multiple places.
import VueMDCTheme from 'vue-mdc-adapter/dist/theme'
import VueMDCLayoutApp from 'vue-mdc-adapter/dist/layout-app'
import VueMDCTypography from 'vue-mdc-adapter/dist/typography'
import VueMDCButton from 'vue-mdc-adapter/dist/button'
import VueMDCCard from 'vue-mdc-adapter/dist/card'
import VueMDCChips from 'vue-mdc-adapter/dist/chips'
import VueMDCTabs from 'vue-mdc-adapter/dist/tabs'

import { THEME, VIEW, FEATURES, SETTINGS } from './constants/config'
import './themes/theme.scss'
import App from './App.vue'

Object.entries(THEME).forEach(([prop, value]) => {
  const { cssName, cssValue } = value
  document.documentElement.style.setProperty(cssName, cssValue)
})

/**
 * The appropriate breakpoint is based on what's used in the styles.
 * Look in {@link './App.vue'} and make sure the following `small` breakpoint is equivalent
 */
Vue.use(VueScreen, { small: 840 })
Vue.use(VueMDCTheme)
Vue.use(VueMDCLayoutApp)
Vue.use(VueMDCTypography)
Vue.use(VueMDCButton)
Vue.use(VueMDCCard)
Vue.use(VueMDCChips)
Vue.use(VueMDCTabs)

Vue.config.productionTip = false

const data = {
  view: VIEW,
  ...FEATURES,
  ...SETTINGS
}

new Vue({
  data,
  render: h => h(App),
  mounted () {
    this.$nextTick(() => document.dispatchEvent(new Event('x-app-rendered'))
    )
  }
}).$mount('#app')
