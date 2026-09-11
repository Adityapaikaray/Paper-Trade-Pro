import axios from 'axios';
axios.get("http://localhost:3000/api/market-data?symbols=AAPL,TSLA").then(r => console.log(r.data)).catch(console.error);
