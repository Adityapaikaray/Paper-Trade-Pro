import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
yahooFinance.quote(['AAPL', 'TSLA']).then(res => console.log(Array.isArray(res), res[0].symbol)).catch(console.error);
