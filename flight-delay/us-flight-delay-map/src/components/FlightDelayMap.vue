<template>
  <div>
    <div ref="map" style="height: 600px;"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  data() {
    return {
      map: null,
      airportsData: [], // 存储机场数据
    };
  },
  mounted() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY21pYW83IiwiYSI6ImNsbm5mZzhiMjA0eG4ydmt4a252cDk3NHUifQ.gbhBN0HEuQyj8a2E11fKmg'; // 替换为你的Mapbox access token
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      this.map = new mapboxgl.Map({
        container: this.$refs.map,
        style: 'mapbox://styles/mapbox/light-v10', // 替换为你想要的地图样式
        center: [-95.7129, 37.0902], // 美国的大致中心
        zoom: 3,
      });

      this.map.on('load', () => {
        this.loadAirportData();
        this.addAirportMarkers();
        this.addAirportNameLayer();
      });
    },
    loadAirportData() {
      // 从本地文件中加载机场数据
      this.airportsData = require('../assets/airport_delay_data.json');
    },
    addAirportMarkers() {
      this.airportsData.forEach(airport => {
        const { ORIGIN_AIRPORT, LATITUDE, LONGITUDE, AVG_Delay_Rate } = airport;
        let iconPath = 'airport1.ico';
        if (parseFloat(AVG_Delay_Rate) > 0.25 && parseFloat(AVG_Delay_Rate) <= 0.38) {
          iconPath = 'airport2.ico';
        } else if (parseFloat(AVG_Delay_Rate) > 0.38) {
          iconPath = 'airport3.ico';
        }

        // new mapboxgl.Marker({
        //   color: 'red',
        //   draggable: false,
        //   iconSize: [16, 16],
        //   element: this.createCustomMarker(iconPath),
        // })
        //   .setLngLat([LONGITUDE, LATITUDE])
        //   .addTo(this.map);
        const marker = new mapboxgl.Marker({
          color: 'red',
          draggable: false,
          iconSize: [16, 16],
          element: this.createCustomMarker(iconPath),
        })
          .setLngLat([LONGITUDE, LATITUDE])
          .addTo(this.map);

        // 添加点击事件
        marker.getElement().addEventListener('click', () => {
          new mapboxgl.Popup({ offset: 25 })
            .setLngLat([LONGITUDE, LATITUDE])
            .setHTML(`<b>${ORIGIN_AIRPORT}</b><br>Avg Delay Rate: ${AVG_Delay_Rate}`)
            .addTo(this.map);
        });
      });
    },
    createCustomMarker(iconPath) {
      const container = document.createElement('div');
      container.className = 'marker';
      container.style.backgroundImage = `url(${iconPath})`;
      container.style.width = '22px';
      container.style.height = '22px';
      return container;
    },
    addAirportNameLayer() {
      this.map.addLayer({
        id: 'airport-names',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: this.airportsData.map(airport => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [airport.LONGITUDE, airport.LATITUDE],
              },
              properties: {
                title: airport.ORIGIN_AIRPORT,
                avgDelayRate: airport.AVG_Delay_Rate
              },
            })),
          },
        },
        layout: {
          'text-field': ['get', 'title'],
          'text-size': 8,
          'text-offset': [0, 2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': 'black',
        },
      });
      this.map.on('click', 'airport-names', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const title = e.features[0].properties.title;
        const avgDelayRate = e.features[0].properties.avgDelayRate;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<b>${title}</b><br>Avg Delay Rate: ${avgDelayRate}`)
          .addTo(this.map);
      });
    },
  },
};

</script>

<style>
/* 根据需要自定义样式 */
</style>
