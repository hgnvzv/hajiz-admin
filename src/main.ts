import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Toast, {
  rtl: true,
  position: 'top-center',
  timeout: 3800,
  maxToasts: 5,
})
app.mount('#app')
