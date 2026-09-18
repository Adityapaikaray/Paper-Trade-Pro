import yf from 'yahoo-finance2';
const instance = yf();
async function run() {
  const q = await instance.quote("RELIANCE.NS");
  console.log(q.regularMarketPrice);
}
run();
