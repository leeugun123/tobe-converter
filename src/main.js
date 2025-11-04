// main.js
import { createApp } from "vue";
import App from "./App.vue";
import { Quasar, Dialog, Notify, Loading } from "quasar";

// Quasar 스타일 불러오기
import "quasar/dist/quasar.css";
import "@quasar/extras/material-icons/material-icons.css";

const app = createApp(App);

app.use(Quasar, {
  plugins: {
    Dialog,
    Notify,
    Loading,
  },
  config: {
    brand: {
      primary: "#027be3",
      secondary: "#26a69a",
      accent: "#9c27b0",
    },
  },
});

app.mount("#app");
