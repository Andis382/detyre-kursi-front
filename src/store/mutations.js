export default {
  setUserDetails(state, payload) {
    state.userDetails = payload;
  },

  setAuthenticated(state, payload) {
    state.authenticated = payload;
  },

  resetState(state) {
    state.userDetails = null;
    state.authenticated = false;
  },
};
