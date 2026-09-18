import { YahooFinance } from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function test() {
  try {
    const res = await yahooFinance.quote('RELIANCE.NS');
    console.log(res.regularMarketPrice);
  } catch (e) {
    console.error(e);
  }
}
test();
