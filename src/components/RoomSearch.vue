<template>
  <div>
    <Card>
      <template #title><div class="page-title">Kërko Dhoma të Lira</div></template>
      <template #subtitle>Filtrim sipas datave, numrit të personave dhe tipit të dhomës</template>
      <template #content>
        <div class="search-form">
          <div class="search-row">
            <div class="field">
              <label>Data Check-in</label>
              <DatePicker v-model="checkin" dateFormat="yy-mm-dd" :minDate="today" fluid showIcon />
            </div>
            <div class="field">
              <label>Data Check-out</label>
              <DatePicker v-model="checkout" dateFormat="yy-mm-dd" :minDate="minCheckout" fluid showIcon />
            </div>
            <div class="field">
              <label>Numri i Personave</label>
              <InputNumber v-model="personave" :min="1" :max="10" fluid />
            </div>
            <div class="field field-btn">
              <Button label="Kërko" icon="pi pi-search" @click="search" :loading="loading" />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <Card v-if="searched" class="results-card">
      <template #title>
        <div class="results-title">
          Dhoma të Disponueshme
          <Tag :value="rooms.length + ' dhoma'" severity="info" />
        </div>
      </template>
      <template #content>
        <div v-if="rooms.length === 0" class="empty-state">
          <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc;"></i>
          <p>Nuk ka dhoma të lira për këto data dhe parametra.</p>
        </div>

        <div v-else class="rooms-grid">
          <Card v-for="room in rooms" :key="room.id" class="room-card">
            <template #content>
              <div class="room-header">
                <div>
                  <h3>Dhoma {{ room.numri_dhomes }}</h3>
                  <Tag :value="room.room_type.emri_tipit" />
                </div>
                <div class="room-price">
                  <span class="price-per-night">{{ room.room_type.cmimi_per_nate }} EUR/natë</span>
                  <span class="price-total">{{ Number(room.shuma_totale).toFixed(2) }} EUR totali</span>
                </div>
              </div>
              <div class="room-details">
                <span><i class="pi pi-users"></i> Max {{ room.room_type.kapaciteti_max }} persona</span>
                <span><i class="pi pi-building"></i> Kati {{ room.kati }}</span>
                <span><i class="pi pi-moon"></i> {{ room.netet }} netë</span>
              </div>
              <p class="room-desc">{{ room.room_type.pershkrimi }}</p>
              <Button label="Rezervo Tani" icon="pi pi-check" class="book-btn" @click="openBooking(room)" />
            </template>
          </Card>
        </div>
      </template>
    </Card>

    <!-- Dialog për rezervim -->
    <Dialog v-model:visible="bookingDialog" modal header="Konfirmo Rezervimin" :style="{width: '30vw'}" :pt="{
      header: { style: 'background-color: #eee3ce; color: #080808; border-top-left-radius: 12px; border-top-right-radius: 12px;' },
      content: { style: 'background-color: #f4f1ea; padding-top: 1rem;' },
      footer: { style: 'background-color: #f4f1ea; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;' }
    }">
      <div v-if="selectedRoom" class="booking-details">
        <div class="detail-row"><span>Dhoma:</span><b>{{ selectedRoom.numri_dhomes }} ({{ selectedRoom.room_type.emri_tipit }})</b></div>
        <div class="detail-row"><span>Check-in:</span><b>{{ formatDate(checkin) }}</b></div>
        <div class="detail-row"><span>Check-out:</span><b>{{ formatDate(checkout) }}</b></div>
        <div class="detail-row"><span>Netë:</span><b>{{ selectedRoom.netet }}</b></div>
        <div class="detail-row"><span>Persona:</span><b>{{ personave }}</b></div>
        <Divider />
        <div class="detail-row total"><span>Shuma Totale:</span><b>{{ Number(selectedRoom.shuma_totale).toFixed(2) }} EUR</b></div>
      </div>
      <template #footer>
        <Button label="Anulo" icon="pi pi-times" text @click="bookingDialog = false" />
        <Button label="Konfirmo Rezervimin" icon="pi pi-check" @click="confirmBooking" :loading="booking" class="confirm-btn" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ApiClient, API_ROOMS_AVAILABLE_ENDPOINT, API_RESERVATIONS_ENDPOINT } from '@/service/app.service';
