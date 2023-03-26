import {createRouter, createWebHistory} from "vue-router"
import { defineAsyncComponent } from 'vue'
const routes = [
  {
    name: "indexVue",
    path: "/",
    component: defineAsyncComponent(() => import("../components/index"))
  },
  {
    path: "/meeting/:roomId",
    component: defineAsyncComponent(() => import("../components/meeting")),
    beforeEnter: (to, from, next) => {
      const roomId = to.params.roomId;
      if (!roomId) {
        next("/");
      } else {
        if (sessionStorage.getItem('username') === null || sessionStorage.getItem('videoMute') === null || sessionStorage.getItem('audioMute') === null || sessionStorage.getItem('remoteStreamMute') === null) {
          console.log('1111')
          next('/');
        } else {
          next();
        }
      }

    }
  },
  {
    name: "chatVue",
    path: "/chat",
    component: defineAsyncComponent(() => import("../components/chat"))
  },
  // 添加针对 /meeting 路径的规则，设置默认的 roomId 参数值并重定向到 /meeting/roomId 路径
  {
    path: "/meeting",
    redirect: "/"
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes
})
export default router
