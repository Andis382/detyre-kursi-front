<template>
  <div>
    <Card>
      <template #title><div class="page-title">Rezervimet e Mia</div></template>
      <template #subtitle>Historiku i të gjitha rezervimeve tuaja</template>
      <template #content>
        <DataTable :value="reservations" :loading="loading" stripedRows paginator :rows="10" responsiveLayout="stack"
          emptyMessage="Nuk keni asnjë rezervim.">
          <Column field="id" header="ID" sortable style="width: 5%"></Column>
          <Column header="Dhoma" sortable sortField="room.numri_dhomes">
            <template #body="slot">
              {{ slot.data.room?.numri_dhomes }} ({{ slot.data.room?.room_type?.emri_tipit }})
            </template>
          </Column>
          <Column header="Check-in" sortable sortField="data_checkin">
            <template #body="slot">{{ formatDate(slot.data.data_checkin) }}</template>
          </Column>
          <Column header="Check-out" sortable sortField="data_checkout">
            <template #body="slot">{{ formatDate(slot.data.data_checkout) }}</template>
          </Column>
          <Column field="numri_personave" header="Persona" style="width: 8%"></Column>
          <Column header="Statusi" sortable sortField="statusi">
            <template #body="slot">
              <Tag :value="statusLabels[slot.data.statusi]" :severity="statusSeverity[slot.data.statusi]" />
            </template>
          </Column>
          <Column header="Totali">
            <template #body="slot">{{ Number(slot.data.shuma_totale).toFixed(2) }} EUR</template>
          </Column>
          <Column header="Paguar">
            <template #body="slot">
              <span :class="{ 'paid-full': slot.data.shuma_paguar >= slot.data.shuma_totale }">
                {{ Number(slot.data.shuma_paguar).toFixed(2) }} EUR
              </span>
            </template>
          </Column>
          <Column header="Veprime">
            <template #body="slot">
              <Button v-if="slot.data.statusi === 'KONFIRMUAR' && slot.data.shuma_paguar < slot.data.shuma_totale"
                icon="pi pi-credit-card" label="Paguaj" severity="success" text size="small" @click="openPayment(slot.data)" />
              <Button v-if="slot.data.statusi === 'KONFIRMUAR'"
                icon="pi pi-times" label="Anulo" severity="danger" text size="small" @click="cancelReservation(slot.data)" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog pagese -->
    <Dialog v-model:visible="paymentDialog" modal header="Regjistro Pagesën" :style="{width: '28vw'}" :pt="{
      header: { style: 'background-color: #eee3ce; color: #080808; border-top-left-radius: 12px; border-top-right-radius: 12px;' },
      content: { style: 'background-color: #f4f1ea; padding-top: 1rem;' },
      footer: { style: 'background-color: #f4f1ea; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;' }
    }">
      <div v-if="selectedReservation" class="payment-details">
        <div class="detail-row"><span>Rezervim ID:</span><b>#{{ selectedReservation.id }}</b></div>
        <div class="detail-row"><span>Shuma për tu paguar:</span><b>{{ remainingAmount.toFixed(2) }} EUR</b></div>
        <div class="detail-row"><span>TVSH (20%):</span><b>{{ (remainingAmount * 0.2).toFixed(2) }} EUR</b></div>
        <Divider />
        <div class="detail-row total"><span>Totali me TVSH:</span><b>{{ (remainingAmount * 1.2).toFixed(2) }} EUR</b></div>
        <div class="field" style="margin-top: 1rem;">
          <label>Metoda e Pagesës</label>
          <Select v-model="paymentMethod" :options="paymentMethods" optionLabel="label" optionValue="value" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Anulo" icon="pi pi-times" text @click="paymentDialog = false" />
        <Button label="Konfirmo Pagesën" icon="pi pi-check" @click="confirmPayment" :loading="paying" class="confirm-btn" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ApiClient, API_RESERVATIONS_ENDPOINT, API_PAYMENTS_ENDPOINT } from '@/service/app.service';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Select from 'primevue/select';

export default {
  name: 'MyReservations',
  components: { Card, DataTable, Column, Button, Tag, Dialog, Divider, Select },
  data() {
    return {
      reservations: [],
      loading: false,
      paymentDialog: false,
      selectedReservation: null,
      paymentMethod: 'CASH',
      paying: false,
      paymentMethods: [
        { label: 'Cash', value: 'CASH' },
        { label: 'Kartë Krediti', value: 'KARTE_KREDITI' },
        { label: 'Kartë Debiti', value: 'KARTE_DEBITI' },
        { label: 'Transfer Bankar', value: 'TRANSFER_BANKAR' },
      ],
      statusLabels: {
        KONFIRMUAR: 'Konfirmuar',
        ANULUAR: 'Anuluar',
        PERFUNDUAR: 'Përfunduar',
        NE_PRITJE: 'Në Pritje',
      },
      statusSeverity: {
        KONFIRMUAR: 'success',
        ANULUAR: 'danger',
        PERFUNDUAR: 'info',
        NE_PRITJE: 'warn',
      },
    };
  },
  computed: {
    remainingAmount() {
      if (!this.selectedReservation) return 0;
      return this.selectedReservation.shuma_totale - this.selectedReservation.shuma_paguar;
    },
  },
  mounted() {
    this.fetchReservations();
  },
  methods: {
    async fetchReservations() {
      this.loading = true;
      try {
        const { data } = await ApiClient.get(API_RESERVATIONS_ENDPOINT);
        this.reservations = data.result;
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Gabim', detail: 'Nuk u arrit të merren rezervimet.', life: 3000 });
      } finally {
        this.loading = false;
      }
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('sq-AL');
    },
    openPayment(reservation) {
      this.selectedReservation = reservation;
      this.paymentMethod = 'CASH';
      this.paymentDialog = true;
    },
    async confirmPayment() {
      this.paying = true;
      try {
        const { data } = await ApiClient.post(API_PAYMENTS_ENDPOINT, {
          reservation_id: this.selectedReservation.id,
          metoda_pageses: this.paymentMethod,
        });
        this.$toast.add({ severity: 'success', summary: 'Sukses', detail: data.message, life: 3000 });
        this.paymentDialog = false;
        this.fetchReservations();
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Gabim', detail: e.response?.data?.message || 'Gabim gjatë pagesës', life: 3000 });
      } finally {
        this.paying = false;
      }
    },
    cancelReservation(reservation) {
      this.$confirm.require({
        message: 'Jeni të sigurt që doni të anuloni rezervimin #' + reservation.id + '?',
        header: 'Konfirmoni Anulimin',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Po, Anulo',
        rejectLabel: 'Jo',
        accept: async () => {
          try {
            const { data } = await ApiClient.post(API_RESERVATIONS_ENDPOINT + '/' + reservation.id + '/cancel');
            this.$toast.add({ severity: 'success', summary: 'Sukses', detail: data.message, life: 3000 });
            this.fetchReservations();
          } catch (e) {
            this.$toast.add({ severity: 'error', summary: 'Gabim', detail: e.response?.data?.message || 'Gabim', life: 3000 });
          }
        },
      });
    },
  },
};
</script>

<style scoped>
.page-title { font-size: 1.8rem; font-weight: 700; color: #080808; }
.paid-full { color: green; font-weight: 600; }
.payment-details { padding: 0.5rem 0; }
.detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
.detail-row.total { font-size: 1.2rem; font-weight: 700; color: #080808; }
.field label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
.confirm-btn { background-color: #eee3ce !important; border: 1px solid #080808 !important; color: #080808 !important; font-weight: bold !important; }
</style>
