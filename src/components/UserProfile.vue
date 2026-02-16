<template>
  <div class="profile-page-container">
    <Toolbar class="custom-toolbar">
      <template #start>
        <div class="toolbar-brand">UPT Profile</div>
        <Button v-if="isAdmin" label="All Users" icon="pi pi-users" text @click="openUsersManagement()" :class="{ 'active-tab': activeTab === 'admin' }" />
        <Button label="My Profile"  text @click="activeTab = 'profile'" :class="{ 'active-tab': activeTab === 'profile' }" />
      </template>

      <template #end>
        <div class="user-info-mini">
          <span>Welcome, <b>{{ user?.first_name }}</b></span>
          <Avatar :image="user?.profile_photo ? getProfileImageUrl(user?.profile_photo) : null" :icon="user?.profile_photo ? null : 'pi pi-user'" shape="circle"/>
          <Button icon="pi pi-user-edit" label="Edit Profile" severity="secondary" text @click="editProfile" />
          <Button icon="pi pi-sign-out" label="Logout" severity="danger" text @click="logout" />
        </div>
      </template>
    </Toolbar>

    <div class="main-content">
      
      <div v-if="activeTab === 'profile'" class="profile-card-container">
        <Card class="profile-card">
          <template #header>
            <div class="profile-header">
              <div class="avatar-container">
                <div class="avatar-wrapper">
                  <Avatar 
                    :image="user?.profile_photo ? getProfileImageUrl(user?.profile_photo) : null" 
                    :icon="user?.profile_photo ? null : 'pi pi-user'"
                    size="xlarge" 
                    shape="circle" 
                    class="profile-avatar" 
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    class="avatar-edit-button" 
                    rounded 
                    @click="$refs.photoInput.click()" 
                  />
                </div>
              </div>            

              <input 
                type="file" 
                ref="photoInput" 
                @change="onPhotoSelected" 
                accept="image/png, image/jpeg, image/jpg" 
                style="display: none" 
              />            

              <h2>{{ user?.first_name }} {{ user?.paternity }} {{ user?.last_name }}</h2>
              <Tag :value="user?.role || 'User'" severity="info" />
            </div>
          </template>
          <template #content>
            <div class="info-grid">
              <div class="info-item">
                <i class="pi pi-phone"></i>
                <div>
                  <label>Phone Number</label>
                  <p>{{ user?.phone }}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="pi pi-envelope"></i>
                <div>
                  <label>Email Address</label>
                  <p>{{ user?.email }}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="pi pi-calendar"></i>
                <div>
                  <label>Birthday</label>
                  <p>{{ formatDate(user?.birth_date) }}</p>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div v-if="activeTab === 'admin' && isAdmin" class="admin-container">
        <Card>
          <template #title><div class="tab-title">User Management</div></template>
          <template #content>
            <DataTable :value="allUsers" :loading="fetchingUsers" stripedRows paginator :rows="5" responsiveLayout="stack">
              <Column header="Photo">
                <template #body="slot">
                  <Avatar :image="slot.data.profile_photo ? getProfileImageUrl(slot.data.profile_photo) : null"
                          :icon="slot.data.profile_photo ? null : 'pi pi-user'"
                           shape="circle" /> 
                </template>
              </Column>
              <Column field="first_name" header="Name" sortable></Column>
              <Column field="paternity" header="Paternity"></Column>
              <Column field="last_name" header="Surname"></Column>
              <Column field="email" header="Email"></Column>
              <Column field="phone" header="Phone"></Column>
              <Column header="Actions">
                <template #body="slot">
                  <Button icon="pi pi-pencil" severity="warn" text rounded @click="editUser(slot.data)" />
                  <Button icon="pi pi-trash" severity="danger" text rounded :disabled="slot.data.id === user?.id" @click="deleteUser(slot.data.id)" />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
      <Toast />
      
      <ConfirmDialog></ConfirmDialog>
      
      <Dialog v-if="userDialog" v-model:visible="userDialog" appendTo="body" :closable="true" class="custom-dialog" modal :style="{width: '25vw'}" :pt="{
        header: { style: 'background-color: #eee3ce !important; color: #080808 !important; border-top-left-radius: 12px; border-top-right-radius: 12px;' },
        content: { style: 'background-color: #f4f1ea !important; padding-top: 1rem' },
        footer: { style: 'background-color: #f4f1ea !important; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;' } }" 
        >
          <template #header>
              <div class="custom-header-content">
                  <i class="pi pi-user-edit"></i>
                  <span class="font-bold">{{ isSelfEdit ? 'EDIT PROFILE' : 'EDIT USER' }}</span>
              </div>
          </template>
        
          <div class="form-grid">
              <div class="field">
                  <label>First Name</label>
                  <InputText fluid v-model="editingUser.first_name" maxlength="20" v-keyfilter="{ pattern: /^[\p{L}]+$/u }"/>
              </div>
              <div class="field">
                  <label>Paternity</label>
                  <InputText fluid v-model="editingUser.paternity" maxlength="20" v-keyfilter="{ pattern: /^[\p{L}]+$/u }" />
              </div>
              <div class="field">
                  <label>Last Name</label>
                  <InputText fluid v-model="editingUser.last_name" maxlength="20" v-keyfilter="{ pattern: /^[\p{L}]+$/u }"/>
              </div>
              <div class="field">
                  <label>Email</label>
                  <InputText fluid v-model="editingUser.email" />
              </div>
              <div class="field">
                  <label>Phone</label>
                  <InputMask fluid v-model="editingUser.phone" mask="+355 99 999 9999" />
              </div>
              <div class="field">
                  <label>Birthday</label>
                  <DatePicker fluid v-model="editingUser.birth_date" dateFormat="yy-mm-dd" showIcon />
              </div>
          </div>
              
          <template #footer>
              <div class="footer-buttons">
                  <Button label="Cancel" icon="pi pi-times" text @click="userDialog = false" class="cancel-btn" />
                  <Button label="Save Changes" icon="pi pi-check" @click="saveUser" :loading="saving" class="save-btn" />
              </div>
          </template>
      </Dialog>
    </div>
  </div>
