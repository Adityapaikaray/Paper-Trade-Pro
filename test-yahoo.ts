import yahooFinance from 'yahoo-finance2';
yahooFinance.suppressNotices(['yahooSurvey']);
yahooFinance.quote('AAPL').then(console.log).catch(console.error);
