const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "import YahooFinance from 'yahoo-finance2';\nconst yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });",
  "import yahooFinancePkg from 'yahoo-finance2';\nconst YahooFinanceClass = (yahooFinancePkg as any).default || yahooFinancePkg;\nconst yahooFinance = new YahooFinanceClass({ suppressNotices: ['yahooSurvey'] });"
);

fs.writeFileSync('server.ts', code);
