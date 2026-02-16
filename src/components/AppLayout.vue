<template>
  <div class="app-layout">
    <Toolbar class="custom-toolbar">
      <template #start>
        <div class="toolbar-brand">Hotel Management</div>
        <Button label="Kërko Dhoma" icon="pi pi-search" text @click="$router.push('/rooms')" :class="{ 'active-tab': $route.path === '/rooms' }" />
        <Button label="Rezervimet e Mia" icon="pi pi-calendar" text @click="$router.push('/reservations')" :class="{ 'active-tab': $route.path === '/reservations' }" />
        <Button label="Faturat" icon="pi pi-file" text @click="$router.push('/invoices')" :class="{ 'active-tab': $route.path === '/invoices' }" />
        <Button v-if="isAdmin" label="Admin" icon="pi pi-cog" text @click="$router.push('/admin')" :class="{ 'active-tab': $route.path === '/admin' }" />
        <Button label="Profili" icon="pi pi-user" text @click="$router.push('/user-profile')" :class="{ 'active-tab': $route.path === '/user-profile' }" />
      </template>

      <template #end>
        <div class="user-info-mini">
          <span>{{ user?.first_name }} {{ user?.last_name }}</span>
          <Tag :value="isAdmin ? 'ADMIN' : 'KLIENT'" :severity="isAdmin ? 'danger' : 'info'" />
          <Button icon="pi pi-sign-out" label="Logout" severity="danger" text @click="logout" />
        </div>
      </template>
    </Toolbar>

    <div class="main-content">
      <router-view />
    </div>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script>
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

export default {
  name: 'AppLayout',
  components: { Toolbar, Button, Tag, Toast, ConfirmDialog },
  computed: {
    user() { return this.$store.getters.getUserDetails; },
    isAdmin() { return this.user?.role === 'admin'; },
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: #f4f1ea;
}

.custom-toolbar {
  background: #080808 !important;
  border: none;
  border-radius: 0;
  color: white;
  padding: 0.5rem 2rem;
}

.toolbar-brand {
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 2rem;
  color: #eee3ce;
}

.user-info-mini {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.active-tab {
  background: rgba(255, 255, 255, 0.1) !important;
  border-bottom: 2px solid #eee3ce !important;
  color: #eee3ce !important;
}
</style>
