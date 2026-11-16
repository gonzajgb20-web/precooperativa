import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import AppIcon from './components/AppIcon.vue'
import AppCombobox from './components/AppCombobox.vue'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.warn('[Vue Global Handler]:', err, info)
}

app.component('AppIcon', AppIcon)
app.component('AppCombobox', AppCombobox)
app.use(router)
app.mount('#app')
