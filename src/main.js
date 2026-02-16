import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import PrimeVue from "primevue/config";
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import "primeicons/primeicons.css";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

// import "./assets/main.css";

const app = createApp(App);

app.use(store);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'none', 
    },
  },
});

const token = sessionStorage.getItem('token');
if (token) {
    store.dispatch('setAuthenticated', true);
} else {
    store.dispatch('logout');
}
app.use(ToastService);
app.use(ConfirmationService);
app.mount("#app");
