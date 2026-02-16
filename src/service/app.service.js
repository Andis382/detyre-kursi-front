import axios from "axios";
import store from "@/store";
import router from "@/router";

/* =========================
   ENV ENDPOINTS
========================= */
export const
  API_SANCTUM_ENDPOINT = process.env.VUE_APP_API_SANCTUM_ENDPOINT,
  API_LOGIN_ENDPOINT = process.env.VUE_APP_API_LOGIN_ENDPOINT,
  API_REGISTER_ENDPOINT = process.env.VUE_APP_API_REGISTER_ENDPOINT,
  API_LOGOUT_ENDPOINT = process.env.VUE_APP_API_LOGOUT_ENDPOINT,
  API_GET_USER_ENDPOINT = process.env.VUE_APP_API_GET_USER_ENDPOINT,
  API_GET_ALL_USERS_ENDPOINT = process.env.VUE_APP_API_GET_ALL_USERS_ENDPOINT,
  API_UPDATE_USER_ENDPOINT = process.env.VUE_APP_API_UPDATE_USER_ENDPOINT,
  API_ADMIN_UPDATE_ENDPOINT = process.env.VUE_APP_API_ADMIN_UPDATE_ENDPOINT,
  API_ADMIN_DELETE_ENDPOINT = process.env.VUE_APP_API_ADMIN_DELETE_ENDPOINT,
  API_UPLOAD_PHOTO_ENDPOINT = process.env.VUE_APP_API_UPLOAD_PHOTO_ENDPOINT,
  // Hotel endpoints
  API_ROOMS_ENDPOINT = process.env.VUE_APP_API_ROOMS_ENDPOINT,
  API_ROOM_TYPES_ENDPOINT = process.env.VUE_APP_API_ROOM_TYPES_ENDPOINT,
  API_ROOMS_AVAILABLE_ENDPOINT = process.env.VUE_APP_API_ROOMS_AVAILABLE_ENDPOINT,
  API_RESERVATIONS_ENDPOINT = process.env.VUE_APP_API_RESERVATIONS_ENDPOINT,
  API_RESERVATIONS_ALL_ENDPOINT = process.env.VUE_APP_API_RESERVATIONS_ALL_ENDPOINT,
  API_PAYMENTS_ENDPOINT = process.env.VUE_APP_API_PAYMENTS_ENDPOINT,
  API_INVOICES_ENDPOINT = process.env.VUE_APP_API_INVOICES_ENDPOINT,
  API_INVOICES_ALL_ENDPOINT = process.env.VUE_APP_API_INVOICES_ALL_ENDPOINT,
  API_ADMIN_ADD_ROOM_ENDPOINT = process.env.VUE_APP_API_ADMIN_ADD_ROOM_ENDPOINT,
  API_ADMIN_ROOM_STATUS_ENDPOINT = process.env.VUE_APP_API_ADMIN_ROOM_STATUS_ENDPOINT,
  API_ADMIN_ROOM_PRICE_ENDPOINT = process.env.VUE_APP_API_ADMIN_ROOM_PRICE_ENDPOINT,
  API_ADMIN_REPORT_ENDPOINT = process.env.VUE_APP_API_ADMIN_REPORT_ENDPOINT,
  BASE_URL = process.env.VUE_APP_API_URL

/* =========================
   AXIOS INSTANCE
========================= */
export const ApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  responseType: "json",
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});


ApiClient.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) {
    const cleanToken = token.replace(/^"(.*)"$/, '$1');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

ApiClient.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (!error.response) {
      console.error('Error detected');
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isLoginRequest = error.config.url.includes(API_LOGIN_ENDPOINT);

    if (status === 401) {
  
      if (isLoginRequest) {
        return Promise.reject(error);
      }

      sessionStorage.clear();
      router.push('/login?expired=true'); 
    }

    return Promise.reject(error);
  }
);

/* =========================
   EXPORT DEFAULT
========================= */
export default {
  ApiClient,
  BASE_URL,
  API_SANCTUM_ENDPOINT,
  API_LOGIN_ENDPOINT,
  API_REGISTER_ENDPOINT,
  API_LOGOUT_ENDPOINT,
  API_GET_USER_ENDPOINT,
  API_GET_ALL_USERS_ENDPOINT,
  API_UPDATE_USER_ENDPOINT,
  API_ADMIN_UPDATE_ENDPOINT,
  API_ADMIN_DELETE_ENDPOINT,
  API_UPLOAD_PHOTO_ENDPOINT,
  API_ROOMS_ENDPOINT,
  API_ROOM_TYPES_ENDPOINT,
  API_ROOMS_AVAILABLE_ENDPOINT,
  API_RESERVATIONS_ENDPOINT,
  API_RESERVATIONS_ALL_ENDPOINT,
  API_PAYMENTS_ENDPOINT,
  API_INVOICES_ENDPOINT,
  API_INVOICES_ALL_ENDPOINT,
  API_ADMIN_ADD_ROOM_ENDPOINT,
  API_ADMIN_ROOM_STATUS_ENDPOINT,
  API_ADMIN_ROOM_PRICE_ENDPOINT,
  API_ADMIN_REPORT_ENDPOINT,
};