import Card from 'primevue/card';
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';

export default {
  name: 'RoomSearch',
  components: { Card, DatePicker, InputNumber, Button, Tag, Dialog, Divider },
  data() {
    return {
      checkin: null,
      checkout: null,
      personave: 1,
      rooms: [],
      loading: false,
      searched: false,
      bookingDialog: false,
      selectedRoom: null,
      booking: false,
      today: new Date(),
    };
  },
  computed: {
    minCheckout() {
      if (!this.checkin) return this.today;
      const d = new Date(this.checkin);
      d.setDate(d.getDate() + 1);
      return d;
    },
  },
  methods: {
    async search() {
      if (!this.checkin || !this.checkout) {
        this.$toast.add({ severity: 'warn', summary: 'Kujdes', detail: 'Ju lutem zgjidhni datat e check-in dhe check-out.', life: 3000 });
        return;
      }
      this.loading = true;
      try {
        const { data } = await ApiClient.get(API_ROOMS_AVAILABLE_ENDPOINT, {
          params: {
            data_checkin: this.formatDateISO(this.checkin),
            data_checkout: this.formatDateISO(this.checkout),
            numri_personave: this.personave,
          },
        });
        this.rooms = data.result;
        this.searched = true;
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Gabim', detail: e.response?.data?.message || 'Gabim gjatë kërkimit', life: 3000 });
      } finally {
        this.loading = false;
      }
    },
    openBooking(room) {
      this.selectedRoom = room;
      this.bookingDialog = true;
    },
    async confirmBooking() {
      this.booking = true;
      try {
        await ApiClient.post(API_RESERVATIONS_ENDPOINT, {
          room_id: this.selectedRoom.id,
          data_checkin: this.formatDateISO(this.checkin),
          data_checkout: this.formatDateISO(this.checkout),
          numri_personave: this.personave,
        });
        this.$toast.add({ severity: 'success', summary: 'Sukses', detail: 'Rezervimi u krye me sukses!', life: 3000 });
        this.bookingDialog = false;
        this.search();
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Gabim', detail: e.response?.data?.message || 'Gabim gjatë rezervimit', life: 3000 });
      } finally {
        this.booking = false;
      }
    },
    formatDate(d) {
      if (!d) return '';
      const date = new Date(d);
      return date.toLocaleDateString('sq-AL');
    },
    formatDateISO(d) {
      if (!d) return '';
      const date = new Date(d);
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    },
  },
};
</script>

<style scoped>
.page-title { font-size: 1.8rem; font-weight: 700; color: #080808; }
.search-form { margin-top: 1rem; }
.search-row { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
.field { flex: 1; min-width: 180px; }
.field label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #080808; }
.field-btn { flex: 0 0 auto; padding-bottom: 2px; }
.results-card { margin-top: 1.5rem; }
.results-title { display: flex; align-items: center; gap: 1rem; font-size: 1.4rem; font-weight: 600; }
.empty-state { text-align: center; padding: 3rem; color: #999; }
.rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
.room-card { border: 1px solid #ddd; border-radius: 8px; }
.room-header { display: flex; justify-content: space-between; align-items: flex-start; }
.room-header h3 { margin: 0 0 0.5rem 0; color: #080808; }
.room-price { text-align: right; }
.price-per-night { display: block; font-size: 0.85rem; color: #666; }
.price-total { display: block; font-size: 1.2rem; font-weight: 700; color: #080808; }
.room-details { display: flex; gap: 1.5rem; margin: 1rem 0; color: #555; font-size: 0.9rem; }
.room-details i { margin-right: 0.3rem; }
.room-desc { color: #777; font-size: 0.85rem; margin-bottom: 1rem; }
.book-btn { width: 100%; }
.booking-details { padding: 0.5rem 0; }
.detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
.detail-row.total { font-size: 1.2rem; color: #080808; }
.confirm-btn { background-color: #eee3ce !important; border: 1px solid #080808 !important; color: #080808 !important; font-weight: bold !important; }
</style>
