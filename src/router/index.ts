import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Index from "../views/index.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Index",
    component: Index,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
