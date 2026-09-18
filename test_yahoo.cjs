const yahooFinance = require('yahoo-finance2').default; // Ah, wait! Is it .default for CJS?

async function test() {
  try {
    const res = await yahooFinance.quote('RELIANCE.NS');
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
test();
