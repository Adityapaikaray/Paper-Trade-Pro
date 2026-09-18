import yf from 'yahoo-finance2';
const yahooFinance = new (yf as any)();

async function test() {
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - 7);
    const res = await yahooFinance.chart('AAPL', { period1, interval: '15m' });
    console.log("null check:", res.quotes.filter(q => q.close == null).length);
  } catch (e) {
    console.log("chart 15m ERROR", e.message);
  }
}
test();