</template>

<script>
import { ApiClient, BASE_URL, API_UPDATE_USER_ENDPOINT, API_GET_ALL_USERS_ENDPOINT, API_ADMIN_UPDATE_ENDPOINT, API_ADMIN_DELETE_ENDPOINT, API_UPLOAD_PHOTO_ENDPOINT } from "@/service/app.service";
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import DatePicker from 'primevue/datepicker'; 
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

export default {
  name: "UserProfile",
  components: { Toolbar, Button, Avatar, Card, Tag, DataTable, Column, Toast, ConfirmDialog, Dialog, InputText, InputMask, DatePicker },
  data() {
    return {
      BASE_URL,
      activeTab: 'profile',
      allUsers: [],
      fetchingUsers: false,
      userDialog: false,
      saving: false,
      isSelfEdit: false,
      editingUser: {},
    };
  },
  computed: {
    user() { return this.$store.getters.getUserDetails; },
    isAdmin() { return this.user?.role == 'admin'; },
    profileImage() {
        if (!this.user || !this.user.profile_photo) {
          return null;
        }
        return this.getProfileImageUrl(this.user.profile_photo);
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'admin' && this.allUsers.length === 0) {
        this.fetchAllUsers();
      }
    }
  },
  methods: {
    async fetchAllUsers() {
      this.fetchingUsers = true;
      try {
        const { data } = await ApiClient.get(API_GET_ALL_USERS_ENDPOINT);
        this.allUsers = data.result;
      } catch (e) {
        console.error("Failed to fetch users", e);
      } finally {
        this.fetchingUsers = false;
      }
    },
    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/login");
    },
    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString();
    },
    editProfile() {
      this.isSelfEdit = true;
      this.editingUser = { ...this.user, birth_date: new Date(this.user.birth_date) };
      this.userDialog = true;
    },
    editUser(user) {
      console.log('user: ', user);
      this.isSelfEdit = false;
      this.editingUser = { ...user, birth_date: new Date(user.birth_date) };
      this.userDialog = true;
    },
    async saveUser() {
      this.saving = true;
      
      const phone = this.editingUser.phone.replace(/\s+/g, '');
      const d = new Date(this.editingUser.birth_date);
      const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const payload = { ...this.editingUser, phone: phone, birth_date: formattedDate };
      
      const endpoint = this.isSelfEdit ? API_UPDATE_USER_ENDPOINT : API_ADMIN_UPDATE_ENDPOINT;

      try {
        const { data } = await ApiClient.post(endpoint, payload);
        
        if (this.isSelfEdit) {
            this.$store.dispatch("setUserDetails", data.user || data.result);
        } else {
            this.fetchAllUsers();
        }
        
        this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Data updated', life: 3000 });
        this.userDialog = false;
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Update failed', life: 3000 });
      } finally {
        this.saving = false;
      }
    },
    deleteUser(id) {
      this.$confirm.require({
        message: 'Are you sure you want to delete this user?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
          try {
            await ApiClient.post(API_ADMIN_DELETE_ENDPOINT, { id: id });
            
            this.allUsers = this.allUsers.filter(u => u.id !== id);
            this.$toast.add({ severity: 'success', summary: 'Deleted', detail: 'User removed', life: 3000 });
          } catch (e) {
            this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed', life: 3000 });
          }
        }
      });
    },
    async onPhotoSelected(event) {
      const file = event.target.files[0];
      if (!file) return;    

      if (file.size > 20 * 1024 * 1024) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'File is too large (Max 20MB)', life: 3000 });
        return;
      } 

      const formData = new FormData();
      formData.append('photo', file);   

      try {
        const { data } = await ApiClient.post(API_UPLOAD_PHOTO_ENDPOINT, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });   

        this.$store.dispatch("setUserDetails", data.result);

        this.$toast.add({ severity: 'success', summary: 'Success', detail: data.message, life: 3000 });
      } catch (e) {
        const errorMsg = e.response?.data?.message || 'Upload failed';
        this.$toast.add({ severity: 'error', summary: 'Error', detail: errorMsg, life: 3000 });
      }
    },
    getProfileImageUrl(path) {
      if (!path) return null;

      const root = BASE_URL.replace(/\/api\/?$/, ''); 

      console.log(BASE_URL);
      console.log(root);

      const fullUrl = `${root}/storage/${path}`;
      console.log(fullUrl);

      return fullUrl;
    },
    openUsersManagement(){
      this.fetchAllUsers();
      this.activeTab = 'admin';
    }
  }
};
</script>

