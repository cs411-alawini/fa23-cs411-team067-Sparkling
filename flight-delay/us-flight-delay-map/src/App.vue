<template>
  <div id="app">
    <FlightDelayMap />
    <tableshow></tableshow>
  </div>
</template>

<script>
import FlightDelayMap from './components/FlightDelayMap.vue';
import tableshow from './components/SearchBox.vue'
export default {
  name: 'App',
  components: {
    FlightDelayMap,
    tableshow
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
