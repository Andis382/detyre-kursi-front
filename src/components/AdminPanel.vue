<template>
  <div>
    <!-- Raporti i Hotelit -->
    <Card class="section-card">
      <template #title><div class="page-title">Paneli Administrativ</div></template>
      <template #subtitle>Raporti i përgjithshëm i hotelit</template>
      <template #content>
        <div v-if="report" class="report-grid">
          <Card class="stat-card">
            <template #content>
              <div class="stat-icon"><i class="pi pi-building"></i></div>
              <div class="stat-value">{{ report.dhomat.gjithsej }}</div>
              <div class="stat-label">Gjithsej Dhoma</div>
              <div class="stat-details">
                <span class="stat-ok">{{ report.dhomat.te_lira }} të lira</span>
                <span class="stat-warn">{{ report.dhomat.te_zena }} të zëna</span>
                <span class="stat-maint">{{ report.dhomat.ne_mirembajtje }} mirëmbajtje</span>
              </div>
            </template>
          </Card>
          <Card class="stat-card">
            <template #content>
              <div class="stat-icon"><i class="pi pi-calendar"></i></div>
              <div class="stat-value">{{ report.rezervimet.gjithsej }}</div>
              <div class="stat-label">Gjithsej Rezervime</div>
              <div class="stat-details">
                <span class="stat-ok">{{ report.rezervimet.aktive }} aktive</span>
                <span class="stat-warn">{{ report.rezervimet.anuluar }} anuluar</span>
              </div>
            </template>
          </Card>
          <Card class="stat-card">
            <template #content>
              <div class="stat-icon"><i class="pi pi-euro"></i></div>
              <div class="stat-value">{{ Number(report.financa.te_ardhura).toFixed(2) }}</div>
              <div class="stat-label">Të Ardhura (EUR)</div>
            </template>
          </Card>
        </div>
        <div v-else class="loading-report">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
        </div>
      </template>
    </Card>

    <!-- Tabs per Admin -->
    <TabView class="admin-tabs">
      <!-- Tab: Menaxho Dhomat -->
      <TabPanel header="Dhomat">
        <div class="tab-actions">
          <Button label="Shto Dhomë të Re" icon="pi pi-plus" @click="addRoomDialog = true" />
        </div>
        <DataTable :value="rooms" :loading="loadingRooms" stripedRows paginator :rows="10" responsiveLayout="stack">
          <Column field="numri_dhomes" header="Nr. Dhomës" sortable></Column>
          <Column header="Tipi">
            <template #body="slot">{{ slot.data.room_type?.emri_tipit }}</template>
          </Column>
          <Column field="kati" header="Kati" sortable></Column>
          <Column header="Statusi">
            <template #body="slot">
              <Tag :value="statusLabels[slot.data.statusi]" :severity="statusSeverity[slot.data.statusi]" />
            </template>
          </Column>
          <Column header="Veprime">
            <template #body="slot">
              <Select v-model="slot.data.statusi" :options="statusOptions" optionLabel="label" optionValue="value"
                @change="updateRoomStatus(slot.data)" style="width: 160px;" />
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- Tab: Çmimet -->
      <TabPanel header="Çmimet">
        <DataTable :value="roomTypes" :loading="loadingTypes" stripedRows responsiveLayout="stack">
          <Column field="emri_tipit" header="Tipi"></Column>
          <Column field="pershkrimi" header="Përshkrimi"></Column>
          <Column field="kapaciteti_max" header="Kapaciteti"></Column>
          <Column header="Çmimi (EUR/natë)">
            <template #body="slot">
              <InputNumber v-model="slot.data.cmimi_per_nate" :min="1" mode="decimal" :minFractionDigits="2" style="width: 120px;" />
            </template>
          </Column>
          <Column header="Veprime">
            <template #body="slot">
              <Button label="Ruaj" icon="pi pi-save" size="small" @click="updatePrice(slot.data)" />
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- Tab: Të gjitha Rezervimet -->
      <TabPanel header="Rezervimet">
        <DataTable :value="allReservations" :loading="loadingAllRes" stripedRows paginator :rows="10" responsiveLayout="stack">
          <Column field="id" header="ID" sortable style="width: 5%"></Column>
          <Column header="Klienti">
            <template #body="slot">{{ slot.data.user?.first_name }} {{ slot.data.user?.last_name }}</template>
          </Column>
          <Column header="Dhoma">
            <template #body="slot">{{ slot.data.room?.numri_dhomes }} ({{ slot.data.room?.room_type?.emri_tipit }})</template>
          </Column>
          <Column header="Check-in">
            <template #body="slot">{{ formatDate(slot.data.data_checkin) }}</template>
          </Column>
          <Column header="Check-out">
            <template #body="slot">{{ formatDate(slot.data.data_checkout) }}</template>
          </Column>
          <Column header="Statusi">
            <template #body="slot">
              <Tag :value="resStatusLabels[slot.data.statusi]" :severity="resStatusSeverity[slot.data.statusi]" />
            </template>
          </Column>
          <Column header="Totali">
            <template #body="slot">{{ Number(slot.data.shuma_totale).toFixed(2) }} EUR</template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>

    <!-- Dialog: Shto Dhomë -->
    <Dialog v-model:visible="addRoomDialog" modal header="Shto Dhomë të Re" :style="{width: '28vw'}" :pt="{
      header: { style: 'background-color: #eee3ce; color: #080808; border-top-left-radius: 12px; border-top-right-radius: 12px;' },
      content: { style: 'background-color: #f4f1ea; padding-top: 1rem;' },
      footer: { style: 'background-color: #f4f1ea; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;' }
    }">
      <div class="form-grid">
        <div class="field">
          <label>Numri i Dhomës</label>
          <InputText v-model="newRoom.numri_dhomes" fluid />
        </div>
        <div class="field">
          <label>Tipi i Dhomës</label>
          <Select v-model="newRoom.room_type_id" :options="roomTypes" optionLabel="emri_tipit" optionValue="id" fluid />
        </div>
        <div class="field">
          <label>Kati</label>
          <InputNumber v-model="newRoom.kati" :min="1" fluid />
        </div>
        <div class="field">
          <label>Përshkrimi</label>
          <InputText v-model="newRoom.pershkrimi" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Anulo" icon="pi pi-times" text @click="addRoomDialog = false" />
        <Button label="Shto" icon="pi pi-plus" @click="addRoom" :loading="addingRoom" class="confirm-btn" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ApiClient, API_ROOMS_ENDPOINT, API_ROOM_TYPES_ENDPOINT, API_RESERVATIONS_ALL_ENDPOINT, API_ADMIN_ADD_ROOM_ENDPOINT, API_ADMIN_ROOM_STATUS_ENDPOINT, API_ADMIN_ROOM_PRICE_ENDPOINT, API_ADMIN_REPORT_ENDPOINT } from '@/service/app.service';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

