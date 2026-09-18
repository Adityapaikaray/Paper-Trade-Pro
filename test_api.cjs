const axios = require('axios');
axios.get("http://localhost:3000/api/quotes?symbols=NSE:RELIANCE").then(res => console.log(res.data)).catch(e => console.error(e.response ? e.response.data : e.message));
