import { YahooFinance } from 'yahoo-finance2';
const yf = new YahooFinance();
yf.quote('AAPL').then(console.log).catch(console.error);
