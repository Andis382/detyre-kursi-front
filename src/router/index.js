import { createRouter, createWebHistory } from "vue-router";
import Login from "@/components/Login.vue";
import UserProfile from "@/components/UserProfile.vue";
import Register from "@/components/Register.vue";
import { ApiClient, API_GET_USER_ENDPOINT } from "@/service/app.service";

const routes = [
  {
    path: "/",
    redirect: "/login",
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
    path: "/user-profile",
    name: "UserProfile",
    component: UserProfile,
    meta: { requiresAuth: true },
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
    return next('/user-profile');
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