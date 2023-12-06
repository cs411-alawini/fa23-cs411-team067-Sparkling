<template>
  <div id="app">
    <FlightDelayMap />
  </div>
</template>

<script>
import FlightDelayMap from './components/FlightDelayMap.vue';

export default {
  name: 'App',
  components: {
    FlightDelayMap,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
