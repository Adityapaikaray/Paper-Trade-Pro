import yahooFinance from 'yahoo-finance2';
yahooFinance.quote(['RELIANCE.NS']).then(console.log).catch(console.error);
