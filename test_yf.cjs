import yf from 'yahoo-finance2';
const yahooFinance = new (yf as any)();

async function test() {
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - 1);
    const res = await yahooFinance.historical('AAPL', { period1, interval: '15m' });
    console.log("historical 15m SUCCESS", res.length);
  } catch (e) {
    console.log("historical 15m ERROR", e.message);
  }
}
test();
