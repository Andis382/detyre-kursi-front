<template>
  <router-view />
</template>

<script>
export default {
  name: "App",
};
</script>


<style>
  html, body {
    margin: 0;
    padding: 0;
    height: auto !important;
    overflow-y: auto !important;
  }

  #app {
    min-height: 100vh;
    overflow-y: auto;
  }
</style>