export default {
  name: 'AdminPanel',
  components: { Card, DataTable, Column, Button, Tag, Select, InputNumber, InputText, Dialog, TabView, TabPanel },
  data() {
    return {
      report: null,
      rooms: [],
      roomTypes: [],
      allReservations: [],
      loadingRooms: false,
      loadingTypes: false,
      loadingAllRes: false,
      addRoomDialog: false,
      addingRoom: false,
      newRoom: { numri_dhomes: '', room_type_id: null, kati: 1, pershkrimi: '' },
      statusLabels: { E_LIRE: 'E Lirë', E_ZENE: 'E Zënë', NE_MIREMBAJTJE: 'Mirëmbajtje' },
      statusSeverity: { E_LIRE: 'success', E_ZENE: 'warn', NE_MIREMBAJTJE: 'danger' },
      statusOptions: [
        { label: 'E Lirë', value: 'E_LIRE' },
        { label: 'E Zënë', value: 'E_ZENE' },
        { label: 'Mirëmbajtje', value: 'NE_MIREMBAJTJE' },
      ],
      resStatusLabels: { KONFIRMUAR: 'Konfirmuar', ANULUAR: 'Anuluar', PERFUNDUAR: 'Përfunduar', NE_PRITJE: 'Në Pritje' },
      resStatusSeverity: { KONFIRMUAR: 'success', ANULUAR: 'danger', PERFUNDUAR: 'info', NE_PRITJE: 'warn' },
    };
  },
  mounted() {
    this.fetchReport();
    this.fetchRooms();
    this.fetchRoomTypes();
    this.fetchAllReservations();
  },
  methods: {
    async fetchReport() {
      try {
        const { data } = await ApiClient.get(API_ADMIN_REPORT_ENDPOINT);
        this.report = data.result;
      } catch (e) {
        console.error('Report error', e);
      }
    },
    async fetchRooms() {
      this.loadingRooms = true;
      try {
        const { data } = await ApiClient.get(API_ROOMS_ENDPOINT);
        this.rooms = data.result;
      } finally { this.loadingRooms = false; }
    },
    async fetchRoomTypes() {
      this.loadingTypes = true;
      try {
        const { data } = await ApiClient.get(API_ROOM_TYPES_ENDPOINT);
        this.roomTypes = data.result;
      } finally { this.loadingTypes = false; }
    },
    async fetchAllReservations() {
      this.loadingAllRes = true;
      try {
        const { data } = await ApiClient.get(API_RESERVATIONS_ALL_ENDPOINT);
        this.allReservations = data.result;
      } finally { this.loadingAllRes = false; }
    },
    async addRoom() {
      this.addingRoom = true;
      try {
        const { data } = await ApiClient.post(API_ADMIN_ADD_ROOM_ENDPOINT, this.newRoom);
        this.$toast.add({ severity: 'success', summary: 'Sukses', detail: data.message, life: 3000 });
        this.addRoomDialog = false;
        this.newRoom = { numri_dhomes: '', room_type_id: null, kati: 1, pershkrimi: '' };
        this.fetchRooms();
        this.fetchReport();
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Gabim', detail: e.response?.data?.message || 'Gabim', life: 3000 });
      } finally { this.addingRoom = false; }
    },
    async updateRoomStatus(room) {
      try {
        const { data } = await ApiClient.post(API_ADMIN_ROOM_STATUS_ENDPOINT, { room_id: room.id, statusi: room.statusi });
        this.$toast.add({ severity: 'success', summary: 'Sukses', detail: data.message, life: 3000 });
        this.fetchReport();
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Gabim', detail: e.response?.data?.message || 'Gabim', life: 3000 });
      }
    },
    async updatePrice(type) {
      try {
        const { data } = await ApiClient.post(API_ADMIN_ROOM_PRICE_ENDPOINT, { room_type_id: type.id, cmimi_i_ri: type.cmimi_per_nate });
        this.$toast.add({ severity: 'success', summary: 'Sukses', detail: data.message, life: 3000 });
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Gabim', detail: e.response?.data?.message || 'Gabim', life: 3000 });
      }
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('sq-AL');
    },
  },
};
</script>

<style scoped>
.page-title { font-size: 1.8rem; font-weight: 700; color: #080808; }
.section-card { margin-bottom: 1.5rem; }
.report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.stat-card { text-align: center; border: 1px solid #ddd; border-radius: 8px; }
.stat-icon { font-size: 2rem; color: #080808; margin-bottom: 0.5rem; }
.stat-value { font-size: 2.5rem; font-weight: 700; color: #080808; }
.stat-label { font-size: 0.9rem; color: #888; margin-bottom: 0.5rem; }
.stat-details { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; font-size: 0.8rem; }
.stat-ok { color: green; }
.stat-warn { color: orange; }
.stat-maint { color: red; }
.admin-tabs { margin-top: 1rem; }
.tab-actions { margin-bottom: 1rem; }
.loading-report { text-align: center; padding: 2rem; }
.form-grid { display: flex; flex-direction: column; }
.field { margin-bottom: 1rem; }
.field label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
.confirm-btn { background-color: #eee3ce !important; border: 1px solid #080808 !important; color: #080808 !important; font-weight: bold !important; }
</style>
