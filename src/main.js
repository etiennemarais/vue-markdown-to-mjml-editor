import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import BurstsMjmlApi from './BurstsMjmlApi'

/**
 * Automatically load all the components into the application
 */
const files = require.context('./components', true, /\.vue$/i)
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

Vue.config.productionTip = false

window.BurstsMjmlApi = new BurstsMjmlApi(process.env.VUE_APP_MJML_URL)

/* Register Outside Libs */
import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)
import Buefy from 'buefy'
Vue.use(Buefy)

new Vue({
  render: h => h(App)
}).$mount('#app')