<style scoped>
.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-edit-button {
  position: absolute !important;
  bottom: 0;
  right: 0;
  width: 32px !important;
  height: 32px !important;
  background-color: #080808 !important;
  border: 2px solid #eee3ce !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.avatar-edit-button:hover {
  background-color: #333 !important;
  transform: scale(1.1);
}

:deep(.p-avatar img) {
  object-fit: cover;
}

.profile-page-container {
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
}

.user-info-mini {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-content {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card-container {
  display: flex;
  justify-content: center;
}

.profile-card {
  width: 100%;
  max-width: 500px;
  text-align: center;
  border-radius: 12px;
  margin-top: 2rem;
  overflow: hidden;
}

.profile-header {
  padding: 2rem 0;
  background: #eee3ce;
  border-bottom: 1px solid #ddd;
}

.profile-avatar {
  width: 100px !important;
  height: 100px !important;
  font-size: 3rem !important;
  background: white;
  color: #080808;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
  padding: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-item i {
  font-size: 1.2rem;
  color: #666;
}

.info-item label {
  display: block;
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
}

.info-item p {
  margin: 0;
  font-weight: 600;
  color: #080808;
}

.active-tab {
  background: rgba(255, 255, 255, 0.1) !important;
  border-bottom: 2px solid #eee3ce !important;
  color: #eee3ce !important;
}

.tab-title {
  font-size: 2rem;
  margin-left: 0.7rem;
  margin-bottom: 2rem;
  font-weight: 600;
}

:deep(.p-dialog) {
  border-radius: 12px !important;
  overflow: hidden;
  border: none !important;
}

:deep(.p-dialog-header) {
  background-color: red !important; 
  color: #080808 !important;            
  padding: 1.5rem !important;
  border-bottom: 1px solid #d4c5a9 !important;
  border-radius: 12px;
  margin-bottom: 4rem;
}

.p-dialog-header {
  border-radius: 12px;
  margin-bottom: 4rem;
}

.custom-header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #080808;
}

:deep(.p-dialog-header-close) {
  color: #080808 !important;
}

:deep(.p-dialog-header-close:hover) {
  background-color: rgba(8, 8, 8, 0.1) !important;
}

:deep(.p-dialog-content) {
  background-color: #f4f1ea !important;
  padding: 2rem !important;
  color: #080808 !important;
}

:deep(.p-dialog-footer) {
  background-color: #f4f1ea !important;
  border-top: 1px solid #ddd;
  padding: 1.2rem !important;
  border-radius: 12px;
}

.field {
  margin-bottom: 1.2rem;
}

.field label {
  display: block;
  font-weight: bold;
  color: #080808;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

:deep(.p-inputtext) {
  background-color: white !important;
  border: 1px solid #ddd !important;
  color: #080808 !important;
  padding: 0.75rem !important;
}

:deep(.p-inputtext:focus) {
  border-color: #080808 !important;
  box-shadow: 0 0 0 1px #080808 !important;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.save-btn {
  background-color: #eee3ce !important;
  border: 1px solid #080808 !important;
  color: #080808 !important;           
  font-weight: bold !important;
  padding: 0.75rem 1.5rem !important;
}

.save-btn:hover {
  background-color: #e5d8bc !important;
}

.cancel-btn {
  color: #080808 !important;
  font-weight: 500 !important;
}

.cancel-btn:hover {
  background-color: rgba(8, 8, 8, 0.05) !important;
}
</style>