import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";

const store = createStore({
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
    }),
  ],

  state: {
    userDetails: null,
    authenticated: false,
  },

  mutations,
  actions,
  getters,
});

export default store;
