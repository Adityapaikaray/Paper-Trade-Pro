import yahooFinance from 'yahoo-finance2';

async function test() {
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - 1);
    const res = await yahooFinance.historical('AAPL', { period1, interval: '15m' });
    console.log("historical 15m SUCCESS", res.length);
  } catch (e) {
    console.log("historical 15m ERROR", e.message);
  }

  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - 1);
    const res2 = await yahooFinance.chart('AAPL', { period1, interval: '15m' });
    console.log("chart 15m SUCCESS", res2.quotes.length);
  } catch (e) {
    console.log("chart 15m ERROR", e.message);
  }
}
test();
