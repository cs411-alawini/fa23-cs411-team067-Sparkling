<template>
  <a href="http://localhost:3000/" class="login-link">Login</a>
  <div class="search-container">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Waiting For Input..."
    />
    <button @click="doSearch(target_offset, target_limit)">🔍</button>
    <br />
    <input type="radio" v-model="searchType" value="city" checked /> City
    <input type="radio" v-model="searchType" value="airport" /> Airport
    <input type="radio" v-model="searchType" value="flight" /> Flight
  </div>
  <div v-if="table.rows.length > 0">
    <div class="table-container">
      <table-lite
        :is-loading="table.isLoading"
        :columns="table.columns"
        :rows="table.rows"
        :total="table.totalRecordCount"
        :sortable="table.sortable"
        :messages="table.messages"
        @do-search="doSearch"
        :page-Size="table.pagesize"
        @is-finished="table.isLoading = false"
      ></table-lite>
    </div>
  </div>
  <div v-else>
    <p>No Searching Results</p>
  </div>
</template>

<script>
import axios from "axios";
import TableLite from "vue3-table-lite";
import { defineComponent, reactive, ref } from "vue";

export default defineComponent({
  components: {
    TableLite,
  },
  setup() {
    // Table config

    const table = reactive({
      isLoading: false,
      pagesize: 20,
      columns: [
        
        {
          label: "City",
          field: "ori_city",
          width: "10%",
          sortable: true,
        },
        {
          label: "DESTINATION_CITY",
          field: "des_city",
          width: "3%",
          sortable: true,
          isKey: true,
        },
        {
          label: "ORIGIN_AIRPORT",
          field: "ORIGIN_AIRPORT",
          width: "15%",
          sortable: true,
        },
        {
          label: "DESTINATION_AIRPORT",
          field: "DESTINATION_AIRPORT",
          width: "15%",
          sortable: true,
        },
        {
          label: "DELAY_RATE",
          field: "delay_rate",
          width: "15%",
          sortable: true,
        },
      ],
      rows: [],
      totalRecordCount: 0,
      sortable: {
        order: "city",
        sort: "asc",
      },
    });

    // Search configuration
    const searchQuery = ref("");
    const searchType = ref("city");
    const target_offset = ref();
    const target_limit = ref();
    /**
     * Combined Search and Table update Event
     */
    const sortData = (field, order) => {
      table.rows.sort((a, b) => {
        if (order === "asc") {
          return a[field] > b[field] ? 1 : -1;
        } else {
          return a[field] < b[field] ? 1 : -1;
        }
      });
    };
    const data_normalized = (offst, limit, origin_data) => {
      let data = [];
      data = origin_data.slice(offst, limit);
      console.log("offst:", offst);
      console.log("limit:", limit);
      console.log(data);
      return data;
    };

    const doSearch = async (offset, limit, order, sort) => {
      if (offset >= 10) {
        limit = 20;
      }
      if (offset >= 20) {
        limit = 30;
      }
      if (offset >= 30) {
        limit = 40;
      }
      if (offset >= 40) {
        limit = 50;
      }
      target_limit.value = limit;
      target_offset.value = offset;
      table.isLoading = true;
      let baseUrl = "http://localhost:3000";
      let url = `${baseUrl}/delay-history/`;

      switch (searchType.value) {
        case "city":
          url += `city/${searchQuery.value}`;
          break;
        case "airport":
          url += `airport/${searchQuery.value}`;
          break;
        case "flight":
          // const [airline_IATA, number] = searchQuery.value.split('-');
          // url += `flight/${airline_IATA}/${number}`;
          break;
      }

      try {
        console.log(url);
        const response = await axios.get(url);
        table.rows = response.data;
        console.log("table:", table.rows);
      } catch (error) {
        console.error("Error fetching data:", error);
        table.rows = [];
      } finally {
        table.isLoading = false;
      }

      table.totalRecordCount = table.rows.length;
      // Update table sorting and pagination if needed
      sortData(order, sort);
      // Logic for ascending sort
      let temp = table.rows.slice();
      table.rows = data_normalized(offset, limit, temp);
      console.log(table.rows);
      // Update according to actual data
      table.sortable.order = order;
      table.sortable.sort = sort;
    };

    // Initial Data Load
    doSearch(0, 10, table.sortable.order, table.sortable.sort);

    return {
      table,
      doSearch,
      searchQuery,
      searchType,
      target_offset,
      target_limit,
    };
  },
});
</script>

<style>
body,
html {
  height: 100%;
  margin: 0;
  font-family: "Times New Roman", Times, serif;
}

.search-container {
  position: absolute;
  top: 25%; /* 页面上方 1/4 的位置 */
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

input[type="text"] {
  width: 300px;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 60px;
  background-color: #4caf50;
  color: white;
  padding: 12px 12px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3a366f;
}

input[type="radio"] {
  margin: 0 10px;
}
button.search-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
}

button.search-button:hover {
  color: #3b6d96;
}

.table-container {
  width: 60%; /* 调整为所需的宽度 */
  margin: 300px auto 0; /* 顶部 100px，左右自动居中 */
  overflow-x: auto; /* 如果表格宽度超出容器宽度，允许滚动 */
}
</style>
