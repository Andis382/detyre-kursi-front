<template>
  <div class="form-container">
    <div class="login-layout">

      <div class="login-left">
        <img src="@/assets/upt_logo.png" alt="Logo" class="form-logo" />
      </div>

      <Divider layout="vertical" class="login-divider" />

      <div class="login-right">
        <Card class="form-card">
          <template #content>
            <form @submit.prevent="register" class="login-form">
              <div class="form-title">Sign up</div>
              <Message v-if="error" severity="error" class="data-option" icon="pi pi-times-circle"> 
                {{ error }} 
              </Message>
            
              <FloatLabel variant="on" class="data-option">
                <InputText v-model="name" v-keyfilter="{ pattern: /^[\p{L}]+$/u }" inputId="on_label" required fluid />
                <label for="on_label">Name</label>
              </FloatLabel>

              <FloatLabel variant="on" class="data-option">
                <InputText v-model="paternity" v-keyfilter="{ pattern: /^[\p{L}]+$/u }" inputId="on_label" required fluid />
                <label for="on_label">Paternity</label>
              </FloatLabel>

              <FloatLabel variant="on" class="data-option">
                <InputText v-model="surname" v-keyfilter="{ pattern: /^[\p{L}]+$/u }" inputId="on_label" required fluid />
                <label for="on_label">Surname</label>
              </FloatLabel>

              <FloatLabel variant="on" class="data-option">
                <InputMask v-model="phone" mask="+355 99 999 9999" inputId="phone_number" fluid required />
                <label for="phone_number">Phone number</label>
              </FloatLabel>

              <FloatLabel variant="on" class="data-option">
                <DatePicker v-model="birthday" inputId="on_label" required fluid showClear :maxDate=today /> 
                <label for="on_label">Birthday</label>
              </FloatLabel>
            
              <div class="data-option">
                <FloatLabel variant="on">
                  <InputText v-model="email" type="email" name="email" inputId="on_label" required fluid />
                  <label for="on_label">Email</label>
                </FloatLabel>
                <div v-if="errors.email" class="error-msg">
                  {{ errors.email }}
                </div>
              </div>

              <div class="data-option">
                <FloatLabel variant="on">
                  <Password  v-model="password" inputId="on_label" :feedback="false" required toggleMask fluid />
                  <label for="on_label">Password</label>
                </FloatLabel>
                <div v-if="errors.password" class="error-msg">
                  {{ errors.password }}
                </div>
              </div>

              <div class="data-option">
                <FloatLabel variant="on">
                  <Password  v-model="confirm_password" inputId="on_label" :feedback="false" required toggleMask fluid />
                  <label for="on_label">Confirm Password</label>
                </FloatLabel>
                <div v-if="errors.confirm_password" class="error-msg">
                  {{ errors.confirm_password }}
                </div>
              </div>
              
              <Button type="submit" label="Register" class="data-option" :loading="loading" />
            
              <div class="form-link">
                Already have an account?
                <RouterLink to="/login">Login here!</RouterLink>
              </div>
            
            </form>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import { ApiClient, API_REGISTER_ENDPOINT } from "@/service/app.service";

import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Message from "primevue/message";
import Card from "primevue/card";
import FloatLabel from 'primevue/floatlabel';
import { DatePicker } from "primevue";
import Divider from 'primevue/divider';
import InputMask from "primevue/inputmask";
import KeyFilter from 'primevue/keyfilter';

export default {
  name: "Register",
  directives: {
    'keyfilter': KeyFilter
  },
  components: {
    InputText,
    Password,
    Button,
    Message,
    Card,
    FloatLabel,
    DatePicker,
    Divider,
    InputMask,
  },

  data() {
    return {
      name: '',
      paternity: '',
      surname: '',
      phone: '',
      birthday: '',
      email: '',
      password: '',
      confirm_password: '',
      loading: false,
      error: null,
      today: new Date(),
      errors: {
        password: '',
        confirm_password: '',
        email: '',
      },
      formattedDate: null,
    };
  },
  mounted() {
  },
  watch: {
    password() {
      this.validatePassword();
    },
    confirm_password() {
      this.validatePassword();
    },
    email(value) {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !pattern.test(value)) {
        this.errors.email = "ⓘ Please enter a valid email address.";
      } else {
        this.errors.email = "";
      }
    }
  },
  methods: {
    async register() {
      this.error = null;
      if (!this.validatePassword()) { return; }
      this.loading = true;
      const phone = this.phone.replace(/\s+/g, '');
      if (this.birthday) {
        const d = new Date(this.birthday);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        this.formattedDate = `${year}-${month}-${day}`;
      }
      const payload = {
        first_name: this.name,
        paternity: this.paternity,
        last_name: this.surname,
        phone: phone,
        birth_date: this.formattedDate,
        email: this.email,
        password: this.password,
      };

      try {
        await ApiClient.post(API_REGISTER_ENDPOINT, payload);
        this.$router.push({ path: "/login", query: { registered: 1 } });
      } catch (e) {
        this.error = e.response.data.message ?? "Registration failed";
      } finally {
        this.loading = false;
      }
    },
    clearPasswordErrors() {
      this.errors = {
        password: '',
        confirm_password: '',
      };
    },
    validatePassword() {
      this.clearPasswordErrors();

      const lowerCase = /[a-z]/;
      const upperCase = /[A-Z]/;
      const numbers = /[0-9]/;
      const specialChar = /[^A-Za-z0-9]/;

      if (!this.password || this.password.length < 8) {
        this.errors.password =
          "ⓘ Password must be at least 8 characters long.";
        return false;
      }
    
      if (!lowerCase.test(this.password)) {
        this.errors.password =
          "ⓘ Password must contain at least one lowercase letter.";
        return false;
      }
    
      if (!upperCase.test(this.password)) {
        this.errors.password =
          "ⓘ Password must contain at least one uppercase letter.";
        return false;
      }
    
      if (!numbers.test(this.password)) {
        this.errors.password =
          "ⓘ Password must contain at least one number.";
        return false;
      }
    
      if (!specialChar.test(this.password)) {
        this.errors.password =
          "ⓘ Password must contain at least one special character.";
        return false;
      }
    
      if (this.password !== this.confirm_password) {
        this.errors.confirm_password =
          "ⓘ Passwords do not match.";
        return false;
      }
    
      return true;
    },
  },
};
</script>

<style>
  
.error-msg {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #080808;
  background-color: #eee3ce;
  padding: 4px 8px;
  border-radius: 4px;
  border: #f3f3f3 1px solid;
}

</style>