import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import AppIcon from './components/AppIcon.vue'

const app = createApp(App)
app.component('AppIcon', AppIcon)
app.use(router)
app.mount('#app')
