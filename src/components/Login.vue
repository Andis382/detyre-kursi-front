<template>
  <div class="form-container">
    <div class="login-layout">

      <div class="login-left">
        <img src="@/assets/upt_logo.png" alt="Logo" class="form-logo" />
      </div>

      <Divider layout="vertical" class="login-divider" />

      <div class="login-right">
        <Card class="form-card">
          <template #title><div class="form-title">Sign in</div></template>

          <template #content>
            <form @submit.prevent="login" class="login-form">

              <Message v-if="sessionExpired" severity="warn" class="data-option" icon="pi pi-exclamation-triangle">
                {{ sessionExpired }}
              </Message>

              <Message v-if="error" severity="error" class="data-option" icon="pi pi-times-circle">
                {{ error }}
              </Message>

              <Message v-if="success" severity="success" class="data-option" icon="pi pi-check">
                {{ success }}
              </Message>

              <FloatLabel variant="on" class="data-option">
                <InputText v-model="loginText" inputId="on_label" required fluid />
                <label for="on_label">Email or Phone</label>
              </FloatLabel>

              <FloatLabel variant="on" class="data-option">
                <Password v-model="password" inputId="on_label" :feedback="false" required toggleMask fluid />
                <label for="on_label">Password</label>
              </FloatLabel>

              <Button type="submit" label="Login" class="data-option" :loading="loading" />

              <div class="form-link">
                Don't have an account yet?
                <RouterLink to="/register">Register here!</RouterLink>
              </div>

            </form>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import { ApiClient, API_LOGIN_ENDPOINT } from "@/service/app.service";

import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Message from "primevue/message";
import Card from "primevue/card";
import FloatLabel from 'primevue/floatlabel';
import Divider from 'primevue/divider';

export default {
  name: "Login",

  components: {
    InputText,
    Password,
    Button,
    Message,
    Card,
    FloatLabel,
    Divider,
  },

  data() {
    return {
      loginText: '',
      password: '',
      loading: false,
      error: null,
      success: null,
      sessionExpired: null,
    };
  },
  mounted() {
    if (this.$route.query.registered == 1) {
      this.success = 'Registration successful! Please log in.';
      this.$router.replace({ query: null });
    }
    if (this.$route.query.expired == 'true') {
      this.sessionExpired = 'Your session has expired. Please log in again.';
      this.$router.replace({ query: null });
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;
      this.success = null;
      this.sessionExpired = null;

      try {
        const { data } = await ApiClient.post(API_LOGIN_ENDPOINT, { 
          login: this.loginText, 
          password: this.password 
        });
      
        sessionStorage.setItem("token", data.token);
      
        this.$store.dispatch("setAuthenticated", true);
        this.$store.dispatch("setUserDetails", data.user);
      
        this.$router.push("/rooms");
      } catch (e) {
        this.error = e.response.data.message ?? "Invalid credentials";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style>

.form-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #eee3ce;
}

.login-layout {
  display: flex;
  align-items: center;
  gap: 4rem;
}

.login-left {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-divider {
  height: 28rem;	
  --p-divider-border-color: #080808;
  --p-divider-vertical-padding: 3rem;
  --p-divider-vertical-content-padding: 2rem;
}

.form-logo {
  width: 22rem;
} 

.form-title {
  font-weight: 700;
  font-size: 2.6rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #080808;
}

.form-card {
  width: 360px;
  border: #080808 1px solid;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-link {
  text-align: center;
  margin-bottom: 1rem;
}

.data-option {
  margin-bottom: 1rem;
}

</style>
