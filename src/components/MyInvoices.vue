<template>
  <div>
    <Card>
      <template #title><div class="page-title">Faturat e Mia</div></template>
      <template #subtitle>Lista e faturave bazuar në pagesat e kryera</template>
      <template #content>
        <DataTable :value="invoices" :loading="loading" stripedRows paginator :rows="10" responsiveLayout="stack"
          emptyMessage="Nuk keni asnjë faturë.">
          <Column field="id" header="Faturë ID" sortable style="width: 8%"></Column>
          <Column header="Rezervim">
            <template #body="slot">#{{ slot.data.reservation_id }}</template>
          </Column>
          <Column header="Dhoma">
            <template #body="slot">
              {{ slot.data.reservation?.room?.numri_dhomes }} ({{ slot.data.reservation?.room?.room_type?.emri_tipit }})
            </template>
          </Column>
          <Column header="Shuma">
            <template #body="slot">{{ Number(slot.data.shuma_totale).toFixed(2) }} EUR</template>
          </Column>
          <Column header="TVSH (20%)">
            <template #body="slot">{{ Number(slot.data.tvsh).toFixed(2) }} EUR</template>
          </Column>
          <Column header="Totali Final">
            <template #body="slot">
              <b>{{ Number(slot.data.shuma_perfundimtare).toFixed(2) }} EUR</b>
            </template>
          </Column>
          <Column header="Data">
            <template #body="slot">{{ formatDate(slot.data.created_at) }}</template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script>
import { ApiClient, API_INVOICES_ENDPOINT } from '@/service/app.service';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

export default {
  name: 'MyInvoices',
  components: { Card, DataTable, Column },
  data() {
    return {
      invoices: [],
      loading: false,
    };
  },
  mounted() {
    this.fetchInvoices();
  },
  methods: {
    async fetchInvoices() {
      this.loading = true;
      try {
        const { data } = await ApiClient.get(API_INVOICES_ENDPOINT);
        this.invoices = data.result;
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Gabim', detail: 'Nuk u arrit të merren faturat.', life: 3000 });
      } finally {
        this.loading = false;
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
</style>
