export default {
  setUserDetails({ commit }, payload) {
    commit("setUserDetails", payload);
  },

  setAuthenticated({ commit }, payload) {
    commit("setAuthenticated", payload);
  },

  logout({ commit }) {
    commit("resetState");
    sessionStorage.clear();
  },
};
