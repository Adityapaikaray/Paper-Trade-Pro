import yf from 'yahoo-finance2';
const yahooFinance = new (yf as any)();
yahooFinance.quote('RELIANCE.NS').then(console.log).catch(console.error);
