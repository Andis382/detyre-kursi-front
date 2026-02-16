import { createRouter, createWebHistory } from "vue-router";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";
import AppLayout from "@/components/AppLayout.vue";
import RoomSearch from "@/components/RoomSearch.vue";
import MyReservations from "@/components/MyReservations.vue";
import MyInvoices from "@/components/MyInvoices.vue";
import AdminPanel from "@/components/AdminPanel.vue";
import UserProfile from "@/components/UserProfile.vue";
import { ApiClient, API_GET_USER_ENDPOINT } from "@/service/app.service";

const routes = [
  {
    path: "/",
    redirect: "/rooms",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "rooms",
        name: "RoomSearch",
        component: RoomSearch,
      },
      {
        path: "reservations",
        name: "MyReservations",
        component: MyReservations,
      },
      {
        path: "invoices",
        name: "MyInvoices",
        component: MyInvoices,
      },
      {
        path: "admin",
        name: "AdminPanel",
        component: AdminPanel,
        meta: { requiresAdmin: true },
      },
      {
        path: "user-profile",
        name: "UserProfile",
        component: UserProfile,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const token = sessionStorage.getItem('token');
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    return next('/rooms');
  }

  if (to.meta.requiresAuth && isAuthenticated) {
    try {
      await ApiClient.get(API_GET_USER_ENDPOINT);
      next();
    } catch (error) {
      sessionStorage.clear();
      next('/login?expired=true');
    }
  } else {
    next();
  }
});

export default router;
