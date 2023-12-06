<template>
  <div>
    <div ref="map" style="height: 600px;"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'
export default {
  data() {
    return {
      map: null,
      airportData: [], // 存储从 JSON 文件中读取的机场数据
    };
  },
  mounted() {
    // 从 JSON 文件中读取机场数据
    this.fetchAirportData();

    // 初始化地图
    this.initializeMap();
  },
  methods: {
    fetchAirportData() {
      // 使用 fetch 或其他方式从 JSON 文件中读取机场数据
      fetch('/path/to/airport_delay_data.json')
        .then(response => response.json())
        .then(data => {
          this.airportData = data;
          // 数据获取后，初始化地图
          this.initializeMap();
        })
        .catch(error => console.error('Error fetching airport data:', error));
    },
    initializeMap() {
      // 使用 Mapbox GL JS 初始化地图
      mapboxgl.accessToken = 'pk.eyJ1IjoiY21pYW83IiwiYSI6ImNsbm5mZzhiMjA0eG4ydmt4a252cDk3NHUifQ.gbhBN0HEuQyj8a2E11fKmg'; // 请替换为你的 Mapbox access token
      this.map = new mapboxgl.Map({
        container: this.$refs.map,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-98.5795, 39.8283], // 地图中心坐标
        zoom: 3,
      });

      // 在地图上添加机场图层
      this.addAirportLayer();
    },
    addAirportLayer() {
      // 创建一个图层用于显示机场和延误率
      this.map.on('load', () => {
        this.map.addSource('airports', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: this.airportData.map(airport => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [airport.LONGITUDE, airport.LATITUDE],
              },
              properties: {
                title: airport.ORIGIN_AIRPORT,
                description: `Delay Rate: ${airport.AVG_Delay_Rate}`,
              },
            })),
          },
        });

        // 添加一个标记图层用于显示机场
        this.map.addLayer({
          id: 'airports',
          type: 'symbol',
          source: 'airports',
          layout: {
            'icon-image': ['match', ['get', 'AVG_Delay_Rate'],
              '0.0', 'airport1',
              '0.1', 'airport2',
              '0.3', 'airport3',
              'airport1' // 默认图标
            ],
            'icon-allow-overlap': true,
          },
        });

        // 添加弹出窗口
        this.map.on('click', 'airports', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const description = e.features[0].properties.description;

          // 弹出窗口内容
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(this.map);
        });

        // 更换光标样式
        this.map.on('mouseenter', 'airports', () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'airports', () => {
          this.map.getCanvas().style.cursor = '';
        });
      });
    },
  },
};
</script>

<style>
/* 你可以添加一些样式以适应你的项目需求 */
</style>
